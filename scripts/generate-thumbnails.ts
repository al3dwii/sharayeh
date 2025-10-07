#!/usr/bin/env tsx
/**
 * Generate Thumbnails for PowerPoint Templates
 * 
 * This script:
 * 1. Lists all .pptx files in S3 bucket
 * 2. Downloads each PPTX file
 * 3. Extracts the first slide as an image
 * 4. Generates a thumbnail (400x300px)
 * 5. Uploads thumbnail to S3 with same name but .png extension
 * 
 * Usage:
 *   npm run generate-thumbnails
 *   npm run generate-thumbnails -- --category=business
 *   npm run generate-thumbnails -- --dry-run
 */

import { S3Client, ListObjectsV2Command, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import sharp from 'sharp';
import AdmZip from 'adm-zip';

// Load environment variables
import * as dotenv from 'dotenv';
dotenv.config();

// Configuration
const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || 'isharayeh';
const REGION = process.env.AWS_REGION || 'eu-north-1';
const THUMBNAIL_WIDTH = 800;
const THUMBNAIL_HEIGHT = 600;

// Parse command line arguments
const args = process.argv.slice(2);
const categoryFilter = args.find(arg => arg.startsWith('--category='))?.split('=')[1];
const isDryRun = args.includes('--dry-run');

// Initialize S3 Client
const s3Client = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

/**
 * Convert S3 stream to buffer
 */
async function streamToBuffer(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('error', (err) => reject(err));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

/**
 * Extract first slide image from PPTX file
 */
async function extractFirstSlideImage(pptxBuffer: Buffer): Promise<Buffer | null> {
  try {
    const tempDir = path.join(os.tmpdir(), `pptx-${Date.now()}`);
    fs.mkdirSync(tempDir, { recursive: true });

    // Extract PPTX (it's a ZIP file)
    const zip = new AdmZip(pptxBuffer);
    zip.extractAllTo(tempDir, true);

    // Find the first slide image
    // PPTX structure: ppt/slides/slide1.xml references ppt/media/image*.png|jpg
    const mediaDir = path.join(tempDir, 'ppt', 'media');
    
    if (!fs.existsSync(mediaDir)) {
      console.warn('  ⚠️  No media folder found in PPTX');
      return null;
    }

    const mediaFiles = fs.readdirSync(mediaDir)
      .filter(file => /\.(png|jpg|jpeg)$/i.test(file))
      .sort(); // Usually image1.png is the first slide background

    if (mediaFiles.length === 0) {
      console.warn('  ⚠️  No images found in PPTX media folder');
      return null;
    }

    // Use the first image found
    const firstImage = path.join(mediaDir, mediaFiles[0]);
    const imageBuffer = fs.readFileSync(firstImage);

    // Clean up temp directory
    fs.rmSync(tempDir, { recursive: true, force: true });

    return imageBuffer;
  } catch (error) {
    console.error('  ❌ Error extracting slide image:', error);
    return null;
  }
}

/**
 * Generate thumbnail from image buffer
 */
async function generateThumbnail(imageBuffer: Buffer): Promise<Buffer> {
  return sharp(imageBuffer)
    .resize(THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .png()
    .toBuffer();
}

/**
 * Create a simple placeholder thumbnail with template name
 */
async function createPlaceholderThumbnail(templateName: string, category: string): Promise<Buffer> {
  // Create a simple colored background based on category
  const colors: Record<string, string> = {
    business: '#3B82F6', // blue
    education: '#10B981', // green
    children: '#F59E0B', // amber
    collection: '#8B5CF6', // purple
  };
  
  const color = colors[category] || '#6B7280'; // gray fallback
  
  // Create SVG
  const svg = `
    <svg width="${THUMBNAIL_WIDTH}" height="${THUMBNAIL_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${color}"/>
      <text x="50%" y="50%" 
            font-family="Arial, sans-serif" 
            font-size="48" 
            fill="white" 
            text-anchor="middle" 
            dominant-baseline="middle">
        ${templateName}
      </text>
      <text x="50%" y="70%" 
            font-family="Arial, sans-serif" 
            font-size="24" 
            fill="rgba(255,255,255,0.8)" 
            text-anchor="middle" 
            dominant-baseline="middle">
        ${category}
      </text>
    </svg>
  `;
  
  return sharp(Buffer.from(svg))
    .png()
    .toBuffer();
}

/**
 * Process a single PPTX file
 */
async function processPPTXFile(key: string, category: string): Promise<boolean> {
  const fileName = path.basename(key);
  const fileNameWithoutExt = fileName.replace(/\.pptx?$/i, '');
  const thumbnailKey = key.replace(/\.pptx?$/i, '.png');

  console.log(`\n📄 Processing: ${key}`);

  try {
    // Check if thumbnail already exists
    try {
      await s3Client.send(new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: thumbnailKey,
      }));
      console.log('  ✅ Thumbnail already exists, skipping...');
      return true;
    } catch (error: any) {
      if (error.name !== 'NoSuchKey') {
        throw error;
      }
      // Thumbnail doesn't exist, continue processing
    }

    // Download PPTX file
    console.log('  📥 Downloading PPTX...');
    const getCommand = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });
    const response = await s3Client.send(getCommand);
    const pptxBuffer = await streamToBuffer(response.Body as Readable);

    // Extract first slide image
    console.log('  🖼️  Extracting first slide...');
    let imageBuffer = await extractFirstSlideImage(pptxBuffer);

    // If extraction failed, create placeholder
    if (!imageBuffer) {
      console.log('  🎨 Creating placeholder thumbnail...');
      imageBuffer = await createPlaceholderThumbnail(fileNameWithoutExt, category);
    }

    // Generate thumbnail
    console.log('  ✂️  Generating thumbnail...');
    const thumbnailBuffer = await generateThumbnail(imageBuffer);

    // Upload to S3
    if (isDryRun) {
      console.log(`  🔍 [DRY RUN] Would upload thumbnail to: ${thumbnailKey}`);
    } else {
      console.log(`  📤 Uploading thumbnail to: ${thumbnailKey}`);
      await s3Client.send(new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: thumbnailKey,
        Body: thumbnailBuffer,
        ContentType: 'image/png',
      }));
      console.log('  ✅ Thumbnail uploaded successfully!');
    }

    return true;
  } catch (error) {
    console.error(`  ❌ Error processing ${key}:`, error);
    return false;
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 PowerPoint Template Thumbnail Generator');
  console.log('==========================================\n');
  console.log(`📦 Bucket: ${BUCKET_NAME}`);
  console.log(`🌍 Region: ${REGION}`);
  console.log(`📐 Thumbnail Size: ${THUMBNAIL_WIDTH}x${THUMBNAIL_HEIGHT}px`);
  if (categoryFilter) {
    console.log(`🏷️  Category Filter: ${categoryFilter}`);
  }
  if (isDryRun) {
    console.log('🔍 DRY RUN MODE - No files will be uploaded');
  }
  console.log('');

  try {
    // List all categories (folders)
    const listCommand = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Delimiter: '/',
    });

    const listResponse = await s3Client.send(listCommand);
    const categories = (listResponse.CommonPrefixes || [])
      .map(prefix => prefix.Prefix?.replace('/', ''))
      .filter((cat): cat is string => !!cat)
      .filter(cat => !categoryFilter || cat === categoryFilter);

    console.log(`📂 Found ${categories.length} categories: ${categories.join(', ')}\n`);

    let totalProcessed = 0;
    let totalSuccess = 0;
    let totalSkipped = 0;

    // Process each category
    for (const category of categories) {
      console.log(`\n📁 Processing category: ${category}`);
      console.log('─'.repeat(50));

      // List all PPTX files in this category
      const categoryListCommand = new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        Prefix: `${category}/`,
      });

      const categoryResponse = await s3Client.send(categoryListCommand);
      const pptxFiles = (categoryResponse.Contents || [])
        .filter(file => file.Key && /\.pptx?$/i.test(file.Key))
        .map(file => file.Key!);

      console.log(`  Found ${pptxFiles.length} PPTX files\n`);

      for (const pptxFile of pptxFiles) {
        const success = await processPPTXFile(pptxFile, category);
        totalProcessed++;
        if (success) {
          totalSuccess++;
        }
      }
    }

    console.log('\n\n✨ Thumbnail Generation Complete!');
    console.log('=================================');
    console.log(`📊 Total Processed: ${totalProcessed}`);
    console.log(`✅ Successful: ${totalSuccess}`);
    console.log(`❌ Failed: ${totalProcessed - totalSuccess}`);
    
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the script
main();

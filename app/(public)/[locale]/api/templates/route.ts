// /src/app/api/templates/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GetObjectCommand } from '@aws-sdk/client-s3';

interface Template {
  id: string;
  name: string;
  preview: string;
  category: string;
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Initialize S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 Incoming GET request to /api/templates');

    // 1. Authenticate the User (Optional - for future tier-based features)
    const { userId } = getAuth(req);
    console.log('👤 Authenticated User ID:', userId || 'Guest User');

    // 2. All users see all templates (no tier restrictions)
    const bucketName = process.env.AWS_S3_BUCKET_NAME || 'isharayeh';
    
    console.log('🪣 S3 Bucket:', bucketName);

    // 3. List category folders at root level (business, education, children, collection)
    const listCommand = new ListObjectsV2Command({
      Bucket: bucketName,
      Delimiter: '/',
    });

    const listResponse = await s3Client.send(listCommand);
    
    // Extract category folders from CommonPrefixes
    const categories = (listResponse.CommonPrefixes || [])
      .map((prefix) => {
        const categoryName = prefix.Prefix?.replace('/', '');
        return categoryName ? { name: categoryName.toLowerCase(), prefix: prefix.Prefix } : null;
      })
      .filter((cat): cat is { name: string; prefix: string } => cat !== null);

    console.log('📂 Retrieved Categories:', categories);

    // 5. For Each Category, Fetch Template Files
    let templates: Template[] = [];
    
    for (const category of categories) {
      console.log(`🔍 Fetching templates for category: ${category.name}`);

      const categoryListCommand = new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: category.prefix,
      });

      const categoryResponse = await s3Client.send(categoryListCommand);
      const files = categoryResponse.Contents || [];

      // Filter for .pptx files only
      const pptxFiles = files.filter(
        (file) => file.Key && (file.Key.endsWith('.pptx') || file.Key.endsWith('.ppt'))
      );

      for (const file of pptxFiles) {
        if (!file.Key) continue;

        const fileName = file.Key.split('/').pop() || file.Key;
        const fileNameWithoutExt = fileName.replace(/\.(pptx|ppt)$/, '');

        // Generate a signed URL for the file (valid for 1 hour)
        const getObjectCommand = new GetObjectCommand({
          Bucket: bucketName,
          Key: file.Key,
        });
        
        const signedUrl = await getSignedUrl(s3Client, getObjectCommand, { expiresIn: 3600 });

        templates.push({
          id: file.Key, // Use S3 key as ID
          name: fileNameWithoutExt,
          preview: signedUrl, // Use signed URL as preview (can be thumbnail if you generate them)
          category: category.name,
        });
      }

      console.log(`✅ Retrieved ${pptxFiles.length} templates for category: ${category.name}`);
    }

    // 6. Return All Templates
    console.log('📊 Total Templates Retrieved:', templates.length);
    return NextResponse.json({ templates });
    
  } catch (error: any) {
    console.error('❌ Error fetching templates from S3:', error);

    // Check if AWS credentials are configured
    const hasCredentials = !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);
    console.error('⚠️ AWS Credentials configured:', hasCredentials);

    if (error.$metadata) {
      console.error('⚠️ AWS S3 Error:', {
        statusCode: error.$metadata.httpStatusCode,
        requestId: error.$metadata.requestId,
      });
    }
    
    console.error('⚠️ Error details:', error.message);
    console.error('⚠️ Error name:', error.name);

    // Return more detailed error in development
    const isDev = process.env.NODE_ENV === 'development';
    return NextResponse.json({ 
      error: 'Internal server error',
      ...(isDev && {
        details: error.message,
        hasCredentials,
        errorName: error.name,
      })
    }, { status: 500 });
  }
}


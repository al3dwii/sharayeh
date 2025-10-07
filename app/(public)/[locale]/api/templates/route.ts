// /src/app/api/templates/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getHighestUserTier } from '@/utils/getHighestUserTier';

interface Template {
  id: string;
  name: string;
  preview: string;
  category: string;
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Define a union type for user tiers
type Tier = 'free' | 'standard' | 'premium';

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

    // 1. Authenticate the User (Optional - Allow guest access to free templates)
    const { userId } = getAuth(req);
    console.log('👤 Authenticated User ID:', userId || 'Guest User');

    // 2. Determine User Tier
    const userTier: Tier = userId ? await getHighestUserTier(userId) : 'free';
    console.log('🟢 Resolved User Tier:', userTier);

    // 3. Map Tier to S3 Folder Prefixes
    const FOLDER_PREFIXES: Record<Tier, string> = {
      free: process.env.FREE_TEMPLATES_FOLDER || 'free',
      standard: process.env.STANDARD_TEMPLATES_FOLDER || 'standard',
      premium: process.env.PREMIUM_TEMPLATES_FOLDER || 'premium',
    };

    const folderPrefix = FOLDER_PREFIXES[userTier];
    const bucketName = process.env.AWS_S3_BUCKET_NAME || 'isharayeh';
    
    console.log('🔍 Resolved S3 Folder Prefix:', folderPrefix);
    console.log('🪣 S3 Bucket:', bucketName);

    if (!folderPrefix) {
      console.log('⚠️ Folder prefix not configured for tier:', userTier);
      return NextResponse.json(
        { error: `No folder prefix configured for tier: ${userTier}` },
        { status: 500 }
      );
    }

    // 4. List objects in S3 to find categories (subfolders)
    const listCommand = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: `${folderPrefix}/`,
      Delimiter: '/',
    });

    const listResponse = await s3Client.send(listCommand);
    
    // Extract category folders from CommonPrefixes
    const categories = (listResponse.CommonPrefixes || [])
      .map((prefix) => {
        const categoryName = prefix.Prefix?.replace(`${folderPrefix}/`, '').replace('/', '');
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

    if (error.$metadata) {
      console.error('⚠️ AWS S3 Error:', {
        statusCode: error.$metadata.httpStatusCode,
        requestId: error.$metadata.requestId,
      });
    }
    
    console.error('⚠️ Error details:', error.message);

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


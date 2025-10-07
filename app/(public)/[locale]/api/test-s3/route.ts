// Test endpoint to verify AWS S3 credentials
import { NextResponse } from 'next/server';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Check if environment variables exist
    const missingVars: string[] = [];
    if (!process.env.AWS_REGION) missingVars.push('AWS_REGION');
    if (!process.env.AWS_ACCESS_KEY_ID) missingVars.push('AWS_ACCESS_KEY_ID');
    if (!process.env.AWS_SECRET_ACCESS_KEY) missingVars.push('AWS_SECRET_ACCESS_KEY');
    if (!process.env.AWS_S3_BUCKET_NAME) missingVars.push('AWS_S3_BUCKET_NAME');

    if (missingVars.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Missing environment variables',
        missing: missingVars,
        available: {
          AWS_REGION: !!process.env.AWS_REGION,
          AWS_ACCESS_KEY_ID: !!process.env.AWS_ACCESS_KEY_ID,
          AWS_SECRET_ACCESS_KEY: !!process.env.AWS_SECRET_ACCESS_KEY,
          AWS_S3_BUCKET_NAME: !!process.env.AWS_S3_BUCKET_NAME,
        }
      }, { status: 500 });
    }

    // Try to connect to S3
    const s3Client = new S3Client({
      region: process.env.AWS_REGION!,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });

    const command = new ListObjectsV2Command({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      MaxKeys: 1,
    });

    const response = await s3Client.send(command);

    return NextResponse.json({
      success: true,
      message: 'AWS S3 connection successful',
      config: {
        region: process.env.AWS_REGION,
        bucket: process.env.AWS_S3_BUCKET_NAME,
        hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
        hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY,
      },
      s3Response: {
        keyCount: response.KeyCount,
        hasContents: !!response.Contents && response.Contents.length > 0,
      }
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error',
      errorName: error.name,
      errorCode: error.Code,
      config: {
        region: process.env.AWS_REGION,
        bucket: process.env.AWS_S3_BUCKET_NAME,
        hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
        hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY,
      }
    }, { status: 500 });
  }
}

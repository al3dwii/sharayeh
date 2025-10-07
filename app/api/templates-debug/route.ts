import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Step 1: Check environment variables
    const envCheck = {
      hasRegion: !!process.env.AWS_REGION,
      hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
      hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY,
      hasBucket: !!process.env.AWS_S3_BUCKET_NAME,
    };

    if (!envCheck.hasAccessKey || !envCheck.hasSecretKey) {
      return NextResponse.json({
        success: false,
        error: 'Missing AWS credentials',
        envCheck
      }, { status: 500 });
    }

    // Step 2: Try to import AWS SDK
    const { S3Client, ListObjectsV2Command } = await import('@aws-sdk/client-s3');

    // Step 3: Create S3 client
    const s3Client = new S3Client({
      region: process.env.AWS_REGION!,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });

    // Step 4: List objects
    const command = new ListObjectsV2Command({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Delimiter: '/',
      MaxKeys: 5
    });

    const response = await s3Client.send(command);

    return NextResponse.json({
      success: true,
      message: 'API is working!',
      envCheck,
      s3Result: {
        prefixes: response.CommonPrefixes?.length || 0,
        keys: response.KeyCount || 0
      }
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      errorName: error.name,
      stack: error.stack?.split('\n').slice(0, 5)
    }, { status: 500 });
  }
}

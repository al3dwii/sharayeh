// // src/app/api/process-file/route.ts

import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { currentUser } from '@clerk/nextjs'; // Import Clerk's currentUser function
import path from 'path';

export const runtime = 'nodejs'; // Ensure Node.js runtime

const gcsBucketName = 'tablesb';

export async function POST(req: Request) {
  try {
    // Initialize storage inside the handler
    let storage: any;

    // Dynamically import @google-cloud/storage inside the handler
    const { Storage } = await import('@google-cloud/storage');

    if (process.env.NODE_ENV === 'development') {
      // In development, use the local JSON file
      const keyFilename = path.join(process.cwd(), 'servicekey-0a04b09e6c99.json');
      storage = new Storage({ keyFilename });
    } else {
      // In production, use the base64-encoded service account key from environment variables
      const serviceAccountBase64 = process.env.GOOGLE_SERVICE_KEY_BASE64;
      if (!serviceAccountBase64) {
        throw new Error('Google service account key is not defined.');
      }

      const serviceAccountJson = Buffer.from(serviceAccountBase64, 'base64').toString('utf-8');
      const serviceAccount = JSON.parse(serviceAccountJson);

      if (
        !serviceAccount.client_email ||
        !serviceAccount.private_key ||
        !serviceAccount.project_id
      ) {
        throw new Error(
          'Google service account credentials (client_email, private_key, or project_id) are missing.'
        );
      }

      storage = new Storage({
        credentials: {
          client_email: serviceAccount.client_email,
          private_key: serviceAccount.private_key.replace(/\\n/g, '\n'),
        },
        projectId: serviceAccount.project_id,
      });
    }

    const user = await currentUser();
    if (!user) {
      console.log('User not authenticated');
      return NextResponse.json(
        { success: false, message: 'User not authenticated' },
        { status: 401 }
      );
    }

    const { fileName, contentType } = await req.json();
    if (!fileName || !contentType) {
      return NextResponse.json(
        { success: false, message: 'Missing fileName or contentType' },
        { status: 400 }
      );
    }

    const uniqueId = uuidv4();
    const gcsDestination = `${uniqueId}/${fileName}`;
    const bucket = storage.bucket(gcsBucketName);
    const file = bucket.file(gcsDestination);

    const [uploadUrl] = await file.getSignedUrl({
      version: 'v4',
      action: 'write',
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
      contentType: contentType,
    });

    return NextResponse.json(
      {
        success: true,
        uploadUrl,
        uniqueId,
        fileName,
        contentType,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error generating signed URL:', error);
    return NextResponse.json(
      { success: false, message: 'Something went wrong' },
      { status: 500 }
    );
  }
}


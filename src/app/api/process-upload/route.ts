// src/app/api/process-upload/route.ts

import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs'; // Import Clerk's currentUser function
import { addFile } from '@/utils/addfile';
// import axios from 'axios';

import { db } from '@/lib/db'; // Import your database module


export const runtime = 'nodejs'; // Ensure Node.js runtime

const gcsBucketName = 'tablesb';

export async function POST(req: Request) {
  try {
    // Dynamically import @google-cloud/pubsub inside the handler
    const { PubSub } = await import('@google-cloud/pubsub');
    let pubsub: any;

    if (process.env.NODE_ENV === 'development') {
      // In development, use the local JSON file
      const path = await import('path');
      const keyFilename = path.join(process.cwd(), 'servicekey-0a04b09e6c99.json');
      pubsub = new PubSub({ keyFilename });
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

      pubsub = new PubSub({
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

    const { fileName, uniqueId, contentType, pageCount } = await req.json();
    if (!fileName || !uniqueId || !contentType || pageCount == null) {
      return NextResponse.json(
        { success: false, message: 'Missing required parameters' },
        { status: 400 }
      );
    }

    let topicName = '';
    if (pageCount < 15) {
      topicName = 'projects/synthetic-song-438004-t3/topics/tables15';
    } else {
      topicName = 'projects/synthetic-song-438004-t3/topics/tables';
    }

    const gcsDestination = `${uniqueId}/${fileName}`;
    const gcsUri = `gs://${gcsBucketName}/${gcsDestination}`;

    const newFile = await addFile({
      userId: user.id,
      fileKey: gcsDestination,
      fileName: fileName,
      fileUrl: gcsUri,
      type: contentType,
    });

    const message = {
      gcsUri,
      uniqueId,
      fileType: contentType,
      fileId: newFile.id.toString(),
    };

    const dataBuffer = Buffer.from(JSON.stringify(message));
    await pubsub.topic(topicName).publishMessage({ data: dataBuffer });

    // Define the processed file path and URL
    const processedFilePath = `${uniqueId}/output/result.docx`;
    const processedFileUrl = `https://storage.googleapis.com/${gcsBucketName}/${processedFilePath}`;

    // Update the file record directly in the database
    await db.file.updateMany({
      where: {
        fileKey: gcsDestination,
        userId: user.id,
      },
      data: {
        resultedFile: processedFileUrl,
        status: 'COMPLETED',
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Processing started and file saved',
        fileId: newFile.id.toString(),
        uniqueId: uniqueId,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error processing upload:', error.message || error);
    return NextResponse.json(
      { success: false, message: 'Something went wrong' },
      { status: 500 }
    );
  }
}




// app/api/check-file-status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Storage } from '@google-cloud/storage';

const storage = new Storage();

export const dynamic = 'force-dynamic'; // Ensure dynamic content is fetched at runtime

export const runtime = 'nodejs'; // Ensure Node.js runtime


export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filePath = searchParams.get('filePath');

    if (!filePath) {
      return NextResponse.json({ success: false, message: 'filePath is required' }, { status: 400 });
    }

    // Check if the file exists in Google Cloud Storage
    const bucketName = 'tablesb'; // Replace with your bucket name
    const file = storage.bucket(bucketName).file(filePath);

    const [exists] = await file.exists();

    if (exists) {
      // File exists, return status 'ready'
      return NextResponse.json({ success: true, status: 'ready' }, { status: 200 });
    } else {
      // File does not exist yet, return status 'not_ready'
      return NextResponse.json({ success: true, status: 'not_ready' }, { status: 200 });
    }
  } catch (error) {
    console.error('Error checking file status:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}



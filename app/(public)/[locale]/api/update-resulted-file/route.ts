// /Users/omair/shraih/src/app/api/update-resulted-file/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic'; // Ensure dynamic content is fetched at runtime

export const runtime = 'nodejs'; // Ensure Node.js runtime


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fileKey, downloadUrl } = body;  // Updated: fileKey instead of filePath

    // Ensure both fileKey and downloadUrl are provided
    if (!fileKey || !downloadUrl) {
      console.error('Missing fields:', { fileKey, downloadUrl });
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('Received fileKey:', fileKey);
    console.log('Received downloadUrl:', downloadUrl);

    // Check if the file exists in the database
    const existingFile = await db.file.findFirst({
      where: {
        fileKey: fileKey, // Using fileKey to check in the DB
      },
    });

    if (!existingFile) {
      console.error('No file found with file_key:', fileKey);
      return NextResponse.json(
        { success: false, message: 'File not found in database' },
        { status: 404 }
      );
    }

    console.log('Updating file for:', { fileKey, downloadUrl });

    // Update the file record in the database with the downloadUrl and set status to 'ready'
    const updatedFile = await db.file.update({
      where: {
        fileKey: fileKey, // Using fileKey here
      },
      data: {
        resultedFile: downloadUrl,
        status: 'COMPLETED',
      },
    });

    if (!updatedFile) {
      console.error('Failed to update file:', { fileKey });
      return NextResponse.json(
        { success: false, message: 'Failed to update file URL' },
        { status: 500 }
      );
    }

    console.log('File updated successfully:', updatedFile);

    // Return a success response with the updated file information
    return NextResponse.json({ success: true, updatedFile }, { status: 200 });

  } catch (error) {
    console.error('Error updating file URL:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}


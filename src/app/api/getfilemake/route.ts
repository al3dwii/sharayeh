// app/api/getfilemake/route.ts

import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
import { db } from '@/lib/db';

export const runtime = 'nodejs'; // Ensure Node.js runtime

/**
 * Handler for POST requests to update file status.
 */
export async function POST(req: NextRequest) {
  console.log('📥 POST /api/getfilemake invoked.');

  try {
    console.log('📄 Parsing request body.');
    const body = await req.json();
    const { downloadUrl, fileName, userId, requestId } = body;

    console.log('🔍 Validating required fields:', { downloadUrl, fileName, userId, requestId });

    if (!downloadUrl || !fileName || !userId || !requestId) {
      console.warn('⚠️ Missing required fields in POST request.');
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log(`🔄 Updating file with Request ID: ${requestId}`);
    const updatedFile = await db.file.update({
      where: { id: Number(requestId) },
      data: {
        resultedFile: downloadUrl,
        status: 'COMPLETED',
      },
    });

    console.log('✅ File updated successfully:', updatedFile);
    return NextResponse.json(
      { success: true, message: 'File updated successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ Error updating file:', {
      message: error.message,
      stack: error.stack,
      // Optionally, include more error details if safe
    });
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Handler for GET requests to fetch file status.
 */
export async function GET(req: NextRequest) {
  console.log('📥 GET /api/getfilemake invoked.');

  try {
    console.log('🔍 Extracting query parameters.');
    const { searchParams } = new URL(req.url);
    const requestIdParam = searchParams.get('requestId');

    console.log('🔍 Validating requestId parameter:', requestIdParam);

    if (!requestIdParam) {
      console.warn('⚠️ Missing requestId in GET request.');
      return NextResponse.json(
        { success: false, error: 'Missing requestId' },
        { status: 400 }
      );
    }

    const requestId = Number(requestIdParam);
    if (isNaN(requestId)) {
      console.warn('⚠️ Invalid requestId format:', requestIdParam);
      return NextResponse.json(
        { success: false, error: 'Invalid requestId format' },
        { status: 400 }
      );
    }

    console.log(`🔄 Fetching file with Request ID: ${requestId}`);
    const file = await db.file.findUnique({
      where: { id: requestId },
    });

    if (!file) {
      console.warn(`⚠️ File not found with Request ID: ${requestId}`);
      return NextResponse.json(
        { success: false, error: 'File not found' },
        { status: 404 }
      );
    }

    console.log('✅ File retrieved:', file);

    switch (file.status) {
      case 'COMPLETED':
        console.log('✅ File processing completed. Preparing download URL.');
        return NextResponse.json(
          { status: 'COMPLETED', downloadUrl: file.resultedFile },
          { status: 200 }
        );
      case 'FAILED':
        console.warn('⚠️ File processing failed.');
        return NextResponse.json({ status: 'FAILED' }, { status: 200 });
      case 'PROCESSING':
        console.log('⏳ File is still processing.');
        return NextResponse.json({ status: 'PROCESSING' }, { status: 200 });
      default:
        console.warn('⚠️ Unknown file status:', file.status);
        return NextResponse.json(
          { success: false, error: 'Unknown file status' },
          { status: 500 }
        );
    }
  } catch (error: any) {
    console.error('❌ Error fetching file:', {
      message: error.message,
      stack: error.stack,
      // Optionally, include more error details if safe
    });
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

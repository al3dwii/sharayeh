// app/api/files/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getAuth, clerkClient } from '@clerk/nextjs/server'; // Import clerkClient
import prismadb from '@/utils/prismadb'; // Ensure this imports your Prisma client correctly

interface CreateFileBody {
  fileName: string;
  type: string;
}

export const runtime = 'nodejs'; // Ensure Node.js runtime

/**
 * Handler for POST requests to create a new File record.
 */
export async function POST(req: NextRequest) {
  console.log('📥 POST /api/files invoked.');

  try {
    // **Authenticate the request using Clerk**
    console.log('🔑 Authenticating user using Clerk.');
    const { userId } = getAuth(req);
    if (!userId) {
      console.warn('⚠️ Unauthorized access attempt.');
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    console.log(`✅ User authenticated. User ID: ${userId}`);

    // **Parse the request body**
    console.log('📄 Parsing request body.');
    const body: CreateFileBody = await req.json();
    const { fileName, type } = body;
    console.log('🔍 Parsed body:', { fileName, type });

    // **Validate the request body**
    if (!fileName || !type) {
      console.warn('⚠️ Validation failed: Missing fileName or type.');
      return NextResponse.json(
        { success: false, error: 'Missing fileName or type' },
        { status: 400 }
      );
    }
    console.log('✅ Request body validation passed.');

    // **Optional: Additional Validation or Processing**
    // You can add more validation or processing here if needed.

    // **Create the File record with userId**
    console.log('🔄 Creating new File record.');
    const newFile = await prismadb.file.create({
      data: {
        fileName,
        type,
        userId, // Directly assign userId without connecting to a User model
        // Other fields like status are automatically set to their default values
      },
    });

    console.log('✅ File record created successfully:', {
      id: newFile.id,
      fileName: newFile.fileName,
      type: newFile.type,
      status: newFile.status,
      userId: newFile.userId,
    });

    return NextResponse.json(
      { success: true, id: newFile.id },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('❌ Error creating file:', {
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

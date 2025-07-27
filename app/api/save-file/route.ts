// // src/app/api/save-file/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db'; // Adjust your db import accordingly
import { getAuth } from '@clerk/nextjs/server'; // Example Clerk import for authentication

export const runtime = 'nodejs';

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { fileKey, resultedFile, status } = body;

    console.log('Received fileKey:', fileKey);
    console.log('Received resultedFile:', resultedFile);
    console.log('Received status:', status);

    if (!fileKey || !resultedFile || !status) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get authenticated user ID
    const { userId } = getAuth(req);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Update the file record with the provided data
    const updatedFile = await db.file.updateMany({
      where: {
        fileKey: fileKey,
        userId: userId, // Ensure the file belongs to the authenticated user
      },
      data: {
        resultedFile,
        status,
      },
    });

    if (updatedFile.count === 0) {
      return NextResponse.json(
        { success: false, message: 'File not found or not authorized' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'File updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating file:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}



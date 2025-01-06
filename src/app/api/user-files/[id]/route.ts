import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic'; // Ensure dynamic content is fetched at runtime

export const runtime = 'nodejs'; // Ensure Node.js runtime


export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Missing user ID' },
        { status: 400 }
      );
    }

    // Query the database for the user's files using Prisma
    const files = await db.file.findMany({
      where: {
        userId: id, // Make sure 'user_id' matches the field in your Prisma schema
      },
      select: {
        id: true,
        fileName: true,
        fileUrl: true,
        type: true,
        status: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!files.length) {
      return NextResponse.json(
        { success: false, message: 'No files found for this user' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, files }, { status: 200 });
  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}

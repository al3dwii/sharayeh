// src/app/api/add-file/route.ts (Next.js 14 app router with Prisma)
import { NextRequest, NextResponse } from 'next/server';
import { db} from '@/lib/db'; // Assuming prisma client is set up here

export const runtime = 'nodejs'; // Ensure Node.js runtime


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fileData } = body;

    if (!fileData) {
      return NextResponse.json({ error: "File data is required" }, { status: 400 });
    }

    // Use Prisma's create method to insert file data
    const newFile = await db.file.create({
      data: fileData,
    });

    return NextResponse.json(newFile, { status: 200 });
  } catch (error) {
    console.error('Error adding file:', error);
    return NextResponse.json({ error: "Failed to add file" }, { status: 500 });
  }
}


// apps/nextjs/src/app/api/files/route.ts

// import { db } from '@/lib/db';
// import { NextResponse } from 'next/server';

// export async function GET(req: Request) {
//   const { searchParams } = new URL(req.url);
//   const userId = searchParams.get('userId');
  
//   if (!userId) {
//     return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
//   }

//   try {
//     // Query user files using Prisma with correct field name 'user_id'
//     const userFiles = await db.file.findMany({
//       where: {
//         userId: userId, // Corrected the field name to 'user_id'
//       },
//       select: {
//         id: true,
//         fileName: true,
//         fileUrl: true,
//         resultedFile: true,
//         createdAt: true,
//       },
//       orderBy: {
//         createdAt: 'desc',
//       },
//     });

//     return NextResponse.json(userFiles, { status: 200 });
//   } catch (error) {
//     console.error('Error fetching files:', error);
//     return NextResponse.json({ error: 'Failed to fetch user files' }, { status: 500 });
//   }
// }



// app/api/files/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, fileName, type } = body;

    if (!userId || !fileName || !type) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const newFile = await db.file.create({
      data: {
        userId,
        fileName,
        type,
        status: 'PROCESSING',
      },
    });

    return NextResponse.json({ success: true, id: newFile.id }, { status: 201 });
  } catch (error) {
    console.error('Error creating file:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}


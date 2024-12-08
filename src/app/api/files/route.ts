// app/api/files/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db'; // Ensure this imports your Prisma client correctly
import { getAuth } from '@clerk/nextjs/server'; // Import Clerk's getAuth

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

    // **Ensure User exists**
    console.log(`🔍 Checking existence of User ID: ${userId}`);
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      console.warn(`⚠️ User not found with ID: ${userId}`);
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    console.log('✅ User exists:', { id: user.id, name: user.name });

    // **Create the File record with relation to User using connect syntax**
    console.log('🔄 Creating new File record.');
    const newFile = await db.file.create({
      data: {
        fileName,
        type,
        // status is automatically set to 'PROCESSING' due to default value
        user: {
          connect: { id: userId }, // Properly connect to the User
        },
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



// // app/api/files/route.ts

// import { NextRequest, NextResponse } from 'next/server';
// import { db } from '@/lib/db'; // Ensure this imports your Prisma client correctly
// import { getAuth } from '@clerk/nextjs/server'; // Import Clerk's getAuth

// interface CreateFileBody {
//   fileName: string;
//   type: string;
// }

// export async function POST(req: NextRequest) {
//   try {
//     // **Authenticate the request using Clerk**
//     const { userId } = getAuth(req);
//     if (!userId) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     // **Parse the request body**
//     const body: CreateFileBody = await req.json();
//     const { fileName, type } = body;

//     // **Validate the request body**
//     if (!fileName || !type) {
//       return NextResponse.json({ error: 'Missing fileName or type' }, { status: 400 });
//     }

//     // **Ensure User exists**
//     const user = await db.user.findUnique({
//       where: { id: userId },
//     });

//     if (!user) {
//       return NextResponse.json({ error: 'User not found' }, { status: 404 });
//     }

//     // **Create the File record with relation to User using connect syntax**
//     const newFile = await db.file.create({
//       data: {
//         fileName,
//         type,
//         // status is automatically set to 'PROCESSING' due to default value
//         user: {
//           connect: { id: userId }, // Properly connect to the User
//         },
//       },
//     });

//     return NextResponse.json({ id: newFile.id }, { status: 201 });
//   } catch (error) {
//     console.error('Error creating file:', error);
//     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
//   }
// }


// // app/api/files/route.ts

// import { NextRequest, NextResponse } from 'next/server';
// import { db } from '@/lib/db'; // Ensure this imports your Prisma client correctly
// import { getAuth } from '@clerk/nextjs/server'; // Import Clerk's getAuth
// import { PrismaClient, File } from '@prisma/client';



// interface CreateFileBody {
//   fileName: string;
//   type: string;
// }

// export async function POST(req: NextRequest) {
//   try {
//     // **Authenticate the request using Clerk**
//     const { userId } = getAuth(req);
//     if (!userId) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     // **Parse the request body**
//     const body: CreateFileBody = await req.json();
//     const { fileName, type } = body;

//     // **Validate the request body**
//     if (!fileName || !type) {
//       return NextResponse.json({ error: 'Missing fileName or type' }, { status: 400 });
//     }

//     // **Create the File record with relation to User using connect syntax**
//     const newFile = await db.file.create({
//       data: {
//         fileName: fileName,
//         type: 'PRESENTATION',
//         status: 'PROCESSING', // Added status
//         user: {
//           connect: { id: userId },
//         },
//       },
//     });
    
  

//     return NextResponse.json({ id: newFile.id }, { status: 201 });
//   } catch (error) {
//     console.error('Error creating file:', error);
//     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
//   }
// }


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



// // app/api/files/route.ts

// import { NextRequest, NextResponse } from 'next/server';
// import { db } from '@/lib/db';

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();
//     const { userId, fileName, type } = body;

//     if (!userId || !fileName || !type) {
//       return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
//     }

//     const newFile = await db.file.create({
//       data: {
//         userId,
//         fileName,
//         type,
//         status: 'PROCESSING',
//       },
//     });

//     return NextResponse.json({ success: true, id: newFile.id }, { status: 201 });
//   } catch (error) {
//     console.error('Error creating file:', error);
//     return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
//   }
// }


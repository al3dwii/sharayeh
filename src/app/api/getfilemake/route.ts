
// app/api/getfilemake/route.ts

import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
import { db } from '@/lib/db';


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { downloadUrl, fileName, userId, requestId } = body;

    if (!downloadUrl || !fileName || !userId || !requestId) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    await db.file.update({
      where: { id: Number(requestId) },
      data: {
        resultedFile: downloadUrl,
        status: 'COMPLETED',
      },
    });

    return NextResponse.json({ success: true, message: 'File updated successfully' });
  } catch (error) {
    console.error('Error updating file:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const requestId = searchParams.get('requestId');

    if (!requestId) {
      return NextResponse.json({ success: false, error: 'Missing requestId' }, { status: 400 });
    }

    const file = await db.file.findUnique({
      where: { id: Number(requestId) },
    });

    if (!file) {
      return NextResponse.json({ success: false, error: 'File not found' }, { status: 404 });
    }

    if (file.status === 'COMPLETED') {
      return NextResponse.json({ status: 'COMPLETED', downloadUrl: file.resultedFile });
    } else if (file.status === 'FAILED') {
      return NextResponse.json({ status: 'FAILED' });
    } else {
      return NextResponse.json({ status: 'PROCESSING' });
    }
  } catch (error) {
    console.error('Error fetching file:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}



// import { NextRequest, NextResponse } from 'next/server';

// export async function POST(req: NextRequest) {
//   try {
//     const { downloadUrl, fileName } = await req.json();

//     // Save or process the file URL as needed
//     console.log('File URL:', downloadUrl);
//     console.log('File Name:', fileName);

//     // Respond to confirm receipt
//     return NextResponse.json({ success: true, message: 'File received successfully!' });
//   } catch (error) {
//     console.error('Error processing file upload:', error);
//     return NextResponse.json({ success: false, error: 'Unable to process the file' }, { status: 500 });
//   }
// }


// import { NextRequest, NextResponse } from 'next/server';

// // Mock database or storage (Replace with real implementation)
// const fileStorage: { downloadUrl: string; fileName: string }[] = [];

// export async function POST(req: NextRequest) {
//   try {
//     const { downloadUrl, fileName } = await req.json();

//     // Validate the incoming data
//     if (!downloadUrl || !fileName) {
//       return NextResponse.json(
//         { success: false, error: 'Missing required fields: downloadUrl or fileName' },
//         { status: 400 }
//       );
//     }

//     // Save the file details to the database or in-memory storage
//     fileStorage.push({ downloadUrl, fileName });
//     console.log('File saved:', { downloadUrl, fileName });

//     // Respond with confirmation and optional saved data
//     return NextResponse.json({
//       success: true,
//       message: 'File details received and saved successfully!',
//       data: { downloadUrl, fileName },
//     });
//   } catch (error) {
//     console.error('Error processing file upload:', error);

//     // Respond with an error
//     return NextResponse.json(
//       { success: false, error: 'Unable to process the file' },
//       { status: 500 }
//     );
//   }
// }



// import { NextRequest, NextResponse } from 'next/server';

// export async function GET() {
//   try {
//     // Simulated response, replace with actual logic
//     const downloadUrl = 'https://drive.google.com/file/d/1uwIRoR4I5_6A4059qKUAlwpGc1OmXP6MMGC0XCvIp2A';
//     const fileName = 'file.html';

//     return NextResponse.json({ downloadUrl, fileName });
//   } catch (error) {
//     console.error('Error fetching file:', error);
//     return NextResponse.json({ success: false, error: 'Unable to fetch the file' }, { status: 500 });
//   }
// }


// import { NextRequest, NextResponse } from 'next/server';

// export async function POST(req: NextRequest) {
//   try {
//     const { downloadUrl, fileName } = await req.json();

//     // Save or process the file URL as needed
//     console.log('File URL:', downloadUrl);
//     console.log('File Name:', fileName);

//     // Respond to confirm receipt
//     return NextResponse.json({ success: true, message: 'File received successfully!' });
//   } catch (error) {
//     console.error('Error processing file upload:', error);
//     return NextResponse.json({ success: false, error: 'Unable to process the file' }, { status: 500 });
//   }
// }

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
// import { promises as fs } from 'fs';
// import path from 'path';
// import { db } from '@/lib/db';

// export async function POST(req: NextRequest) {
//   try {
//     const contentType = req.headers.get('content-type') || '';
    
//     if (!contentType.includes('multipart/form-data')) {
//       return NextResponse.json({ success: false, error: 'Content type must be multipart/form-data' }, { status: 400 });
//     }

//     // Parse the form data
//     const formData = await req.formData();
//     const file = formData.get('file') as File | null;
//     const fileName = formData.get('fileName') as string;
//     const userId = formData.get('userId') as string;
//     const requestId = formData.get('requestId') as string;

//     if (!file || !fileName || !userId || !requestId) {
//       return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
//     }

//     // Convert the file to a Buffer
//     const buffer = Buffer.from(await file.arrayBuffer());

//     // Define a temporary file path
//     const filePath = path.join(process.cwd(), 'tmp', fileName);

//     // Save the file locally
//     await fs.mkdir(path.dirname(filePath), { recursive: true }); // Ensure the directory exists
//     await fs.writeFile(filePath, new Uint8Array(buffer)); // Convert buffer to Uint8Array

//     // Update the database
//     await db.file.update({
//       where: { id: Number(requestId) },
//       data: {
//         resultedFile: filePath, // Store the file path or URL in the database
//         status: 'COMPLETED',
//       },
//     });

//     return NextResponse.json({ success: true, message: 'File uploaded and updated successfully' });
//   } catch (error) {
//     console.error('Error updating file:', error);
//     return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
//   }
// }




// import { NextRequest, NextResponse } from 'next/server';
// import { db } from '@/lib/db';
// import fs from 'fs/promises';
// import path from 'path';
// import { IncomingMessage } from 'http'; // Import to cast the request
// import formidable, { File, Fields, Files } from 'formidable';

// export const config = {
//   api: {
//     bodyParser: false, // Disable Next.js default body parser to handle form-data
//   },
// };

// // Helper function to handle formidable parsing
// const parseForm = (req: IncomingMessage): Promise<{ fields: Fields; files: Files }> => {
//   const uploadDir = path.join(process.cwd(), 'public', 'uploads');

//   const form = formidable({
//     uploadDir,
//     keepExtensions: true,
//     multiples: false, // Accept single file uploads only
//   });

//   return new Promise((resolve, reject) => {
//     form.parse(req, (err, fields, files) => {
//       if (err) reject(err);
//       else resolve({ fields, files });
//     });
//   });
// };

// // POST method to handle file upload
// export async function POST(req: NextRequest) {
//   try {
//     // Cast NextRequest to IncomingMessage to make it compatible with formidable
//     const incomingReq = req as unknown as IncomingMessage;

//     // Parse form data
//     const { fields, files } = await parseForm(incomingReq);

//     const { userId, requestId } = fields;
//     const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file; // Handle array or single file

//     if (!userId || !requestId || !uploadedFile) {
//       return NextResponse.json(
//         { success: false, error: 'Missing required fields or file' },
//         { status: 400 }
//       );
//     }

//     // Store the relative file path for serving later
//     const filePath = `/uploads/${path.basename(uploadedFile.filepath)}`;

//     // Update the database with file details
//     await db.file.update({
//       where: { id: Number(requestId) },
//       data: {
//         resultedFile: filePath,
//         status: 'COMPLETED',
//       },
//     });

//     return NextResponse.json({ success: true, message: 'File uploaded successfully', filePath });
//   } catch (error) {
//     console.error('Error uploading file:', error);
//     return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
//   }
// }

// // GET method to fetch file details
// export async function GET(req: NextRequest) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const requestId = searchParams.get('requestId');

//     if (!requestId) {
//       return NextResponse.json({ success: false, error: 'Missing requestId' }, { status: 400 });
//     }

//     const file = await db.file.findUnique({
//       where: { id: Number(requestId) },
//     });

//     if (!file) {
//       return NextResponse.json({ success: false, error: 'File not found' }, { status: 404 });
//     }

//     if (file.status === 'COMPLETED') {
//       return NextResponse.json({
//         status: 'COMPLETED',
//         downloadUrl: file.resultedFile,
//       });
//     } else if (file.status === 'FAILED') {
//       return NextResponse.json({ status: 'FAILED' });
//     } else {
//       return NextResponse.json({ status: 'PROCESSING' });
//     }
//   } catch (error) {
//     console.error('Error fetching file:', error);
//     return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
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

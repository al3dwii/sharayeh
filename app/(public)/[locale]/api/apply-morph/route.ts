// /app/api/apply-morph/route.ts

import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import axiosRetry from 'axios-retry';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getAuth } from '@clerk/nextjs/server';
import { db } from "@/lib/db"; 
import { z } from 'zod';
import  { AxiosError } from 'axios';

export const dynamic = 'force-dynamic';


// Define your schema
const schema = z.object({
  resultedFile: z.string().optional(),
});

// Define the runtime
export const runtime = 'nodejs';

// Define the request body schema using Zod for validation
const ApplyMorphSchema = z.object({
  resultedFile: z.string().url(),
});

// **1. Initialize Axios with retry logic and updated configurations**
const axiosInstance = axios.create({
  timeout: 60000, // 60 seconds
  maxContentLength: Infinity, // Remove content length limit
  maxBodyLength: Infinity,    // Remove body length limit
});

// Configure Axios Retry
axiosRetry(axiosInstance, {
  retries: 3,
  retryDelay: (retryCount) => retryCount * 1000, // Exponential backoff
  retryCondition: (error: AxiosError): boolean => {
    // 1) built‑in network/idempotent check
    const isNetworkOrIdempotent = axiosRetry.isNetworkOrIdempotentRequestError(error);

    // 2) explicit 5xx check
    const status = error.response?.status;
    const isServerError = typeof status === 'number' && status >= 500;

    return isNetworkOrIdempotent || isServerError;
  },
});


//   retryCondition: (error) => {
//     // Retry on network errors or 5xx status codes
//     return axiosRetry.isNetworkOrIdempotentRequestError(error) ||
//            (error.response && error.response.status >= 500);
//   },
// });



// **2. Separate Axios instance for Aspose Authentication**
const axiosAuthInstance = axios.create({
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
});

// **3. Separate Axios instance for Aspose API Operations**
const axiosAsposeInstance = axios.create({
  timeout: 60000, // 60 seconds
  maxContentLength: Infinity,
  maxBodyLength: Infinity,
});

// **Helper Function: Authenticate with Aspose API**
async function authenticateWithAspose(ASPOSE_CLIENT_ID: string, ASPOSE_CLIENT_SECRET: string): Promise<string> {
  const params = new URLSearchParams();
  params.append('grant_type', 'client_credentials');
  params.append('client_id', ASPOSE_CLIENT_ID);
  params.append('client_secret', ASPOSE_CLIENT_SECRET);

  try {
    const authResponse = await axiosAuthInstance.post(
      'https://api.aspose.cloud/connect/token',
      params.toString()
    );

    const accessToken = authResponse.data.access_token;
    if (!accessToken) {
      throw new Error('Access token not obtained.');
    }

    return accessToken;
  } catch (error: any) {
    console.error('❌ Aspose authentication failed:', error.response?.data || error.message);
    throw new Error('Aspose authentication failed.');
  }
}

// **Helper Function: Download File**
async function downloadFile(url: string): Promise<Buffer> {
  const response = await axiosInstance.get(url, { responseType: 'arraybuffer' });
  if (response.status !== 200) {
    throw new Error(`Failed to download file. Status code: ${response.status}`);
  }
  return Buffer.from(response.data);
}

// **Helper Function: Upload to Aspose Storage**
async function uploadToAsposeStorage(accessToken: string, fileData: Buffer, uploadPath: string, apiVersion: string = 'v3.0') {
  const uploadResponse = await axiosAsposeInstance.put(
    `https://api.aspose.cloud/${apiVersion}/slides/storage/file/${encodeURIComponent(uploadPath)}`,
    fileData,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/octet-stream',
      },
    }
  );

  if (uploadResponse.status !== 200 && uploadResponse.status !== 201) {
    throw new Error(`Failed to upload file to Aspose Storage. Status: ${uploadResponse.status}`);
  }

  return uploadResponse;
}

// **Main API Handler**
export async function POST(req: NextRequest) {
  console.log('📥 API handler invoked with method:', req.method);

  let uploadedFilePath = ''; // Temporary file path
  let originalFileName = '';

  try {
    // **Step 1: Retrieve and Validate Environment Variables**
    const {
      AWS_ACCESS_KEY_ID,
      AWS_SECRET_ACCESS_KEY,
      AWS_REGION,
      ASPOSE_CLIENT_ID,
      ASPOSE_CLIENT_SECRET,
    } = process.env;

    if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !AWS_REGION) {
      console.error('❌ Missing AWS environment variables');
      return NextResponse.json(
        { success: false, error: 'Server configuration error: Missing AWS credentials.' },
        { status: 500 }
      );
    }

    if (!ASPOSE_CLIENT_ID || !ASPOSE_CLIENT_SECRET) {
      console.error('❌ Missing Aspose environment variables');
      return NextResponse.json(
        { success: false, error: 'Server configuration error: Missing Aspose credentials.' },
        { status: 500 }
      );
    }

    // **Optional Logging (Do Not Log Secrets)**
    console.log('🌍 AWS Region:', AWS_REGION);
    console.log('🔑 Aspose Client ID:', ASPOSE_CLIENT_ID);

    // **Step 2: Initialize AWS S3 Client with AWS SDK v3**
    const s3 = new S3Client({
      region: AWS_REGION, // Europe (Stockholm)
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
      },
    });

    // **Step 3: Retrieve Authenticated User**
    const { userId, sessionId } = getAuth(req);
    if (!userId) {
      console.error('❌ Unauthenticated request.');
      return NextResponse.json(
        { success: false, error: 'Authentication required.' },
        { status: 401 }
      );
    }

    console.log('👤 Authenticated User ID:', userId);
    // Optionally, retrieve user's credits or other info if available
    // Example: const user = await db.user.findUnique({ where: { id: userId } });
    // console.log('📊 Retrieved User Credits:', { credits: user?.credits, usedCredits: user?.usedCredits });

    // **Step 4: Parse and Validate the JSON Body**
    console.log('📄 Parsing and validating request body');
    const parsedBody = ApplyMorphSchema.safeParse(await req.json());

    if (!parsedBody.success && "error" in parsedBody) {
      const { error } = parsedBody;          // parsedBody is already the error branch

      console.error('❌ Invalid request body:', error);
      return NextResponse.json(
        { success: false, error: 'Invalid request data.' },
        { status: 400 }
      );
    }

    const { resultedFile } = parsedBody.data;

    // **Step 5: Validate the resultedFile URL**
    const allowedDomains = ['sharayeh.s3.eu-north-1.amazonaws.com'];
    let resultedFileUrl: URL;
    try {
      resultedFileUrl = new URL(resultedFile);
    } catch (urlError) {
      console.error('❌ Invalid resultedFile URL:', resultedFile);
      return NextResponse.json(
        { success: false, error: 'Invalid resultedFile URL.' },
        { status: 400 }
      );
    }

    if (!allowedDomains.includes(resultedFileUrl.hostname)) {
      console.error('❌ Invalid resultedFile domain:', resultedFileUrl.hostname);
      return NextResponse.json(
        { success: false, error: 'Invalid resultedFile URL domain.' },
        { status: 400 }
      );
    }

    // **Step 6: Download the File from the resultedFile URL**
    console.log(`⬇️ Downloading file from URL: ${resultedFile}`);
    const fileBuffer = await downloadFile(resultedFile);
    console.log('✅ File downloaded successfully.');

    // **Step 7: Determine the File Name from the URL**
    const urlPath = resultedFileUrl.pathname;
    originalFileName = path.basename(urlPath);
    const extension = path.extname(originalFileName);
    console.log(`📁 Original file name: ${originalFileName}`);

    // **Step 8: Validate the File Name**
    const isValidFileName = /^[a-zA-Z0-9._-]+$/.test(originalFileName);
    if (!isValidFileName) {
      console.error('❌ Invalid file name:', originalFileName);
      throw new Error('Invalid file name.');
    }

    // **Step 9: Generate a Unique Temporary File Path**
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const tempDir = os.tmpdir();
    uploadedFilePath = path.join(tempDir, `${uniqueId}${extension}`);
    console.log(`📂 Temporary file path: ${uploadedFilePath}`);

    // **Step 10: Save the Downloaded File to the Temporary Path**
    console.log('💾 Saving file to temporary path');
    const uint8ArrayBuffer = new Uint8Array(fileBuffer);
    await fs.promises.writeFile(uploadedFilePath, uint8ArrayBuffer);
    // await fs.promises.writeFile(uploadedFilePath, fileBuffer);
    console.log('✅ File saved to temporary path.');

    // **Step 11: Authenticate with Aspose API**
    console.log('🔑 Authenticating with Aspose API');
    const accessToken = await authenticateWithAspose(ASPOSE_CLIENT_ID, ASPOSE_CLIENT_SECRET);
    console.log('🔑 Aspose authentication successful. Access Token obtained.');

    // **Step 12: Define uploadPath (File Name Only)**
    const uploadPath = originalFileName; // e.g., 'user_2q7QkRpIuwGAn2cU8bGg6CsPlOD.pptx'
    console.log(`📤 Uploading file to Aspose Storage with uploadPath: ${uploadPath}`);

    // **Step 13: Upload the File to Aspose Storage**
    console.log('📤 Uploading file to Aspose Storage.');
    await uploadToAsposeStorage(accessToken, fileBuffer, uploadPath);
    console.log('✅ File uploaded to Aspose Storage.');

    // **Step 14: List Files in Aspose Storage After Upload**
    console.log('🔍 Listing files in Aspose Storage.');
    const apiVersion = 'v3.0'; // Define API version once
    const listFilesResponse = await axiosAsposeInstance.get(
      `https://api.aspose.cloud/${apiVersion}/slides/storage/folder/`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          path: '', // Explicitly specify the root path
        },
        responseType: 'json', // Ensure the response is treated as JSON
      }
    );

    console.log('🔍 Listing files in Aspose Storage Response:', listFilesResponse.data);

    // **Step 15: Check if the File Exists in the Root Folder**
    const uploadedFiles = listFilesResponse.data.value;
    const fileExists = uploadedFiles.some((file: any) => file.name === originalFileName);

    console.log(`📁 File exists in root folder: ${fileExists}`);

    if (!fileExists) {
      console.error(`❌ File ${originalFileName} was not found in the root folder`);
      throw new Error(`File ${originalFileName} was not found in the root folder`);
    }

    // **Step 16: Get the Total Number of Slides**
    console.log(`📊 Retrieving slide count for file: ${uploadPath}`);
    const slideCountResponse = await axiosAsposeInstance.get(
      `https://api.aspose.cloud/${apiVersion}/slides/${encodeURIComponent(uploadPath)}/slides`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        responseType: 'json', // Ensure the response is treated as JSON
      }
    );

    if (slideCountResponse.status !== 200) {
      console.error(`❌ Failed to retrieve slide count. Status code: ${slideCountResponse.status}`);
      throw new Error(`Failed to retrieve slide count. Status code: ${slideCountResponse.status}`);
    }

    console.log('✅ Slide count retrieved.');

    const slideList = slideCountResponse.data.slideList;
    if (!Array.isArray(slideList)) {
      console.error('❌ Invalid slideList format.');
      throw new Error('Invalid slideList format.');
    }

    const slideCount = slideList.length;
    console.log(`📊 Total number of slides: ${slideCount}`);

    // **Step 17: Apply Morph Transition to Each Slide Sequentially**
    console.log('🎨 Applying Morph transitions to all slides sequentially.');

    const processedSlides: number[] = [];
    const failedSlides: { slide: number; error: string }[] = [];

    for (let i = 1; i <= slideCount; i++) {
      try {
        await axiosAsposeInstance.put(
          `https://api.aspose.cloud/${apiVersion}/slides/${encodeURIComponent(uploadPath)}/slides/${i}`,
          {
            slideShowTransition: {
              type: 'Morph',
              duration: 1000, // Duration in milliseconds
              easing: 'ease-in-out', // Transition easing function
              morphTransition: {
                morphType: 'ByWord', // Try 'ByWord' or 'ByChar' instead of 'ByObject'
              },
            },
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          }
        );
        console.log(`✅ Successfully applied Morph transition to slide ${i}.`);
        processedSlides.push(i);
      } catch (slideError: any) {
        console.error(`❌ Error applying Morph transition to slide ${i}:`, slideError.response?.data || slideError.message);
        failedSlides.push({ slide: i, error: slideError.message });
      }
    }

    // **Log the Results**
    console.log('✅ Processed slides:', processedSlides);
    if (failedSlides.length > 0) {
      console.warn('❌ Failed slides:', failedSlides);
    }

    // **Step 18: Download the Modified File from Aspose**
    console.log(`⬇️ Downloading the modified file: ${uploadPath}`);
    const modifiedFileResponse = await axiosAsposeInstance.get(
      `https://api.aspose.cloud/${apiVersion}/slides/storage/file/${encodeURIComponent(uploadPath)}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        responseType: 'arraybuffer', // Ensure the response is in binary format
      }
    );

    if (modifiedFileResponse.status !== 200) {
      console.error(`❌ Failed to download modified file. Status code: ${modifiedFileResponse.status}`);
      throw new Error(`Failed to download modified file. Status code: ${modifiedFileResponse.status}`);
    }

    console.log('✅ Modified file downloaded successfully.');

    // **Step 19: Upload the Modified File to AWS S3 Using AWS SDK v3**
    console.log('📤 Uploading the modified file to AWS S3.');

    const processedFileName = `processed-${originalFileName}`;
    const s3Key = processedFileName; // You can customize the key/path as needed

    const putObjectCommand = new PutObjectCommand({
      Bucket: 'sharayeh', // Your S3 bucket name
      Key: s3Key, // File name you want to save as in S3
      Body: modifiedFileResponse.data,
      ContentType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      // ACL: 'public-read', // Removed to comply with bucket settings
    });

    try {
      const uploadToS3Response = await s3.send(putObjectCommand);
      console.log('✅ S3 Upload successful.');
    } catch (s3Error: any) {
      console.error('❌ Failed to upload to S3:', s3Error.message);
      throw new Error('Failed to upload the processed file to S3.');
    }

    // **Step 20: Generate the S3 Object URL**
    const processedFileUrl = `https://sharayeh.s3.eu-north-1.amazonaws.com/${encodeURIComponent(s3Key)}`;
    console.log('🌐 Processed file is available at:', processedFileUrl);

    // **Step 21: Save the `resultedFile2` URL to the Database**
    console.log('💾 Saving the processed file URL to the database.');

    try {
      // **Updated Logic: Find the specific file by userId and resultedFile**
      const file = await db.file.findFirst({
        where: {
          userId: userId,
          resultedFile: resultedFile,
        },
      });

      if (!file) {
        console.error('❌ File not found in the database.');
        throw new Error('File not found.');
      }

      // **Update only the found file's resultedFile2**
      await db.file.update({
        where: { id: file.id },
        data: { resultedFile2: processedFileUrl },
      });

      console.log('✅ Processed file URL saved to the database for file id:', file.id);
    } catch (dbError: any) {
      console.error('❌ Failed to save the processed file URL to the database:', dbError);
      throw new Error('Database update failed.');
    }

    // **Step 22: Cleanup - Delete the Temporary Uploaded File**
    if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
      try {
        await fs.promises.unlink(uploadedFilePath);
        console.log('🧹 Temporary file deleted:', uploadedFilePath);
      } catch (cleanupError) {
        console.error('❌ Failed to delete temporary file:', cleanupError);
      }
    }

    // **Step 23: Return the Processed File URL to the Frontend**
    console.log('📤 Returning response to frontend.');
    return NextResponse.json(
      {
        success: true,
        processedFileUrl,
        processedSlides,
        failedSlides,
      },
      { status: 200 }
    );

  } catch (error: any) { // Specify 'any' type for better error property access
    if (axios.isAxiosError(error)) {
      console.error('⚠️ Axios error:', {
        message: error.message,
        response: error.response
          ? {
              status: error.response.status,
              headers: error.response.headers,
              data: error.response.data,
            }
          : 'No response received',
        config: error.config,
      });
    } else {
      console.error('⚠️ Unexpected error:', error);
    }

    // **Step 24: Cleanup uploaded file if it exists**
    if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
      try {
        await fs.promises.unlink(uploadedFilePath);
        console.log('🧹 Temporary file deleted due to error:', uploadedFilePath);
      } catch (cleanupError) {
        console.error('❌ Failed to delete temporary file:', cleanupError);
      }
    }

    // **Return a JSON Error Response**
    return NextResponse.json(
      { success: false, error: 'Failed to process file.' },
      { status: 500 }
    );
  }
}


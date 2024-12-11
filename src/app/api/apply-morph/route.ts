// /app/api/apply-morph/route.ts

import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import axiosRetry from 'axios-retry';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export const runtime = 'nodejs'; // Ensure Node.js runtime

// Initialize Axios with retry logic and updated configurations
const axiosInstance = axios.create({
  timeout: 60000, // 30 seconds
  maxContentLength: Infinity, // Remove content length limit
  maxBodyLength: Infinity,    // Remove body length limit
  responseType: 'arraybuffer', // Default response type
});

// Configure Axios Retry
axiosRetry(axiosInstance, {
  retries: 3,
  retryDelay: (retryCount) => {
    return retryCount * 1000; // Exponential backoff
  },
  retryCondition: (error) => {
    // Retry on network errors or 5xx status codes
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || (error.response && error.response.status >= 500);
  },
});

// Separate Axios instance for authentication to isolate configurations
const axiosAuthInstance = axios.create({
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
});

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

    // **Step 3: Parse the JSON Body**
    console.log('📄 Parsing request body');
    const { resultedFile } = await req.json();

    if (!resultedFile) {
      console.error('❌ resultedFile URL is required.');
      return NextResponse.json(
        { success: false, error: 'resultedFile URL is required.' },
        { status: 400 }
      );
    }

    // **Step 4: Validate the resultedFile URL**
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

    // **Step 5: Download the File from the resultedFile URL**
    console.log(`⬇️ Downloading file from URL: ${resultedFile}`);
    const downloadResponse = await axiosInstance.get(resultedFile, { responseType: 'arraybuffer' });

    if (downloadResponse.status !== 200) {
      console.error(`❌ Failed to download file. Status code: ${downloadResponse.status}`);
      throw new Error(`Failed to download file. Status code: ${downloadResponse.status}`);
    }

    console.log('✅ File downloaded successfully.');

    // **Step 6: Determine the File Name from the URL**
    const urlPath = resultedFileUrl.pathname;
    originalFileName = path.basename(urlPath);
    const extension = path.extname(originalFileName);
    console.log(`📁 Original file name: ${originalFileName}`);

    // **Step 7: Generate a Unique Temporary File Path**
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const tempDir = os.tmpdir();
    uploadedFilePath = path.join(tempDir, `${uniqueId}${extension}`);
    console.log(`📂 Temporary file path: ${uploadedFilePath}`);

    // **Step 8: Save the Downloaded File to the Temporary Path**
    console.log('💾 Saving file to temporary path');
    await fs.promises.writeFile(uploadedFilePath, downloadResponse.data);
    console.log('✅ File saved to temporary path.');

    // **Step 9: Authenticate with Aspose API**
    console.log('🔑 Authenticating with Aspose API');
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', ASPOSE_CLIENT_ID);
    params.append('client_secret', ASPOSE_CLIENT_SECRET);

    let authResponse;
    try {
      authResponse = await axiosAuthInstance.post(
        'https://api.aspose.cloud/connect/token',
        params.toString()
      );
      console.log('🔑 Aspose Authentication Response:', authResponse.data); // Log the response
    } catch (authError: any) {
      console.error('❌ Aspose authentication failed:', authError.response?.data || authError.message);
      throw new Error('Aspose authentication failed.');
    }

    console.log('🔑 Aspose authentication successful. Access Token obtained.');

    const accessToken = authResponse.data.access_token;

    if (!accessToken) {
      console.error('❌ Access token is undefined. Authentication may have failed.');
      throw new Error('Access token not obtained.');
    }

    // **Step 10: Define uploadPath (File Name Only)**
    const uploadPath = originalFileName; // e.g., 'user_2oXAN2jOiLWJAICsojgKXgO82Az.pptx'
    console.log(`📤 Uploading file to Aspose Storage with uploadPath: ${uploadPath}`);

    const fileData = await fs.promises.readFile(uploadedFilePath);
    console.log('📄 File data read successfully.');

    const API_VERSION = 'v3.0'; // Update to 'v4.0' if applicable

    // **Step 11 & 12: Upload the File to Aspose Storage and Verify Upload in Parallel**
    console.log('📤 Uploading file to Aspose Storage and verifying upload.');
    const [uploadResponse, listFilesResponse] = await Promise.all([
      axiosInstance.put(
        `https://api.aspose.cloud/${API_VERSION}/slides/storage/file/${encodeURIComponent(uploadPath)}`,
        fileData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/octet-stream',
          },
        }
      ),
      axiosInstance.get(
        `https://api.aspose.cloud/${API_VERSION}/slides/storage/folder/`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: {
            path: '', // Explicitly specify the root path
          },
          responseType: 'json', // Ensure the response is treated as JSON
        }
      )
    ]);

    console.log('✅ File uploaded to Aspose Storage.');
    console.log('🔍 Listing files in Aspose Storage Response:', listFilesResponse.data);

    // **Step 13: Check if the File Exists in the Root Folder**
    const uploadedFiles = listFilesResponse.data.value;
    const fileExists = uploadedFiles.some((file: any) => file.name === originalFileName);

    console.log(`📁 File exists in root folder: ${fileExists}`);

    if (!fileExists) {
      console.error(`❌ File ${originalFileName} was not found in the root folder`);
      throw new Error(`File ${originalFileName} was not found in the root folder`);
    }

    // **Step 14: Get the Total Number of Slides**
    console.log(`📊 Retrieving slide count for file: ${uploadPath}`);
    const slideCountResponse = await axiosInstance.get(
      `https://api.aspose.cloud/${API_VERSION}/slides/${encodeURIComponent(uploadPath)}/slides`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        responseType: 'json', // Ensure the response is treated as JSON
      }
    );

    console.log('✅ Slide count retrieved.');

    const slideCount = slideCountResponse.data.slideList.length;
    console.log(`📊 Total number of slides: ${slideCount}`);

    // **Step 15: Apply Morph Transition to Each Slide Sequentially**
    console.log('🎨 Applying Morph transitions to all slides sequentially.');

    const processedSlides: number[] = [];
    const failedSlides: { slide: number; error: string }[] = [];

    for (let i = 1; i <= slideCount; i++) {
      try {
        await axiosInstance.put(
          `https://api.aspose.cloud/${API_VERSION}/slides/${encodeURIComponent(uploadPath)}/slides/${i}`,
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

    // **Step 16: Download the Modified File from Aspose**
    console.log(`⬇️ Downloading the modified file: ${uploadPath}`);
    const modifiedFileResponse = await axiosInstance.get(
      `https://api.aspose.cloud/${API_VERSION}/slides/storage/file/${encodeURIComponent(uploadPath)}`,
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

    // **Step 17: Upload the Modified File to AWS S3 Using AWS SDK v3**
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

    const uploadToS3Response = await s3.send(putObjectCommand);

    console.log('✅ S3 Upload successful.');

    // **Step 18: Generate the S3 Object URL**
    const processedFileUrl = `https://sharayeh.s3.eu-north-1.amazonaws.com/${encodeURIComponent(s3Key)}`;
    console.log('🌐 Processed file is available at:', processedFileUrl);

    // **Step 19: Cleanup - Delete the Temporary Uploaded File**
    if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
      await fs.promises.unlink(uploadedFilePath);
      console.log('🧹 Temporary file deleted:', uploadedFilePath);
    }

    // **Step 20: Return the Processed File URL to the Frontend**
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

    // **Cleanup uploaded file if it exists**
    if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
      await fs.promises.unlink(uploadedFilePath);
      console.log('🧹 Temporary file deleted due to error:', uploadedFilePath);
    }

    // **Return a JSON Error Response**
    return NextResponse.json(
      { success: false, error: 'Failed to process file.' },
      { status: 500 }
    );
  }
}






// // /app/api/apply-morph/route.ts

// import { NextRequest, NextResponse } from 'next/server';
// import axios from 'axios';
// import axiosRetry from 'axios-retry';
// import fs from 'fs';
// import os from 'os';
// import path from 'path';
// import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// export const runtime = 'nodejs'; // Ensure Node.js runtime

// // Initialize Axios with retry logic and updated configurations
// const axiosInstance = axios.create({
//   timeout: 30000, // 30 seconds
//   maxContentLength: Infinity, // Remove content length limit
//   maxBodyLength: Infinity,    // Remove body length limit
//   responseType: 'arraybuffer', // Default response type
// });

// // Configure Axios Retry
// axiosRetry(axiosInstance, {
//   retries: 3,
//   retryDelay: (retryCount) => {
//     return retryCount * 1000; // Exponential backoff
//   },
//   retryCondition: (error) => {
//     // Retry on network errors or 5xx status codes
//     return axiosRetry.isNetworkOrIdempotentRequestError(error) || (error.response && error.response.status >= 500);
//   },
// });

// // Separate Axios instance for authentication to isolate configurations
// const axiosAuthInstance = axios.create({
//   timeout: 30000, // 30 seconds
//   headers: {
//     'Content-Type': 'application/x-www-form-urlencoded',
//   },
// });

// export async function POST(req: NextRequest) {
//   console.log('📥 API handler invoked with method:', req.method);

//   let uploadedFilePath = ''; // Temporary file path
//   let originalFileName = '';

//   try {
//     // **Step 1: Retrieve and Validate Environment Variables**
//     const {
//       AWS_ACCESS_KEY_ID,
//       AWS_SECRET_ACCESS_KEY,
//       AWS_REGION,
//       ASPOSE_CLIENT_ID,
//       ASPOSE_CLIENT_SECRET,
//     } = process.env;

//     if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !AWS_REGION) {
//       console.error('❌ Missing AWS environment variables');
//       return NextResponse.json(
//         { success: false, error: 'Server configuration error: Missing AWS credentials.' },
//         { status: 500 }
//       );
//     }

//     if (!ASPOSE_CLIENT_ID || !ASPOSE_CLIENT_SECRET) {
//       console.error('❌ Missing Aspose environment variables');
//       return NextResponse.json(
//         { success: false, error: 'Server configuration error: Missing Aspose credentials.' },
//         { status: 500 }
//       );
//     }

//     // **Optional Logging (Do Not Log Secrets)**
//     console.log('🌍 AWS Region:', AWS_REGION);
//     console.log('🔑 Aspose Client ID:', ASPOSE_CLIENT_ID);

//     // **Step 2: Initialize AWS S3 Client with AWS SDK v3**
//     const s3 = new S3Client({
//       region: AWS_REGION, // Europe (Stockholm)
//       credentials: {
//         accessKeyId: AWS_ACCESS_KEY_ID,
//         secretAccessKey: AWS_SECRET_ACCESS_KEY,
//       },
//     });

//     // **Step 3: Parse the JSON Body**
//     console.log('📄 Parsing request body');
//     const { resultedFile } = await req.json();

//     if (!resultedFile) {
//       console.error('❌ resultedFile URL is required.');
//       return NextResponse.json(
//         { success: false, error: 'resultedFile URL is required.' },
//         { status: 400 }
//       );
//     }

//     // **Step 4: Validate the resultedFile URL**
//     const allowedDomains = ['sharayeh.s3.eu-north-1.amazonaws.com'];
//     let resultedFileUrl: URL;
//     try {
//       resultedFileUrl = new URL(resultedFile);
//     } catch (urlError) {
//       console.error('❌ Invalid resultedFile URL:', resultedFile);
//       return NextResponse.json(
//         { success: false, error: 'Invalid resultedFile URL.' },
//         { status: 400 }
//       );
//     }

//     if (!allowedDomains.includes(resultedFileUrl.hostname)) {
//       console.error('❌ Invalid resultedFile domain:', resultedFileUrl.hostname);
//       return NextResponse.json(
//         { success: false, error: 'Invalid resultedFile URL domain.' },
//         { status: 400 }
//       );
//     }

//     // **Step 5: Download the File from the resultedFile URL**
//     console.log(`⬇️ Downloading file from URL: ${resultedFile}`);
//     const downloadResponse = await axiosInstance.get(resultedFile, { responseType: 'arraybuffer' });

//     if (downloadResponse.status !== 200) {
//       console.error(`❌ Failed to download file. Status code: ${downloadResponse.status}`);
//       throw new Error(`Failed to download file. Status code: ${downloadResponse.status}`);
//     }

//     console.log('✅ File downloaded successfully.');

//     // **Step 6: Determine the File Name from the URL**
//     const urlPath = resultedFileUrl.pathname;
//     originalFileName = path.basename(urlPath);
//     const extension = path.extname(originalFileName);
//     console.log(`📁 Original file name: ${originalFileName}`);

//     // **Step 7: Generate a Unique Temporary File Path**
//     const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
//     const tempDir = os.tmpdir();
//     uploadedFilePath = path.join(tempDir, `${uniqueId}${extension}`);
//     console.log(`📂 Temporary file path: ${uploadedFilePath}`);

//     // **Step 8: Save the Downloaded File to the Temporary Path**
//     console.log('💾 Saving file to temporary path');
//     await fs.promises.writeFile(uploadedFilePath, downloadResponse.data);
//     console.log('✅ File saved to temporary path.');

//     // **Step 9: Authenticate with Aspose API**
//     console.log('🔑 Authenticating with Aspose API');
//     const params = new URLSearchParams();
//     params.append('grant_type', 'client_credentials');
//     params.append('client_id', ASPOSE_CLIENT_ID);
//     params.append('client_secret', ASPOSE_CLIENT_SECRET);

//     let authResponse;
//     try {
//       authResponse = await axiosAuthInstance.post(
//         'https://api.aspose.cloud/connect/token',
//         params.toString()
//       );
//       console.log('🔑 Aspose Authentication Response:', authResponse.data); // Log the response
//     } catch (authError: any) {
//       console.error('❌ Aspose authentication failed:', authError.response?.data || authError.message);
//       throw new Error('Aspose authentication failed.');
//     }

//     console.log('🔑 Aspose authentication successful. Access Token obtained.');

//     const accessToken = authResponse.data.access_token;

//     if (!accessToken) {
//       console.error('❌ Access token is undefined. Authentication may have failed.');
//       throw new Error('Access token not obtained.');
//     }

//     // **Step 10: Define uploadPath (File Name Only)**
//     const uploadPath = originalFileName; // e.g., 'user_2oXAN2jOiLWJAICsojgKXgO82Az.pptx'
//     console.log(`📤 Uploading file to Aspose Storage with uploadPath: ${uploadPath}`);

//     const fileData = await fs.promises.readFile(uploadedFilePath);
//     console.log('📄 File data read successfully.');

//     const API_VERSION = 'v3.0'; // Update to 'v4.0' if applicable

//     // **Step 11 & 12: Upload the File to Aspose Storage and Verify Upload in Parallel**
//     console.log('📤 Uploading file to Aspose Storage and verifying upload.');
//     const [uploadResponse, listFilesResponse] = await Promise.all([
//       axiosInstance.put(
//         `https://api.aspose.cloud/${API_VERSION}/slides/storage/file/${encodeURIComponent(uploadPath)}`,
//         fileData,
//         {
//           headers: {
//             Authorization: `Bearer ${accessToken}`,
//             'Content-Type': 'application/octet-stream',
//           },
//         }
//       ),
//       axiosInstance.get(
//         `https://api.aspose.cloud/${API_VERSION}/slides/storage/folder/`,
//         {
//           headers: {
//             Authorization: `Bearer ${accessToken}`,
//           },
//           params: {
//             path: '/', // Explicitly specify the root path
//           },
//           responseType: 'json', // Ensure the response is treated as JSON
//         }
//       )
//     ]);

//     console.log('✅ File uploaded to Aspose Storage.');
//     console.log('🔍 Listing files in Aspose Storage Response:', listFilesResponse.data);

//     // **Step 13: Check if the File Exists in the Root Folder**
//     const uploadedFiles = listFilesResponse.data.value;
//     const fileExists = uploadedFiles.some((file: any) => file.name === originalFileName);

//     console.log(`📁 File exists in root folder: ${fileExists}`);

//     if (!fileExists) {
//       console.error(`❌ File ${originalFileName} was not found in the root folder`);
//       throw new Error(`File ${originalFileName} was not found in the root folder`);
//     }

//     // **Step 14: Get the Total Number of Slides**
//     console.log(`📊 Retrieving slide count for file: ${uploadPath}`);
//     const slideCountResponse = await axiosInstance.get(
//       `https://api.aspose.cloud/${API_VERSION}/slides/${encodeURIComponent(uploadPath)}/slides`,
//       {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//         },
//         responseType: 'json', // Ensure the response is treated as JSON
//       }
//     );

//     console.log('✅ Slide count retrieved.');

//     const slideCount = slideCountResponse.data.slideList.length;
//     console.log(`📊 Total number of slides: ${slideCount}`);

//     // **Step 15: Apply Morph Transition to Each Slide in Parallel**
//     console.log('🎨 Applying Morph transitions to all slides in parallel.');

//     const processedSlides = [];
//     const failedSlides = [];

//     // To optimize performance, process slides in parallel using Promise.all
//     const slidePromises = [];

//     for (let i = 1; i <= slideCount; i++) {
//       const slidePromise = axiosInstance.put(
//         `https://api.aspose.cloud/${API_VERSION}/slides/${encodeURIComponent(uploadPath)}/slides/${i}`,
//         {
//           slideShowTransition: {
//             type: 'Morph',
//             duration: 1000, // Duration in milliseconds
//             easing: 'ease-in-out', // Transition easing function
//             morphTransition: {
//               morphType: 'ByWord', // Try 'ByWord' or 'ByChar' instead of 'ByObject'
//             },
//           },
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${accessToken}`,
//             'Content-Type': 'application/json',
//           },
//         }
//       )
//         .then(() => {
//           console.log(`✅ Successfully applied Morph transition to slide ${i}.`);
//           processedSlides.push(i);
//         })
//         .catch((slideError: any) => {
//           console.error(`❌ Error applying Morph transition to slide ${i}:`, slideError.response?.data || slideError.message);
//           failedSlides.push({ slide: i, error: slideError.message });
//         });

//       slidePromises.push(slidePromise);
//     }

//     // Wait for all slide transitions to complete
//     await Promise.all(slidePromises);

//     // **Log the Results**
//     console.log('✅ Processed slides:', processedSlides);
//     if (failedSlides.length > 0) {
//       console.warn('❌ Failed slides:', failedSlides);
//     }

//     // **Step 16: Download the Modified File from Aspose**
//     console.log(`⬇️ Downloading the modified file: ${uploadPath}`);
//     const modifiedFileResponse = await axiosInstance.get(
//       `https://api.aspose.cloud/${API_VERSION}/slides/storage/file/${encodeURIComponent(uploadPath)}`,
//       {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//         },
//         responseType: 'arraybuffer', // Ensure the response is in binary format
//       }
//     );

//     if (modifiedFileResponse.status !== 200) {
//       console.error(`❌ Failed to download modified file. Status code: ${modifiedFileResponse.status}`);
//       throw new Error(`Failed to download modified file. Status code: ${modifiedFileResponse.status}`);
//     }

//     console.log('✅ Modified file downloaded successfully.');

//     // **Step 17: Upload the Modified File to AWS S3 Using AWS SDK v3**
//     console.log('📤 Uploading the modified file to AWS S3.');

//     const processedFileName = `processed-${originalFileName}`;
//     const s3Key = processedFileName; // You can customize the key/path as needed

//     const putObjectCommand = new PutObjectCommand({
//       Bucket: 'sharayeh', // Your S3 bucket name
//       Key: s3Key, // File name you want to save as in S3
//       Body: modifiedFileResponse.data,
//       ContentType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
//       // ACL: 'public-read', // Removed to comply with bucket settings
//     });

//     const uploadToS3Response = await s3.send(putObjectCommand);

//     console.log('✅ S3 Upload successful.');

//     // **Step 18: Generate the S3 Object URL**
//     const processedFileUrl = `https://sharayeh.s3.eu-north-1.amazonaws.com/${encodeURIComponent(s3Key)}`;
//     console.log('🌐 Processed file is available at:', processedFileUrl);

//     // **Step 19: Cleanup - Delete the Temporary Uploaded File**
//     if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
//       await fs.promises.unlink(uploadedFilePath);
//       console.log('🧹 Temporary file deleted:', uploadedFilePath);
//     }

//     // **Step 20: Return the Processed File URL to the Frontend**
//     console.log('📤 Returning response to frontend.');
//     return NextResponse.json(
//       {
//         success: true,
//         processedFileUrl,
//         processedSlides,
//         failedSlides,
//       },
//       { status: 200 }
//     );

//   } catch (error: any) { // Specify 'any' type for better error property access
//     if (axios.isAxiosError(error)) {
//       console.error('⚠️ Axios error:', {
//         message: error.message,
//         response: error.response
//           ? {
//               status: error.response.status,
//               headers: error.response.headers,
//               data: error.response.data,
//             }
//           : 'No response received',
//         config: error.config,
//       });
//     } else {
//       console.error('⚠️ Unexpected error:', error);
//     }

//     // **Cleanup uploaded file if it exists**
//     if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
//       await fs.promises.unlink(uploadedFilePath);
//       console.log('🧹 Temporary file deleted due to error:', uploadedFilePath);
//     }

//     // **Return a JSON Error Response**
//     return NextResponse.json(
//       { success: false, error: 'Failed to process file.' },
//       { status: 500 }
//     );
//   }
// }





// // /app/api/apply-morph/route.ts

// import { NextRequest, NextResponse } from 'next/server';
// import axios from 'axios';
// import axiosRetry from 'axios-retry';
// import fs from 'fs';
// import os from 'os';
// import path from 'path';
// import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// export const runtime = 'nodejs'; // Ensure Node.js runtime

// // Initialize Axios with retry logic
// const axiosInstance = axios.create({
//   timeout: 30000, // 30 seconds
// });

// axiosRetry(axiosInstance, {
//   retries: 3,
//   retryDelay: (retryCount) => {
//     return retryCount * 1000; // Exponential backoff
//   },
//   retryCondition: (error) => {
//     return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.response.status === 500;
//   },
// });

// export async function POST(req: NextRequest) {
//   console.log('📥 API handler invoked with method:', req.method);

//   let uploadedFilePath = ''; // Temporary file path
//   let originalFileName = '';

//   try {
//     // **Step 1: Retrieve and Validate Environment Variables**
//     const {
//       AWS_ACCESS_KEY_ID,
//       AWS_SECRET_ACCESS_KEY,
//       AWS_REGION,
//       ASPOSE_CLIENT_ID,
//       ASPOSE_CLIENT_SECRET,
//     } = process.env;

//     if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !AWS_REGION) {
//       console.error('❌ Missing AWS environment variables');
//       return NextResponse.json(
//         { success: false, error: 'Server configuration error: Missing AWS credentials.' },
//         { status: 500 }
//       );
//     }

//     if (!ASPOSE_CLIENT_ID || !ASPOSE_CLIENT_SECRET) {
//       console.error('❌ Missing Aspose environment variables');
//       return NextResponse.json(
//         { success: false, error: 'Server configuration error: Missing Aspose credentials.' },
//         { status: 500 }
//       );
//     }

//     // **Optional Logging (Do Not Log Secrets)**
//     console.log('🌍 AWS Region:', AWS_REGION);
//     console.log('🔑 Aspose Client ID:', ASPOSE_CLIENT_ID);

//     // **Step 2: Initialize AWS S3 Client with AWS SDK v3**
//     const s3 = new S3Client({
//       region: AWS_REGION, // Europe (Stockholm)
//       credentials: {
//         accessKeyId: AWS_ACCESS_KEY_ID,
//         secretAccessKey: AWS_SECRET_ACCESS_KEY,
//       },
//     });

//     // **Step 3: Parse the JSON Body**
//     console.log('📄 Parsing request body');
//     const { resultedFile } = await req.json();

//     if (!resultedFile) {
//       console.error('❌ resultedFile URL is required.');
//       return NextResponse.json(
//         { success: false, error: 'resultedFile URL is required.' },
//         { status: 400 }
//       );
//     }

//     // **Step 4: Validate the resultedFile URL**
//     const allowedDomains = ['sharayeh.s3.eu-north-1.amazonaws.com'];
//     let resultedFileUrl: URL;
//     try {
//       resultedFileUrl = new URL(resultedFile);
//     } catch (urlError) {
//       console.error('❌ Invalid resultedFile URL:', resultedFile);
//       return NextResponse.json(
//         { success: false, error: 'Invalid resultedFile URL.' },
//         { status: 400 }
//       );
//     }

//     if (!allowedDomains.includes(resultedFileUrl.hostname)) {
//       console.error('❌ Invalid resultedFile domain:', resultedFileUrl.hostname);
//       return NextResponse.json(
//         { success: false, error: 'Invalid resultedFile URL domain.' },
//         { status: 400 }
//       );
//     }

//     // **Step 5: Download the File from the resultedFile URL**
//     console.log(`⬇️ Downloading file from URL: ${resultedFile}`);
//     const downloadResponse = await axiosInstance.get(resultedFile, { responseType: 'arraybuffer' });

//     if (downloadResponse.status !== 200) {
//       console.error(`❌ Failed to download file. Status code: ${downloadResponse.status}`);
//       throw new Error(`Failed to download file. Status code: ${downloadResponse.status}`);
//     }

//     console.log('✅ File downloaded successfully.');

//     // **Step 6: Determine the File Name from the URL**
//     const urlPath = resultedFileUrl.pathname;
//     originalFileName = path.basename(urlPath);
//     const extension = path.extname(originalFileName);
//     console.log(`📁 Original file name: ${originalFileName}`);

//     // **Step 7: Generate a Unique Temporary File Path**
//     const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
//     const tempDir = os.tmpdir();
//     uploadedFilePath = path.join(tempDir, `${uniqueId}${extension}`);
//     console.log(`📂 Temporary file path: ${uploadedFilePath}`);

//     // **Step 8: Save the Downloaded File to the Temporary Path**
//     console.log('💾 Saving file to temporary path');
//     await fs.promises.writeFile(uploadedFilePath, downloadResponse.data);
//     console.log('✅ File saved to temporary path.');

//     // **Step 9: Authenticate with Aspose API**
//     console.log('🔑 Authenticating with Aspose API');
//     const params = new URLSearchParams();
//     params.append('grant_type', 'client_credentials');
//     params.append('client_id', ASPOSE_CLIENT_ID);
//     params.append('client_secret', ASPOSE_CLIENT_SECRET);

//     let authResponse;
//     try {
//       authResponse = await axiosInstance.post(
//         'https://api.aspose.cloud/connect/token',
//         params.toString(),
//         {
//           headers: {
//             'Content-Type': 'application/x-www-form-urlencoded',
//           },
//         }
//       );
//     } catch (authError: any) {
//       console.error('❌ Aspose authentication failed:', authError.response?.data || authError.message);
//       throw new Error('Aspose authentication failed.');
//     }

//     console.log('🔑 Aspose authentication successful. Access Token obtained.');

//     const accessToken = authResponse.data.access_token;

//     // **Step 10: Define uploadPath (File Name Only)**
//     const uploadPath = originalFileName; // e.g., 'user_2oXAN2jOiLWJAICsojgKXgO82Az.pptx'
//     console.log(`📤 Uploading file to Aspose Storage with uploadPath: ${uploadPath}`);

//     const fileData = await fs.promises.readFile(uploadedFilePath);
//     console.log('📄 File data read successfully.');

//     const API_VERSION = 'v3.0'; // Update to 'v4.0' if applicable

//     // **Step 11 & 12: Upload the File to Aspose Storage and Verify Upload in Parallel**
//     console.log('📤 Uploading file to Aspose Storage and verifying upload.');
//     const [uploadResponse, listFilesResponse] = await Promise.all([
//       axiosInstance.put(
//         `https://api.aspose.cloud/${API_VERSION}/slides/storage/file/${encodeURIComponent(uploadPath)}`,
//         fileData,
//         {
//           headers: {
//             Authorization: `Bearer ${accessToken}`,
//             'Content-Type': 'application/octet-stream',
//           },
//         }
//       ),
//       axiosInstance.get(
//         `https://api.aspose.cloud/${API_VERSION}/slides/storage/folder/`,
//         {
//           headers: {
//             Authorization: `Bearer ${accessToken}`,
//           },
//         }
//       )
//     ]);

//     console.log('✅ File uploaded to Aspose Storage.');
//     console.log('✅ Verified upload by listing files in root folder.');

//     // **Step 13: Check if the File Exists in the Root Folder**
//     const uploadedFiles = listFilesResponse.data.value;
//     const fileExists = uploadedFiles.some((file: any) => file.name === originalFileName);

//     console.log(`📁 File exists in root folder: ${fileExists}`);

//     if (!fileExists) {
//       console.error(`❌ File ${originalFileName} was not found in the root folder`);
//       throw new Error(`File ${originalFileName} was not found in the root folder`);
//     }

//     // **Step 14: Get the Total Number of Slides**
//     console.log(`📊 Retrieving slide count for file: ${uploadPath}`);
//     const slideCountResponse = await axiosInstance.get(
//       `https://api.aspose.cloud/${API_VERSION}/slides/${encodeURIComponent(uploadPath)}/slides`,
//       {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//         },
//       }
//     );

//     console.log('✅ Slide count retrieved.');

//     const slideCount = slideCountResponse.data.slideList.length;
//     console.log(`📊 Total number of slides: ${slideCount}`);


//         // **Step 15: Apply Morph Transition to Each Slide in Parallel**
//     console.log('🎨 Applying Morph transitions to all slides in parallel.');

//     const processedSlides = [];
//     const failedSlides = [];

//     for (let i = 1; i <= slideCount; i++) {
//       try {
//         await axiosInstance.put(
//           `https://api.aspose.cloud/${API_VERSION}/slides/${encodeURIComponent(uploadPath)}/slides/${i}`,
//           {

//             slideShowTransition: {
//               type: 'Morph',
//               duration: 1000, // Duration in milliseconds
//               easing: 'ease-in-out', // Transition easing function
//               morphTransition: {
//                 morphType: 'ByWord', // Try 'ByWord' or 'ByChar' instead of 'ByObject'
//               },
//             },

//           },
//           {
//             headers: {
//               Authorization: `Bearer ${accessToken}`,
//               'Content-Type': 'application/json',
//             },
//           }
//         );
//         console.log(`✅ Successfully applied Morph transition to slide ${i}.`);
//         processedSlides.push(i);
//       } catch (slideError: any) {
//         console.error(`❌ Error applying Morph transition to slide ${i}:`, slideError.response?.data || slideError.message);
//         failedSlides.push({ slide: i, error: slideError.message });
//       }
//     }

//     // **Log the Results**
//     console.log('✅ Processed slides:', processedSlides);
//     if (failedSlides.length > 0) {
//       console.warn('❌ Failed slides:', failedSlides);
//     }


//     // **Step 16: Download the Modified File from Aspose**
//     console.log(`⬇️ Downloading the modified file: ${uploadPath}`);
//     const modifiedFileResponse = await axiosInstance.get(
//       `https://api.aspose.cloud/${API_VERSION}/slides/storage/file/${encodeURIComponent(uploadPath)}`,
//       {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//         },
//         responseType: 'arraybuffer', // Ensure the response is in binary format
//       }
//     );

//     if (modifiedFileResponse.status !== 200) {
//       console.error(`❌ Failed to download modified file. Status code: ${modifiedFileResponse.status}`);
//       throw new Error(`Failed to download modified file. Status code: ${modifiedFileResponse.status}`);
//     }

//     console.log('✅ Modified file downloaded successfully.');

//     // **Step 17: Upload the Modified File to AWS S3 Using AWS SDK v3**
//     console.log('📤 Uploading the modified file to AWS S3.');

//     const processedFileName = `processed-${originalFileName}`;
//     const s3Key = processedFileName; // You can customize the key/path as needed

//     const putObjectCommand = new PutObjectCommand({
//       Bucket: 'sharayeh', // Your S3 bucket name
//       Key: s3Key, // File name you want to save as in S3
//       Body: modifiedFileResponse.data,
//       ContentType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
//       // ACL: 'public-read', // Removed to comply with bucket settings
//     });

//     const uploadToS3Response = await s3.send(putObjectCommand);

//     console.log('✅ S3 Upload successful.');

//     // **Step 18: Generate the S3 Object URL**
//     const processedFileUrl = `https://sharayeh.s3.eu-north-1.amazonaws.com/${encodeURIComponent(s3Key)}`;
//     console.log('🌐 Processed file is available at:', processedFileUrl);

//     // **Step 19: Cleanup - Delete the Temporary Uploaded File**
//     if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
//       await fs.promises.unlink(uploadedFilePath);
//       console.log('🧹 Temporary file deleted:', uploadedFilePath);
//     }

//     // **Step 20: Return the Processed File URL to the Frontend**
//     console.log('📤 Returning response to frontend.');
//     return NextResponse.json(
//       {
//         success: true,
//         processedFileUrl,
//         processedSlides,
//         failedSlides,
//       },
//       { status: 200 }
//     );

//   } catch (error: any) { // Specify 'any' type for better error property access
//     if (axios.isAxiosError(error)) {
//       console.error('⚠️ Axios error:', {
//         message: error.message,
//         response: error.response
//           ? {
//               status: error.response.status,
//               headers: error.response.headers,
//               data: error.response.data,
//             }
//           : 'No response received',
//         config: error.config,
//       });
//     } else {
//       console.error('⚠️ Unexpected error:', error);
//     }

//     // **Cleanup uploaded file if it exists**
//     if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
//       await fs.promises.unlink(uploadedFilePath);
//       console.log('🧹 Temporary file deleted due to error:', uploadedFilePath);
//     }

//     // **Return a JSON Error Response**
//     return NextResponse.json(
//       { success: false, error: 'Failed to process file.' },
//       { status: 500 }
//     );
//   }
// }








// // /app/api/apply-morph/route.ts

// import { NextRequest, NextResponse } from 'next/server';
// import axios from 'axios';
// import axiosRetry from 'axios-retry';
// import fs from 'fs';
// import os from 'os';
// import path from 'path';
// import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// export const runtime = 'nodejs'; // Ensure Node.js runtime

// // Initialize Axios with retry logic
// const axiosInstance = axios.create({
//   timeout: 30000, // 30 seconds
// });

// axiosRetry(axiosInstance, {
//   retries: 3,
//   retryDelay: (retryCount) => {
//     return retryCount * 1000; // Exponential backoff
//   },
//   retryCondition: (error) => {
//     return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.response.status === 500;
//   },
// });

// export async function POST(req: NextRequest) {
//   console.log('📥 API handler invoked with method:', req.method);

//   let uploadedFilePath = ''; // Temporary file path
//   let originalFileName = '';

//   try {
//     // **Step 1: Retrieve and Validate Environment Variables**
//     const {
//       AWS_ACCESS_KEY_ID,
//       AWS_SECRET_ACCESS_KEY,
//       AWS_REGION,
//       ASPOSE_CLIENT_ID,
//       ASPOSE_CLIENT_SECRET,
//     } = process.env;

//     if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !AWS_REGION) {
//       console.error('❌ Missing AWS environment variables');
//       return NextResponse.json(
//         { success: false, error: 'Server configuration error: Missing AWS credentials.' },
//         { status: 500 }
//       );
//     }

//     if (!ASPOSE_CLIENT_ID || !ASPOSE_CLIENT_SECRET) {
//       console.error('❌ Missing Aspose environment variables');
//       return NextResponse.json(
//         { success: false, error: 'Server configuration error: Missing Aspose credentials.' },
//         { status: 500 }
//       );
//     }

//     // **Optional Logging (Do Not Log Secrets)**
//     console.log('🌍 AWS Region:', AWS_REGION);
//     console.log('🔑 Aspose Client ID:', ASPOSE_CLIENT_ID);

//     // **Step 2: Initialize AWS S3 Client with AWS SDK v3**
//     const s3 = new S3Client({
//       region: AWS_REGION, // Europe (Stockholm)
//       credentials: {
//         accessKeyId: AWS_ACCESS_KEY_ID,
//         secretAccessKey: AWS_SECRET_ACCESS_KEY,
//       },
//     });

//     // **Step 3: Parse the JSON Body**
//     console.log('📄 Parsing request body');
//     const { resultedFile } = await req.json();

//     if (!resultedFile) {
//       console.error('❌ resultedFile URL is required.');
//       return NextResponse.json(
//         { success: false, error: 'resultedFile URL is required.' },
//         { status: 400 }
//       );
//     }

//     // **Step 4: Validate the resultedFile URL**
//     const allowedDomains = ['sharayeh.s3.eu-north-1.amazonaws.com'];
//     let resultedFileUrl: URL;
//     try {
//       resultedFileUrl = new URL(resultedFile);
//     } catch (urlError) {
//       console.error('❌ Invalid resultedFile URL:', resultedFile);
//       return NextResponse.json(
//         { success: false, error: 'Invalid resultedFile URL.' },
//         { status: 400 }
//       );
//     }

//     if (!allowedDomains.includes(resultedFileUrl.hostname)) {
//       console.error('❌ Invalid resultedFile domain:', resultedFileUrl.hostname);
//       return NextResponse.json(
//         { success: false, error: 'Invalid resultedFile URL domain.' },
//         { status: 400 }
//       );
//     }

//     // **Step 5: Download the File from the resultedFile URL**
//     console.log(`⬇️ Downloading file from URL: ${resultedFile}`);
//     const downloadResponse = await axiosInstance.get(resultedFile, { responseType: 'arraybuffer' });

//     if (downloadResponse.status !== 200) {
//       console.error(`❌ Failed to download file. Status code: ${downloadResponse.status}`);
//       throw new Error(`Failed to download file. Status code: ${downloadResponse.status}`);
//     }

//     console.log('✅ File downloaded successfully.');

//     // **Step 6: Determine the File Name from the URL**
//     const urlPath = resultedFileUrl.pathname;
//     originalFileName = path.basename(urlPath);
//     const extension = path.extname(originalFileName);
//     console.log(`📁 Original file name: ${originalFileName}`);

//     // **Step 7: Generate a Unique Temporary File Path**
//     const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
//     const tempDir = os.tmpdir();
//     uploadedFilePath = path.join(tempDir, `${uniqueId}${extension}`);
//     console.log(`📂 Temporary file path: ${uploadedFilePath}`);

//     // **Step 8: Save the Downloaded File to the Temporary Path**
//     console.log('💾 Saving file to temporary path');
//     await fs.promises.writeFile(uploadedFilePath, downloadResponse.data);
//     console.log('✅ File saved to temporary path.');

//     // **Step 9: Authenticate with Aspose API**
//     console.log('🔑 Authenticating with Aspose API');
//     const params = new URLSearchParams();
//     params.append('grant_type', 'client_credentials');
//     params.append('client_id', ASPOSE_CLIENT_ID);
//     params.append('client_secret', ASPOSE_CLIENT_SECRET);

//     let authResponse;
//     try {
//       authResponse = await axiosInstance.post(
//         'https://api.aspose.cloud/connect/token',
//         params.toString(),
//         {
//           headers: {
//             'Content-Type': 'application/x-www-form-urlencoded',
//           },
//         }
//       );
//     } catch (authError: any) {
//       console.error('❌ Aspose authentication failed:', authError.response?.data || authError.message);
//       throw new Error('Aspose authentication failed.');
//     }

//     console.log('🔑 Aspose authentication successful. Access Token obtained.');

//     const accessToken = authResponse.data.access_token;

//     // **Step 10: Define uploadPath (File Name Only)**
//     const uploadPath = originalFileName; // e.g., 'user_2oXAN2jOiLWJAICsojgKXgO82Az.pptx'
//     console.log(`📤 Uploading file to Aspose Storage with uploadPath: ${uploadPath}`);

//     const fileData = await fs.promises.readFile(uploadedFilePath);
//     console.log('📄 File data read successfully.');

//     const API_VERSION = 'v3.0'; // Update to 'v4.0' if applicable

//     // **Step 11 & 12: Upload the File to Aspose Storage and Verify Upload in Parallel**
//     console.log('📤 Uploading file to Aspose Storage and verifying upload.');
//     // const [uploadResponse, listFilesResponse] = await Promise.all([
//     //   axiosInstance.put(
//     //     `https://api.aspose.cloud/${API_VERSION}/slides/storage/file/${encodeURIComponent(uploadPath)}`,
//     //     fileData,
//     //     {
//     //       headers: {
//     //         Authorization: `Bearer ${accessToken}`,
//     //         'Content-Type': 'application/octet-stream',
//     //       },
//     //     }
//     //   ),
//     //   axiosInstance.get(
//     //     `https://api.aspose.cloud/${API_VERSION}/slides/storage/folder/`,
//     //     {
//     //       headers: {
//     //         Authorization: `Bearer ${accessToken}`,
//     //       },
//     //     }
//     //   )
//     // ]);

//     // console.log('✅ File uploaded to Aspose Storage.');
//     // console.log('✅ Verified upload by listing files in root folder.');

//     // // **Step 13: Check if the File Exists in the Root Folder**
//     // const uploadedFiles = listFilesResponse.data.value;
//     // const fileExists = uploadedFiles.some((file: any) => file.name === originalFileName);

//     // console.log(`📁 File exists in root folder: ${fileExists}`);

//     // if (!fileExists) {
//     //   console.error(`❌ File ${originalFileName} was not found in the root folder`);
//     //   throw new Error(`File ${originalFileName} was not found in the root folder`);
//     // }

//     // **Step 14: Get the Total Number of Slides**
//     console.log(`📊 Retrieving slide count for file: ${uploadPath}`);
//     const slideCountResponse = await axiosInstance.get(
//       `https://api.aspose.cloud/${API_VERSION}/slides/${encodeURIComponent(uploadPath)}/slides`,
//       {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//         },
//       }
//     );

//     console.log('✅ Slide count retrieved.');

//     const slideCount = slideCountResponse.data.slideList.length;
//     console.log(`📊 Total number of slides: ${slideCount}`);



//     // // **Step 15: Apply Morph Transition to Each Slide in Parallel**
//     // console.log('🎨 Applying Morph transitions to all slides in parallel.');
//     // const morphPromises = [];
//     // for (let i = 1; i <= slideCount; i++) {
//     //   morphPromises.push(
//     //     axiosInstance.put(
//     //       `https://api.aspose.cloud/${API_VERSION}/slides/${encodeURIComponent(uploadPath)}/slides/${i}`,
//     //       {
//     //         slideShowTransition: {
//     //           type: 'Morph',
//     //           morphTransition: {
//     //             morphType: 'ByObject', // Options: 'ByObject', 'ByWord', 'ByChar'
//     //           },
//     //         },
//     //       },
//     //       {
//     //         headers: {
//     //           Authorization: `Bearer ${accessToken}`,
//     //           'Content-Type': 'application/json',
//     //         },
//     //       }
//     //     ).then(() => {
//     //       console.log(`✅ Successfully applied Morph transition to slide ${i}.`);
//     //     }).catch((slideError: any) => {
//     //       console.error(`❌ Error applying Morph transition to slide ${i}:`, slideError.response?.data || slideError.message);
//     //       throw new Error(`Failed to apply Morph transition to slide ${i}.`);
//     //     })
//     //   );
//     // }

//     // // Await all morph transition promises
//     // await Promise.all(morphPromises);
//     // console.log('✅ All Morph transitions applied successfully.');



//         // **Step 15: Apply Morph Transition to Each Slide in Parallel**
//     console.log('🎨 Applying Morph transitions to all slides in parallel.');

//     const processedSlides = [];
//     const failedSlides = [];

//     for (let i = 1; i <= slideCount; i++) {
//       try {
//         await axiosInstance.put(
//           `https://api.aspose.cloud/${API_VERSION}/slides/${encodeURIComponent(uploadPath)}/slides/${i}`,
//           {

//             slideShowTransition: {
//               type: 'Morph',
//               duration: 1000, // Duration in milliseconds
//               easing: 'ease-in-out', // Transition easing function
//               morphTransition: {
//                 morphType: 'ByWord', // Try 'ByWord' or 'ByChar' instead of 'ByObject'
//               },
//             },

//             // slideShowTransition: {
//             //   type: 'Morph',
//             //   morphTransition: {
//             //     morphType: 'ByObject',  // Options: 'ByObject', 'ByWord', 'ByChar'
//             //   },
//             // },
//           },
//           {
//             headers: {
//               Authorization: `Bearer ${accessToken}`,
//               'Content-Type': 'application/json',
//             },
//           }
//         );
//         console.log(`✅ Successfully applied Morph transition to slide ${i}.`);
//         processedSlides.push(i);
//       } catch (slideError: any) {
//         console.error(`❌ Error applying Morph transition to slide ${i}:`, slideError.response?.data || slideError.message);
//         failedSlides.push({ slide: i, error: slideError.message });
//       }
//     }

//     // **Log the Results**
//     console.log('✅ Processed slides:', processedSlides);
//     if (failedSlides.length > 0) {
//       console.warn('❌ Failed slides:', failedSlides);
//     }


//     // **Step 16: Download the Modified File from Aspose**
//     console.log(`⬇️ Downloading the modified file: ${uploadPath}`);
//     const modifiedFileResponse = await axiosInstance.get(
//       `https://api.aspose.cloud/${API_VERSION}/slides/storage/file/${encodeURIComponent(uploadPath)}`,
//       {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//         },
//         responseType: 'arraybuffer', // Ensure the response is in binary format
//       }
//     );

//     if (modifiedFileResponse.status !== 200) {
//       console.error(`❌ Failed to download modified file. Status code: ${modifiedFileResponse.status}`);
//       throw new Error(`Failed to download modified file. Status code: ${modifiedFileResponse.status}`);
//     }

//     console.log('✅ Modified file downloaded successfully.');

//     // **Step 17: Upload the Modified File to AWS S3 Using AWS SDK v3**
//     console.log('📤 Uploading the modified file to AWS S3.');

//     const processedFileName = `processed-${originalFileName}`;
//     const s3Key = processedFileName; // You can customize the key/path as needed

//     const putObjectCommand = new PutObjectCommand({
//       Bucket: 'sharayeh', // Your S3 bucket name
//       Key: s3Key, // File name you want to save as in S3
//       Body: modifiedFileResponse.data,
//       ContentType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
//       // ACL: 'public-read', // Removed to comply with bucket settings
//     });

//     const uploadToS3Response = await s3.send(putObjectCommand);

//     console.log('✅ S3 Upload successful.');

//     // **Step 18: Generate the S3 Object URL**
//     const processedFileUrl = `https://sharayeh.s3.eu-north-1.amazonaws.com/${encodeURIComponent(s3Key)}`;
//     console.log('🌐 Processed file is available at:', processedFileUrl);

//     // **Step 19: Cleanup - Delete the Temporary Uploaded File**
//     if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
//       await fs.promises.unlink(uploadedFilePath);
//       console.log('🧹 Temporary file deleted:', uploadedFilePath);
//     }

//     // **Step 20: Return the Processed File URL to the Frontend**
//     console.log('📤 Returning response to frontend.');
//     return NextResponse.json(
//       {
//         success: true,
//         processedFileUrl,
//         processedSlides,
//         failedSlides,
//       },
//       { status: 200 }
//     );


//     // // **Step 20: Return the Processed File URL to the Frontend**
//     // console.log('📤 Returning response to frontend.');
//     // return NextResponse.json(
//     //   { success: true, processedFileUrl },
//     //   { status: 200 }
//     // );

//   } catch (error: any) { // Specify 'any' type for better error property access
//     if (axios.isAxiosError(error)) {
//       console.error('⚠️ Axios error:', {
//         message: error.message,
//         response: error.response
//           ? {
//               status: error.response.status,
//               headers: error.response.headers,
//               data: error.response.data,
//             }
//           : 'No response received',
//         config: error.config,
//       });
//     } else {
//       console.error('⚠️ Unexpected error:', error);
//     }

//     // **Cleanup uploaded file if it exists**
//     if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
//       await fs.promises.unlink(uploadedFilePath);
//       console.log('🧹 Temporary file deleted due to error:', uploadedFilePath);
//     }

//     // **Return a JSON Error Response**
//     return NextResponse.json(
//       { success: false, error: 'Failed to process file.' },
//       { status: 500 }
//     );
//   }
// }










// // /app/api/apply-morph/route.ts

// import { NextRequest, NextResponse } from 'next/server';
// import axios from 'axios';
// import fs from 'fs';
// import os from 'os';
// import path from 'path';
// import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// export const runtime = 'nodejs'; // Ensure we use Node.js runtime

// // Initialize AWS S3 Client with AWS SDK v3
// const s3 = new S3Client({
//   region: 'eu-north-1', // Europe (Stockholm)
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
//   },
// });

// export async function POST(req: NextRequest) {
//   console.log('API handler invoked with method:', req.method);

//   let uploadedFilePath = ''; // Temporary file path
//   let originalFileName = '';

//   try {
//     // Parse the JSON body
//     const { resultedFile } = await req.json();

//     if (!resultedFile) {
//       return NextResponse.json(
//         { success: false, error: 'resultedFile URL is required.' },
//         { status: 400 }
//       );
//     }

//     // Validate the resultedFile URL
//     const allowedDomains = ['sharayeh.s3.eu-north-1.amazonaws.com'];
//     const resultedFileUrl = new URL(resultedFile);

//     if (!allowedDomains.includes(resultedFileUrl.hostname)) {
//       return NextResponse.json(
//         { success: false, error: 'Invalid resultedFile URL domain.' },
//         { status: 400 }
//       );
//     }

//     // Download the file from the resultedFile URL
//     console.log(`Downloading file from URL: ${resultedFile}`);
//     const downloadResponse = await axios.get(resultedFile, { responseType: 'arraybuffer' });

//     if (downloadResponse.status !== 200) {
//       throw new Error(`Failed to download file. Status code: ${downloadResponse.status}`);
//     }

//     // Determine the file name from the URL
//     const urlPath = resultedFileUrl.pathname;
//     originalFileName = path.basename(urlPath);
//     const extension = path.extname(originalFileName);

//     // Generate a unique temporary file path
//     const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
//     const tempDir = os.tmpdir();
//     uploadedFilePath = path.join(tempDir, `${uniqueId}${extension}`);

//     // Save the downloaded file to the temporary path
//     await fs.promises.writeFile(uploadedFilePath, downloadResponse.data);
//     console.log('File downloaded and saved to:', uploadedFilePath);

//     // Authenticate with Aspose API
//     const params = new URLSearchParams();
//     params.append('grant_type', 'client_credentials');
//     params.append('client_id', process.env.ASPOSE_CLIENT_ID || '');
//     params.append('client_secret', process.env.ASPOSE_CLIENT_SECRET || '');

//     const authResponse = await axios.post(
//       'https://api.aspose.cloud/connect/token',
//       params.toString(),
//       {
//         headers: {
//           'Content-Type': 'application/x-www-form-urlencoded',
//         },
//       }
//     );

//     console.log('Authentication response:', authResponse.data);

//     const accessToken = authResponse.data.access_token;

//     // Define uploadPath (file name only)
//     const uploadPath = originalFileName; // e.g., 'user_2oXAN2jOiLWJAICsojgKXgO82Az.pptx'

//     console.log(`Uploading file to Aspose Storage with uploadPath: ${uploadPath}`);

//     const fileData = await fs.promises.readFile(uploadedFilePath);

//     console.log('File data length:', fileData.length);

//     const API_VERSION = 'v3.0'; // Update to 'v4.0' if applicable

//     // **Step 1: Upload the File to Aspose Storage**
//     const uploadResponse = await axios.put(
//       `https://api.aspose.cloud/${API_VERSION}/slides/storage/file/${encodeURIComponent(uploadPath)}`,
//       fileData,
//       {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//           'Content-Type': 'application/octet-stream',
//         },
//       }
//     );

//     console.log('Upload response data:', uploadResponse.data);

//     // **Step 2: Verification Step** - List files in the root folder to confirm upload
//     console.log('Verifying upload by listing files in the root folder.');
//     const listFilesResponse = await axios.get(
//       `https://api.aspose.cloud/${API_VERSION}/slides/storage/folder/`,
//       {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//         },
//       }
//     );

//     console.log('List files response data:', listFilesResponse.data);

//     // Check if the file exists in the root folder
//     const uploadedFiles = listFilesResponse.data.value;
//     const fileExists = uploadedFiles.some((file: any) => file.name === originalFileName);

//     console.log(`File exists in root folder: ${fileExists}`);

//     if (!fileExists) {
//       throw new Error(`File ${originalFileName} was not found in the root folder`);
//     }

//     // **Step 3: Get the Total Number of Slides**
//     console.log(`Retrieving slide count for file: ${uploadPath}`);
//     const slideCountResponse = await axios.get(
//       `https://api.aspose.cloud/${API_VERSION}/slides/${encodeURIComponent(uploadPath)}/slides`,
//       {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//         },
//       }
//     );

//     console.log('Slide count response data:', slideCountResponse.data);

//     const slideCount = slideCountResponse.data.slideList.length;
//     console.log(`Total number of slides: ${slideCount}`);

//     // **Step 4: Apply Morph Transition to Each Slide**
//     for (let i = 1; i <= slideCount; i++) {
//       try {
//         await axios.put(
//           `https://api.aspose.cloud/${API_VERSION}/slides/${encodeURIComponent(uploadPath)}/slides/${i}`,
//           {
//             slideShowTransition: {
//               type: 'Morph',
//               morphTransition: {
//                 morphType: 'ByObject', // Options: 'ByObject', 'ByWord', 'ByChar'
//               },
//             },
//           },
//           {
//             headers: {
//               Authorization: `Bearer ${accessToken}`,
//               'Content-Type': 'application/json',
//             },
//           }
//         );
//         console.log(`Successfully applied Morph transition to slide ${i}.`);
//       } catch (slideError) {
//         console.error(`Error applying Morph transition to slide ${i}:`, slideError);
//         throw slideError; // Decide whether to continue or halt on individual slide errors
//       }
//     }

//     // **Step 5: Download the Modified File from Aspose**
//     console.log(`Downloading the modified file: ${uploadPath}`);
//     const modifiedFileResponse = await axios.get(
//       `https://api.aspose.cloud/${API_VERSION}/slides/storage/file/${encodeURIComponent(uploadPath)}`,
//       {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//         },
//         responseType: 'arraybuffer', // Ensure the response is in binary format
//       }
//     );

//     if (modifiedFileResponse.status !== 200) {
//       throw new Error(`Failed to download modified file. Status code: ${modifiedFileResponse.status}`);
//     }

//     console.log('Modified file downloaded:', modifiedFileResponse.status);
//     console.log('Modified file data length:', modifiedFileResponse.data.byteLength || modifiedFileResponse.data.length);

//     // **Step 6: Upload the Modified File to AWS S3 Using AWS SDK v3**
//     console.log('Uploading the modified file to AWS S3.');

//     const processedFileName = `processed-${originalFileName}`;
//     const s3Key = processedFileName; // You can customize the key/path as needed

//     const putObjectCommand = new PutObjectCommand({
//       Bucket: 'sharayeh', // Your S3 bucket name
//       Key: s3Key, // File name you want to save as in S3
//       Body: modifiedFileResponse.data,
//       ContentType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
//       // ACL: 'public-read', // Removed to comply with bucket settings
//     });

//     const uploadToS3Response = await s3.send(putObjectCommand);

//     console.log('S3 Upload successful:', uploadToS3Response);

//     // **Step 7: Generate the S3 Object URL**
//     const processedFileUrl = `https://sharayeh.s3.eu-north-1.amazonaws.com/${encodeURIComponent(s3Key)}`;

//     console.log('Processed file is available at:', processedFileUrl);

//     // **Step 8: Cleanup - Delete the Temporary Uploaded File**
//     if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
//       await fs.promises.unlink(uploadedFilePath);
//       console.log('Temporary file deleted:', uploadedFilePath);
//     }

//     // **Step 9: Return the Processed File URL to the Frontend**
//     return NextResponse.json(
//       { success: true, processedFileUrl },
//       { status: 200 }
//     );

//   } catch (error: any) { // Specify 'any' type for better error property access
//     if (axios.isAxiosError(error)) {
//       console.error('Axios error:', {
//         message: error.message,
//         response: error.response
//           ? {
//               status: error.response.status,
//               headers: error.response.headers,
//               data: error.response.data,
//             }
//           : 'No response received',
//         config: error.config,
//       });
//     } else {
//       console.error('Unexpected error:', error);
//     }

//     // Cleanup uploaded file if it exists
//     if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
//       await fs.promises.unlink(uploadedFilePath);
//       console.log('Temporary file deleted due to error:', uploadedFilePath);
//     }

//     return NextResponse.json(
//       { success: false, error: 'Failed to process file.' },
//       { status: 500 }
//     );
//   }
// }



// import { NextRequest, NextResponse } from 'next/server';
// import axios from 'axios';
// import fs from 'fs';
// import os from 'os';
// import path from 'path';

// export const runtime = 'nodejs'; // Ensure we use Node.js runtime

// export async function POST(req: NextRequest) {
//   console.log('API handler invoked with method:', req.method);

//   try {
//     // Parse the JSON body
//     const { resultedFile } = await req.json();

//     if (!resultedFile) {
//       return NextResponse.json({ success: false, error: 'resultedFile URL is required.' }, { status: 400 });
//     }

//     // Download the file from the resultedFile URL
//     const downloadResponse = await axios.get(resultedFile, { responseType: 'arraybuffer' });

//     if (downloadResponse.status !== 200) {
//       throw new Error(`Failed to download file. Status code: ${downloadResponse.status}`);
//     }

//     // Determine the file name from the URL
//     const urlPath = new URL(resultedFile).pathname;
//     const originalFileName = path.basename(urlPath);
//     const extension = path.extname(originalFileName);

//     // Generate a unique temporary file path
//     const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
//     const tempDir = os.tmpdir();
//     const uploadedFilePath = path.join(tempDir, `${uniqueId}${extension}`);

//     // Save the downloaded file to the temporary path
//     await fs.promises.writeFile(uploadedFilePath, downloadResponse.data);
//     console.log('File downloaded and saved to:', uploadedFilePath);

//     // Authenticate with Aspose API
//     const params = new URLSearchParams();
//     params.append('grant_type', 'client_credentials');
//     params.append('client_id', process.env.ASPOSE_CLIENT_ID || '');
//     params.append('client_secret', process.env.ASPOSE_CLIENT_SECRET || '');

//     const authResponse = await axios.post(
//       'https://api.aspose.cloud/connect/token',
//       params.toString(),
//       {
//         headers: {
//           'Content-Type': 'application/x-www-form-urlencoded',
//         },
//       }
//     );

//     console.log('Authentication response:', authResponse.data);

//     const accessToken = authResponse.data.access_token;

//     // Define uploadPath (file name only)
//     const uploadPath = originalFileName; // e.g., '888u.pptx'

//     console.log(`Uploading file to root folder with uploadPath: ${uploadPath}`);

//     const fileData = await fs.promises.readFile(uploadedFilePath);

//     console.log('File data length:', fileData.length);

//     const API_VERSION = 'v3.0'; // Update to 'v4.0' if applicable

//     // **Step 1: Upload the File to the Root Folder**
//     const uploadResponse = await axios.put(
//       `https://api.aspose.cloud/${API_VERSION}/slides/storage/file/${encodeURIComponent(uploadPath)}`,
//       fileData,
//       {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//           'Content-Type': 'application/octet-stream',
//         },
//       }
//     );

//     console.log('Upload response data:', uploadResponse.data);

//     // **Step 2: Verification Step** - List files in the root folder to confirm upload
//     console.log('Verifying upload by listing files in the root folder.');
//     const listFilesResponse = await axios.get(
//       `https://api.aspose.cloud/${API_VERSION}/slides/storage/folder/`,
//       {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//         },
//       }
//     );

//     console.log('List files response data:', listFilesResponse.data);

//     // Check if the file exists in the root folder
//     const uploadedFiles = listFilesResponse.data.value;
//     const fileExists = uploadedFiles.some((file: any) => file.name === originalFileName);

//     console.log(`File exists in root folder: ${fileExists}`);

//     if (!fileExists) {
//       throw new Error(`File ${originalFileName} was not found in the root folder`);
//     }

//     // **Step 3: Get the Total Number of Slides**
//     console.log(`Retrieving slide count for file: ${uploadPath}`);
//     const slideCountResponse = await axios.get(
//       `https://api.aspose.cloud/${API_VERSION}/slides/${encodeURIComponent(uploadPath)}/slides`,
//       {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//         },
//       }
//     );

//     console.log('Slide count response data:', slideCountResponse.data);

//     const slideCount = slideCountResponse.data.slideList.length;
//     console.log(`Total number of slides: ${slideCount}`);

//     for (let i = 1; i <= slideCount; i++) {
//       try {
//         await axios.put(
//           `https://api.aspose.cloud/${API_VERSION}/slides/${encodeURIComponent(uploadPath)}/slides/${i}`,
//           {
//             slideShowTransition: {
//               type: 'Morph',
//               morphTransition: {
//                 morphType: 'ByObject', // Options: 'ByObject', 'ByWord', 'ByChar'
//               },
//             },
//           },
//           {
//             headers: {
//               Authorization: `Bearer ${accessToken}`,
//               'Content-Type': 'application/json',
//             },
//           }
//         );
//         console.log(`Successfully applied Morph transition to slide ${i}.`);
//       } catch (slideError) {
//         console.error(`Error applying Morph transition to slide ${i}:`, slideError);
//         throw slideError; // Decide whether to continue or halt on individual slide errors
//       }
//     }

//     // **Step 4: Download the Modified File**
//     console.log(`Downloading the modified file: ${uploadPath}`);
//     const modifiedFileResponse = await axios.get(
//       `https://api.aspose.cloud/${API_VERSION}/slides/storage/file/${encodeURIComponent(uploadPath)}`,
//       {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//         },
//         responseType: 'arraybuffer', // Ensure the response is in binary format
//       }
//     );

//     if (modifiedFileResponse.status !== 200) {
//       throw new Error(`Failed to download modified file. Status code: ${modifiedFileResponse.status}`);
//     }

//     console.log('Modified file downloaded:', modifiedFileResponse.status);
//     console.log('Modified file data length:', modifiedFileResponse.data.byteLength || modifiedFileResponse.data.length);

//     // **Step 5: Upload the Modified File to Storage and Get the URL**
//     // Assuming you have a storage service to upload the modified file and get a URL
//     // Replace the following with your storage upload logic

//     // Example using AWS S3 (You need to install AWS SDK and configure it)
//     /*
//     const AWS = require('aws-sdk');
//     const s3 = new AWS.S3({
//       accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//       secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//       region: process.env.AWS_REGION,
//     });

//     const processedFileName = `processed-${originalFileName}`;
//     const s3Params = {
//       Bucket: process.env.AWS_S3_BUCKET_NAME,
//       Key: processedFileName,
//       Body: modifiedFileResponse.data,
//       ContentType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
//     };

//     const uploadResult = await s3.upload(s3Params).promise();
//     const processedFileUrl = uploadResult.Location;
//     */

//     // For demonstration, let's assume you return the modified file as a download link from Aspose
//     // You might need to adjust this based on your storage solution

//     // **Step 6: Cleanup - Delete the Temporary Uploaded File**
//     await fs.promises.unlink(uploadedFilePath);
//     console.log('Temporary file deleted:', uploadedFilePath);

//     // **Step 7: Return the Modified File as a Download Link**
//     // Since Aspose might not provide a direct URL, you might need to handle the storage yourself.
//     // For simplicity, let's assume you return the modified file data directly.

//     // Option 1: Return the file data directly (Not recommended for large files)
//     /*
//     return new NextResponse(modifiedFileResponse.data, {
//       status: 200,
//       headers: {
//         'Content-Disposition': `attachment; filename=processed-${originalFileName}`,
//         'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
//       },
//     });
//     */

//     // Option 2: Upload to your storage and return the URL
//     // Implement your storage upload logic here and return the URL

//     // Placeholder for processedFileUrl
//     const processedFileUrl = `https://your-storage-service.com/processed-${originalFileName}`;

//     return NextResponse.json({ success: true, processedFileUrl }, { status: 200 });

//   } catch (error: any) { // Specify 'any' type for better error property access
//     if (axios.isAxiosError(error)) {
//       console.error('Axios error:', {
//         message: error.message,
//         response: error.response ? {
//           status: error.response.status,
//           headers: error.response.headers,
//           data: error.response.data,
//         } : 'No response received',
//         config: error.config,
//       });
//     } else {
//       console.error('Unexpected error:', error);
//     }

//     return NextResponse.json({ success: false, error: 'Failed to process file.' }, { status: 500 });
//   }
// }




// // /app/api/apply-morph/route.ts

// import { NextRequest, NextResponse } from 'next/server';
// import axios from 'axios';
// import fs from 'fs';
// import os from 'os';
// import path from 'path';
// import Busboy from 'busboy';

// export const runtime = 'nodejs'; // Ensure we use Node.js runtime

// export async function POST(req: NextRequest) {
//   console.log('API handler invoked with method:', req.method);

//   let uploadedFilePath = ''; // Temporary file path
//   let originalFileName = '';

//   try {
//     // Ensure the content type is multipart/form-data
//     const contentType = req.headers.get('content-type') || '';
//     if (!contentType.includes('multipart/form-data')) {
//       console.log('Unsupported Media Type:', contentType);
//       return NextResponse.json({ error: 'Unsupported Media Type' }, { status: 415 });
//     }

//     const busboy = Busboy({
//       headers: {
//         'content-type': contentType,
//       },
//     });

//     let fileUploaded = false;

//     // Create a promise to handle the busboy stream
//     const busboyPromise = new Promise<void>((resolve, reject) => {
//       busboy.on('file', (fieldname, file, info) => {
//         const { filename } = info;
//         console.log(`Received filename: ${filename}`);

//         if (!filename) {
//           reject(new Error('No filename provided'));
//           return;
//         }

//         console.log(`Processing file: ${filename}`);

//         originalFileName = filename;

//       // Generate a unique temporary file path
//       const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
//       const extension = path.extname(originalFileName);
//       const tempDir = os.tmpdir();
//       uploadedFilePath = path.join(tempDir, `${uniqueId}${extension}`);


//         // // Generate a temporary file path
//         // const tempDir = os.tmpdir();
//         // uploadedFilePath = path.join(tempDir, `${Date.now()}-${originalFileName}`);

//         console.log('Temporary file path:', uploadedFilePath);

//         // Create a write stream to the temporary file
//         const writeStream = fs.createWriteStream(uploadedFilePath);

//         file.pipe(writeStream);

//         file.on('end', () => {
//           fileUploaded = true;
//           console.log(`File [${filename}] upload complete`);
//         });

//         writeStream.on('finish', () => {
//           console.log('Write stream finished');
//           resolve();
//         });

//         writeStream.on('error', (err) => {
//           console.error('Write stream error:', err);
//           reject(err);
//         });
//       });

//       busboy.on('error', (err) => {
//         console.error('Busboy error:', err);
//         reject(err);
//       });

//       busboy.on('finish', () => {
//         console.log('Busboy parsing finished');
//         if (!fileUploaded) {
//           reject(new Error('No file uploaded'));
//         } else {
//           resolve();
//         }
//       });
//     });

//     // Read the request body and pipe it to busboy
//     const reader = req.body?.getReader();
//     if (!reader) {
//       console.log('No request body found');
//       return NextResponse.json({ error: 'No request body' }, { status: 400 });
//     }

//     while (true) {
//       const { done, value } = await reader.read();
//       if (done) {
//         busboy.end();
//         break;
//       }
//       busboy.write(Buffer.from(value));
//     }

//     // Wait for busboy to finish parsing
//     await busboyPromise;

//     if (!fs.existsSync(uploadedFilePath)) {
//       throw new Error('Uploaded file does not exist after saving.');
//     }

//     console.log('File parsed and saved to:', uploadedFilePath);

//     // Authenticate with Aspose API
//     const params = new URLSearchParams();
//     params.append('grant_type', 'client_credentials');
//     params.append('client_id', process.env.ASPOSE_CLIENT_ID || '');
//     params.append('client_secret', process.env.ASPOSE_CLIENT_SECRET || '');

//     const authResponse = await axios.post(
//       'https://api.aspose.cloud/connect/token',
//       params.toString(),
//       {
//         headers: {
//           'Content-Type': 'application/x-www-form-urlencoded',
//         },
//       }
//     );

//     console.log('Authentication response:', authResponse.data);

//     const accessToken = authResponse.data.access_token;

//     // Define uploadPath (file name only)
//     const uploadPath = originalFileName; // e.g., '888u.pptx'

//     console.log(`Uploading file to root folder with uploadPath: ${uploadPath}`);

//     const fileData = await fs.promises.readFile(uploadedFilePath);

//     // Log the size of the file being uploaded
//     console.log('File data length:', fileData.length);

//     const API_VERSION = 'v3.0'; // Update to 'v4.0' if applicable

//     // **Step 1: Upload the File to the Root Folder**
//     const uploadResponse = await axios.put(
//       `https://api.aspose.cloud/${API_VERSION}/slides/storage/file/${encodeURIComponent(uploadPath)}`,
//       fileData,
//       {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//           'Content-Type': 'application/octet-stream',
//         },
//       }
//     );

//     console.log('Upload response data:', uploadResponse.data);

//     // **Step 2: Verification Step** - List files in the root folder to confirm upload
//     console.log('Verifying upload by listing files in the root folder.');
//     const listFilesResponse = await axios.get(
//       `https://api.aspose.cloud/${API_VERSION}/slides/storage/folder/`,
//       {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//         },
//       }
//     );

//     console.log('List files response data:', listFilesResponse.data);

//     // Check if the file exists in the root folder
//     const uploadedFiles = listFilesResponse.data.value;
//     const fileExists = uploadedFiles.some((file: any) => file.name === originalFileName);

//     console.log(`File exists in root folder: ${fileExists}`);

//     if (!fileExists) {
//       throw new Error(`File ${originalFileName} was not found in the root folder`);
//     }

//     // **Step 3: Get the Total Number of Slides**
//     console.log(`Retrieving slide count for file: ${uploadPath}`);
//     const slideCountResponse = await axios.get(
//       `https://api.aspose.cloud/${API_VERSION}/slides/${encodeURIComponent(uploadPath)}/slides`,
//       {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//         },
//       }
//     );

//     console.log('Slide count response data:', slideCountResponse.data);

//     const slideCount = slideCountResponse.data.slideList.length;
//     console.log(`Total number of slides: ${slideCount}`);

//     for (let i = 1; i <= slideCount; i++) {
//       try {
//         await axios.put(
//           `https://api.aspose.cloud/${API_VERSION}/slides/${encodeURIComponent(uploadPath)}/slides/${i}`,
//           {
//             slideShowTransition: {
//               type: 'Morph',
//               morphTransition: {
//                 morphType: 'ByObject', // Options: 'ByObject', 'ByWord', 'ByChar'
//               },
//             },
//           },
//           {
//             headers: {
//               Authorization: `Bearer ${accessToken}`,
//               'Content-Type': 'application/json',
//             },
//           }
//         );
//         console.log(`Successfully applied Morph transition to slide ${i}.`);
//       } catch (slideError) {
//         console.error(`Error applying Morph transition to slide ${i}:`, slideError);
//         throw slideError; // Decide whether to continue or halt on individual slide errors
//       }
//     }

//     // **Step 5: Download the Modified File**
//     console.log(`Downloading the modified file: ${uploadPath}`);
//     const modifiedFileResponse = await axios.get(
//       `https://api.aspose.cloud/${API_VERSION}/slides/storage/file/${encodeURIComponent(uploadPath)}`,
//       {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//         },
//         responseType: 'arraybuffer', // Ensure the response is in binary format
//       }
//     );

//     if (modifiedFileResponse.status !== 200) {
//       throw new Error(`Failed to download modified file. Status code: ${modifiedFileResponse.status}`);
//     }

//     console.log('Modified file downloaded:', modifiedFileResponse.status);
//     console.log('Modified file data length:', modifiedFileResponse.data.byteLength || modifiedFileResponse.data.length);

//     // **Step 6: Cleanup - Delete the Temporary Uploaded File**
//     await fs.promises.unlink(uploadedFilePath);
//     console.log('Temporary file deleted:', uploadedFilePath);

//     // **Step 7: Return the Modified File as Response**
//     const response = new NextResponse(modifiedFileResponse.data, {
//       status: 200,
//       headers: {
//         'Content-Disposition': `attachment; filename=modified-${originalFileName}`,
//         'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
//       },
//     });

//     return response;

//   } catch (error: any) { // Specify 'any' type for better error property access
//     if (axios.isAxiosError(error)) {
//       console.error('Axios error:', {
//         message: error.message,
//         response: error.response ? {
//           status: error.response.status,
//           headers: error.response.headers,
//           data: error.response.data,
//         } : 'No response received',
//         config: error.config,
//       });
//     } else {
//       console.error('Unexpected error:', error);
//     }

//     // Cleanup uploaded file if it exists
//     if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
//       await fs.promises.unlink(uploadedFilePath);
//       console.log('Temporary file deleted due to error:', uploadedFilePath);
//     }

//     return NextResponse.json({ error: 'Failed to process file' }, { status: 500 });
//   }
// }











// import { NextRequest, NextResponse } from 'next/server';
// import axios from 'axios';
// import fs from 'fs';
// import os from 'os';
// import path from 'path';
// import { db } from '@/lib/db';
// import { v4 as uuidv4 } from 'uuid'; // To generate unique filenames

// export const config = {
//   runtime: 'nodejs',
// };

// export async function POST(req: NextRequest) {
//   console.log('Process API invoked with method:', req.method);
//   let body: any = null; // Initialize body outside the try block

//   try {
//     body = await req.json();
//     const { requestId } = body;

//     if (!requestId) {
//       return NextResponse.json(
//         { success: false, error: 'Missing requestId' },
//         { status: 400 }
//       );
//     }

//     // Fetch file details from the database
//     const fileRecord = await db.file.findUnique({
//       where: { id: Number(requestId) },
//     });

//     if (!fileRecord) {
//       return NextResponse.json(
//         { success: false, error: 'File not found' },
//         { status: 404 }
//       );
//     }

//     if (!fileRecord.resultedFile) {
//       return NextResponse.json(
//         { success: false, error: 'No downloadUrl found for the file' },
//         { status: 400 }
//       );
//     }

//     const downloadUrl = fileRecord.resultedFile;
//     // const fileName = fileRecord.fileName; // Not needed anymore

//     // Fetch the file from Google Drive server-side
//     const response = await axios.get(downloadUrl, {
//       responseType: 'arraybuffer',
//       // If authentication is needed, include headers or tokens here
//     });

//     if (response.status !== 200) {
//       throw new Error(`Failed to download file. Status code: ${response.status}`);
//     }

//     const fileBuffer = Buffer.from(response.data, 'binary');

//     // Save the original file temporarily with uniqueId.pptx
//     const uniqueId = uuidv4();
//     const newFilename = `${uniqueId}.pptx`;
//     const tempDir = os.tmpdir();
//     const originalFilePath = path.join(tempDir, newFilename);

//     await fs.promises.writeFile(originalFilePath, fileBuffer);
//     console.log('Original file saved to:', originalFilePath);

//     // Authenticate with Aspose API
//     const params = new URLSearchParams();
//     params.append('grant_type', 'client_credentials');
//     params.append('client_id', process.env.ASPOSE_CLIENT_ID || '');
//     params.append('client_secret', process.env.ASPOSE_CLIENT_SECRET || '');

//     const authResponse = await axios.post(
//       'https://api.aspose.cloud/connect/token',
//       params.toString(),
//       {
//         headers: {
//           'Content-Type': 'application/x-www-form-urlencoded',
//         },
//       }
//     );

//     if (authResponse.status !== 200) {
//       throw new Error(`Aspose authentication failed. Status code: ${authResponse.status}`);
//     }

//     const accessToken = authResponse.data.access_token;
//     const API_VERSION = 'v3.0';
//     const uploadPath = newFilename; // Use the new filename

//     // Upload the file to Aspose Cloud
//     await axios.put(
//       `https://api.aspose.cloud/${API_VERSION}/slides/storage/file/${encodeURIComponent(uploadPath)}`,
//       fileBuffer,
//       {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//           'Content-Type': 'application/octet-stream',
//         },
//       }
//     );

//     console.log('File uploaded to Aspose Cloud.');

//     // Get slide count
//     const slideCountResponse = await axios.get(
//       `https://api.aspose.cloud/${API_VERSION}/slides/${encodeURIComponent(uploadPath)}/slides`,
//       {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//         },
//       }
//     );

//     if (slideCountResponse.status !== 200) {
//       throw new Error(`Failed to get slide count. Status code: ${slideCountResponse.status}`);
//     }

//     const slideCount = slideCountResponse.data.slideList.length;
//     console.log(`Slide count: ${slideCount}`);

//     // Apply Morph transition to each slide
//     for (let i = 1; i <= slideCount; i++) {
//       await axios.put(
//         `https://api.aspose.cloud/${API_VERSION}/slides/${encodeURIComponent(uploadPath)}/slides/${i}`,
//         {
//           slideShowTransition: {
//             type: 'Morph',
//             morphTransition: {
//               morphType: 'ByObject',
//             },
//           },
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${accessToken}`,
//             'Content-Type': 'application/json',
//           },
//         }
//       );
//       console.log(`Applied Morph transition to slide ${i}`);
//     }

//     // Download the modified file from Aspose Cloud
//     const modifiedFileResponse = await axios.get(
//       `https://api.aspose.cloud/${API_VERSION}/slides/storage/file/${encodeURIComponent(uploadPath)}`,
//       {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//         },
//         responseType: 'arraybuffer',
//       }
//     );

//     if (modifiedFileResponse.status !== 200) {
//       throw new Error(`Failed to download modified file. Status code: ${modifiedFileResponse.status}`);
//     }

//     const modifiedFileBuffer = Buffer.from(modifiedFileResponse.data, 'binary');

//     // Save the modified file to the public/uploads directory with uniqueId.pptx
//     const processedFilename = `${uniqueId}.pptx`;
//     const publicDir = path.join(process.cwd(), 'public', 'uploads');

//     // Ensure the uploads directory exists
//     await fs.promises.mkdir(publicDir, { recursive: true });

//     const processedFilePath = path.join(publicDir, processedFilename);
//     await fs.promises.writeFile(processedFilePath, modifiedFileBuffer);
//     console.log('Processed file saved to:', processedFilePath);

//     // Generate the download URL
//     const serverUrl = process.env.SERVER_URL || 'http://localhost:3000'; // Set this in your .env file
//     const fileUrl = `${serverUrl}/uploads/${processedFilename}`;

//     console.log('Returning processed file URL:', fileUrl);

//     // Update the database with the new downloadUrl and status
//     await db.file.update({
//       where: { id: Number(requestId) },
//       data: {
//         resultedFile2: fileUrl, // Assuming you have a field for the processed file
//         status: 'COMPLETED',
//       },
//     });

//     // Cleanup: Remove the original temporary file
//     if (fs.existsSync(originalFilePath)) {
//       await fs.promises.unlink(originalFilePath);
//       console.log('Temporary original file deleted:', originalFilePath);
//     }

//     return NextResponse.json({ success: true, processedFileUrl: fileUrl });
//   } catch (error: any) {
//     console.error('Error processing file:', error);

//     // Safely check if body and requestId exist
//     if (body && body.requestId) {
//       try {
//         await db.file.update({
//           where: { id: Number(body.requestId) },
//           data: {
//             status: 'FAILED',
//           },
//         });
//       } catch (dbError: any) {
//         console.error('Error updating status to FAILED:', dbError.message);
//       }
//     }

//     return NextResponse.json(
//       { success: false, error: 'Failed to process file' },
//       { status: 500 }
//     );
//   }
// }


// import { NextRequest, NextResponse } from 'next/server';
// import axios from 'axios';
// import fs from 'fs';
// import os from 'os';
// import path from 'path';
// import Busboy from 'busboy';

// export const runtime = 'nodejs'; // Ensure we use Node.js runtime

// export async function POST(req: NextRequest) {
//   console.log('API handler invoked with method:', req.method);

//   let uploadedFilePath = ''; // Temporary file path
//   let originalFileName = '';

//   try {
//     // Ensure the content type is multipart/form-data
//     const contentType = req.headers.get('content-type') || '';
//     if (!contentType.includes('multipart/form-data')) {
//       console.log('Unsupported Media Type:', contentType);
//       return NextResponse.json({ error: 'Unsupported Media Type' }, { status: 415 });
//     }

//     const busboy = Busboy({
//       headers: {
//         'content-type': contentType,
//       },
//     });

//     let fileUploaded = false;

//     // Create a promise to handle the busboy stream
//     const busboyPromise = new Promise<void>((resolve, reject) => {
//       busboy.on('file', (fieldname, file, info) => {
//         const { filename } = info;
//         console.log(`Received filename: ${filename}`);

//         if (!filename) {
//           reject(new Error('No filename provided'));
//           return;
//         }

//         console.log(`Processing file: ${filename}`);

//         originalFileName = filename;

//         // Generate a unique temporary file path
//         const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
//         const extension = path.extname(originalFileName);
//         const tempDir = os.tmpdir();
//         uploadedFilePath = path.join(tempDir, `${uniqueId}${extension}`);

//         console.log('Temporary file path:', uploadedFilePath);

//         // Create a write stream to the temporary file
//         const writeStream = fs.createWriteStream(uploadedFilePath);

//         file.pipe(writeStream);

//         file.on('end', () => {
//           fileUploaded = true;
//           console.log(`File [${filename}] upload complete`);
//         });

//         writeStream.on('finish', () => {
//           console.log('Write stream finished');
//           resolve();
//         });

//         writeStream.on('error', (err) => {
//           console.error('Write stream error:', err);
//           reject(err);
//         });
//       });

//       busboy.on('error', (err) => {
//         console.error('Busboy error:', err);
//         reject(err);
//       });

//       busboy.on('finish', () => {
//         console.log('Busboy parsing finished');
//         if (!fileUploaded) {
//           reject(new Error('No file uploaded'));
//         } else {
//           resolve();
//         }
//       });
//     });

//     // Read the request body and pipe it to busboy
//     const reader = req.body?.getReader();
//     if (!reader) {
//       console.log('No request body found');
//       return NextResponse.json({ error: 'No request body' }, { status: 400 });
//     }

//     while (true) {
//       const { done, value } = await reader.read();
//       if (done) {
//         busboy.end();
//         break;
//       }
//       busboy.write(Buffer.from(value));
//     }

//     // Wait for busboy to finish parsing
//     await busboyPromise;

//     if (!fs.existsSync(uploadedFilePath)) {
//       throw new Error('Uploaded file does not exist after saving.');
//     }

//     console.log('File parsed and saved to:', uploadedFilePath);

//     // Authenticate with Aspose API
//     const params = new URLSearchParams();
//     params.append('grant_type', 'client_credentials');
//     params.append('client_id', process.env.ASPOSE_CLIENT_ID || '');
//     params.append('client_secret', process.env.ASPOSE_CLIENT_SECRET || '');

//     const authResponse = await axios.post(
//       'https://api.aspose.cloud/connect/token',
//       params.toString(),
//       {
//         headers: {
//           'Content-Type': 'application/x-www-form-urlencoded',
//         },
//       }
//     );

//     console.log('Authentication response:', authResponse.data);

//     const accessToken = authResponse.data.access_token;

//     // Define uploadPath (file name only)
//     const uploadPath = originalFileName;

//     const fileData = await fs.promises.readFile(uploadedFilePath);

//     const API_VERSION = 'v3.0';

//     // Upload the file to Aspose Cloud
//     await axios.put(
//       `https://api.aspose.cloud/${API_VERSION}/slides/storage/file/${encodeURIComponent(uploadPath)}`,
//       fileData,
//       {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//           'Content-Type': 'application/octet-stream',
//         },
//       }
//     );

//     // Process the file with Morph transition
//     const slideCountResponse = await axios.get(
//       `https://api.aspose.cloud/${API_VERSION}/slides/${encodeURIComponent(uploadPath)}/slides`,
//       {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//         },
//       }
//     );

//     const slideCount = slideCountResponse.data.slideList.length;

//     for (let i = 1; i <= slideCount; i++) {
//       await axios.put(
//         `https://api.aspose.cloud/${API_VERSION}/slides/${encodeURIComponent(uploadPath)}/slides/${i}`,
//         {
//           slideShowTransition: {
//             type: 'Morph',
//             morphTransition: {
//               morphType: 'ByObject',
//             },
//           },
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${accessToken}`,
//             'Content-Type': 'application/json',
//           },
//         }
//       );
//     }

//     // Download the modified file
//     const modifiedFileResponse = await axios.get(
//       `https://api.aspose.cloud/${API_VERSION}/slides/storage/file/${encodeURIComponent(uploadPath)}`,
//       {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//         },
//         responseType: 'arraybuffer',
//       }
//     );

//     const modifiedFilePath = path.join(os.tmpdir(), `modified-${originalFileName}`);
//     await fs.promises.writeFile(modifiedFilePath, modifiedFileResponse.data);

//     // Convert the file to a downloadable URL (you can replace this with your own storage service)
//     const fileUrl = `https://your-server-url/tmp/${path.basename(modifiedFilePath)}`;

//     console.log('Returning processed file URL:', fileUrl);

//     return NextResponse.json({ resultedFile2: fileUrl });
//   } catch (error: any) {
//     console.error('Error:', error.message);
//     return NextResponse.json({ error: 'Failed to process file' }, { status: 500 });
//   } finally {
//     // Cleanup uploaded file
//     if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
//       await fs.promises.unlink(uploadedFilePath);
//       console.log('Temporary uploaded file deleted:', uploadedFilePath);
//     }
//   }
// }








// // /app/api/apply-morph/route.ts

// import { NextRequest, NextResponse } from 'next/server';
// import axios from 'axios';
// import fs from 'fs';
// import os from 'os';
// import path from 'path';
// import Busboy from 'busboy';

// export const runtime = 'nodejs'; // Ensure we use Node.js runtime

// export async function POST(req: NextRequest) {
//   console.log('API handler invoked with method:', req.method);

//   let uploadedFilePath = ''; // Temporary file path
//   let originalFileName = '';

//   try {
//     // Ensure the content type is multipart/form-data
//     const contentType = req.headers.get('content-type') || '';
//     if (!contentType.includes('multipart/form-data')) {
//       console.log('Unsupported Media Type:', contentType);
//       return NextResponse.json({ error: 'Unsupported Media Type' }, { status: 415 });
//     }

//     const busboy = Busboy({
//       headers: {
//         'content-type': contentType,
//       },
//     });

//     let fileUploaded = false;

//     // Create a promise to handle the busboy stream
//     const busboyPromise = new Promise<void>((resolve, reject) => {
//       busboy.on('file', (fieldname, file, info) => {
//         const { filename } = info;
//         console.log(`Received filename: ${filename}`);

//         if (!filename) {
//           reject(new Error('No filename provided'));
//           return;
//         }

//         console.log(`Processing file: ${filename}`);

//         originalFileName = filename;

//         // Generate a temporary file path
//         const tempDir = os.tmpdir();
//         uploadedFilePath = path.join(tempDir, `${Date.now()}-${originalFileName}`);

//         console.log('Temporary file path:', uploadedFilePath);

//         // Create a write stream to the temporary file
//         const writeStream = fs.createWriteStream(uploadedFilePath);

//         file.pipe(writeStream);

//         file.on('end', () => {
//           fileUploaded = true;
//           console.log(`File [${filename}] upload complete`);
//         });

//         writeStream.on('finish', () => {
//           console.log('Write stream finished');
//           resolve();
//         });

//         writeStream.on('error', (err) => {
//           console.error('Write stream error:', err);
//           reject(err);
//         });
//       });

//       busboy.on('error', (err) => {
//         console.error('Busboy error:', err);
//         reject(err);
//       });

//       busboy.on('finish', () => {
//         console.log('Busboy parsing finished');
//         if (!fileUploaded) {
//           reject(new Error('No file uploaded'));
//         } else {
//           resolve();
//         }
//       });
//     });

//     // Read the request body and pipe it to busboy
//     const reader = req.body?.getReader();
//     if (!reader) {
//       console.log('No request body found');
//       return NextResponse.json({ error: 'No request body' }, { status: 400 });
//     }

//     while (true) {
//       const { done, value } = await reader.read();
//       if (done) {
//         busboy.end();
//         break;
//       }
//       busboy.write(Buffer.from(value));
//     }

//     // Wait for busboy to finish parsing
//     await busboyPromise;

//     if (!fs.existsSync(uploadedFilePath)) {
//       throw new Error('Uploaded file does not exist after saving.');
//     }

//     console.log('File parsed and saved to:', uploadedFilePath);

//     // Authenticate with Aspose API
//     const params = new URLSearchParams();
//     params.append('grant_type', 'client_credentials');
//     params.append('client_id', process.env.ASPOSE_CLIENT_ID || '');
//     params.append('client_secret', process.env.ASPOSE_CLIENT_SECRET || '');

//     const authResponse = await axios.post(
//       'https://api.aspose.cloud/connect/token',
//       params.toString(),
//       {
//         headers: {
//           'Content-Type': 'application/x-www-form-urlencoded',
//         },
//       }
//     );

//     console.log('Authentication response:', authResponse.data);

//     const accessToken = authResponse.data.access_token;

//     // Define uploadPath (file name only)
//     const uploadPath = originalFileName; // e.g., '8uw8.pptx'

//     console.log(`Uploading file to root folder with uploadPath: ${uploadPath}`);

//     const fileData = await fs.promises.readFile(uploadedFilePath);

//     // Log the size of the file being uploaded
//     console.log('File data length:', fileData.length);

//     const API_VERSION = 'v3.0'; // Update to 'v4.0' if applicable

//     // **Step 1: Upload the File to the Root Folder**
//     const uploadResponse = await axios.put(
//       `https://api.aspose.cloud/${API_VERSION}/slides/storage/file/${encodeURIComponent(uploadPath)}`,
//       fileData,
//       {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//           'Content-Type': 'application/octet-stream',
//         },
//       }
//     );

//     console.log('Upload response data:', uploadResponse.data);

//     // **Step 2: Verification Step** - List files in the root folder to confirm upload
//     console.log('Verifying upload by listing files in the root folder.');
//     const listFilesResponse = await axios.get(
//       `https://api.aspose.cloud/${API_VERSION}/slides/storage/folder/`,
//       {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//         },
//       }
//     );

//     console.log('List files response data:', listFilesResponse.data);

//     // Check if the file exists in the root folder
//     const uploadedFiles = listFilesResponse.data.value;
//     const fileExists = uploadedFiles.some((file: any) => file.name === originalFileName);

//     console.log(`File exists in root folder: ${fileExists}`);

//     if (!fileExists) {
//       throw new Error(`File ${originalFileName} was not found in the root folder`);
//     }

//     // **Step 3: Get the Total Number of Slides**
//     console.log(`Retrieving slide count for file: ${uploadPath}`);
//     const slideCountResponse = await axios.get(
//       `https://api.aspose.cloud/${API_VERSION}/slides/${encodeURIComponent(uploadPath)}/slides`,
//       {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//         },
//       }
//     );

//     console.log('Slide count response data:', slideCountResponse.data);

//     const slideCount = slideCountResponse.data.slideList.length;
//     console.log(`Total number of slides: ${slideCount}`);

//     for (let i = 1; i <= slideCount; i++) {
//       try {
//         await axios.put(
//           `https://api.aspose.cloud/${API_VERSION}/slides/${encodeURIComponent(uploadPath)}/slides/${i}`,
//           {
//             slideShowTransition: {
//               type: 'Morph',
//               morphTransition: {
//                 morphType: 'ByObject', // Options: 'ByObject', 'ByWord', 'ByChar'
//               },
//             },
//           },
//           {
//             headers: {
//               Authorization: `Bearer ${accessToken}`,
//               'Content-Type': 'application/json',
//             },
//           }
//         );
//         console.log(`Successfully applied Morph transition to slide ${i}.`);
//       } catch (slideError) {
//         console.error(`Error applying Morph transition to slide ${i}:`, slideError);
//         throw slideError; // Decide whether to continue or halt on individual slide errors
//       }
//     }

//     // **Step 5: Download the Modified File**
//     console.log(`Downloading the modified file: ${uploadPath}`);
//     const modifiedFileResponse = await axios.get(
//       `https://api.aspose.cloud/${API_VERSION}/slides/${encodeURIComponent(uploadPath)}/pptx`,
//       {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//         },
//         responseType: 'arraybuffer', // Ensure the response is in binary format
//       }
//     );

//     if (modifiedFileResponse.status !== 200) {
//       throw new Error(`Failed to download modified file. Status code: ${modifiedFileResponse.status}`);
//     }

//     console.log('Modified file downloaded:', modifiedFileResponse.status);
//     console.log('Modified file data length:', modifiedFileResponse.data.byteLength || modifiedFileResponse.data.length);

//     // **Step 6: Cleanup - Delete the Temporary Uploaded File**
//     await fs.promises.unlink(uploadedFilePath);
//     console.log('Temporary file deleted:', uploadedFilePath);

//     // **Step 7: Return the Modified File as Response**
//     const response = new NextResponse(modifiedFileResponse.data, {
//       status: 200,
//       headers: {
//         'Content-Disposition': `attachment; filename=modified-${originalFileName}`,
//         'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
//       },
//     });

//     return response;

//   } catch (error: any) { // Specify 'any' type for better error property access
//     if (axios.isAxiosError(error)) {
//       console.error('Axios error:', {
//         message: error.message,
//         response: error.response ? {
//           status: error.response.status,
//           headers: error.response.headers,
//           data: error.response.data,
//         } : 'No response received',
//         config: error.config,
//       });
//     } else {
//       console.error('Unexpected error:', error);
//     }

//     // Cleanup uploaded file if it exists
//     if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
//       await fs.promises.unlink(uploadedFilePath);
//       console.log('Temporary file deleted due to error:', uploadedFilePath);
//     }

//     return NextResponse.json({ error: 'Failed to process file' }, { status: 500 });
//   }
// }


// // /app/api/apply-morph/route.ts

// import { NextRequest, NextResponse } from 'next/server';
// import axios from 'axios';
// import fs from 'fs';
// import os from 'os';
// import path from 'path';
// import Busboy from 'busboy';

// export const runtime = 'nodejs'; // Ensure we use Node.js runtime

// export async function POST(req: NextRequest) {
//   console.log('API handler invoked with method:', req.method);

//   let uploadedFilePath = ''; // Temporary file path
//   let originalFileName = '';

//   try {
//     // Ensure the content type is multipart/form-data
//     const contentType = req.headers.get('content-type') || '';
//     if (!contentType.includes('multipart/form-data')) {
//       console.log('Unsupported Media Type:', contentType);
//       return NextResponse.json({ error: 'Unsupported Media Type' }, { status: 415 });
//     }

//     const busboy = Busboy({
//       headers: {
//         'content-type': contentType,
//       },
//     });

//     let fileUploaded = false;

//     // Create a promise to handle the busboy stream
//     const busboyPromise = new Promise<void>((resolve, reject) => {
//       busboy.on('file', (fieldname, file, info) => {
//         const { filename } = info;
//         console.log('Received filename:', filename);

//         if (!filename) {
//           reject(new Error('No filename provided'));
//           return;
//         }

//         console.log(`Processing file: ${filename}`);

//         originalFileName = filename;

//         // Generate a temporary file path
//         const tempDir = os.tmpdir();
//         uploadedFilePath = path.join(tempDir, `${Date.now()}-${originalFileName}`);

//         console.log('Temporary file path:', uploadedFilePath);

//         // Create a write stream to the temporary file
//         const writeStream = fs.createWriteStream(uploadedFilePath);

//         file.pipe(writeStream);

//         file.on('end', () => {
//           fileUploaded = true;
//           console.log(`File [${filename}] upload complete`);
//         });

//         writeStream.on('finish', () => {
//           console.log('Write stream finished');
//           resolve();
//         });

//         writeStream.on('error', (err) => {
//           console.error('Write stream error:', err);
//           reject(err);
//         });
//       });

//       busboy.on('error', (err) => {
//         console.error('Busboy error:', err);
//         reject(err);
//       });

//       busboy.on('finish', () => {
//         console.log('Busboy parsing finished');
//         if (!fileUploaded) {
//           reject(new Error('No file uploaded'));
//         } else {
//           resolve();
//         }
//       });
//     });

//     // Read the request body and pipe it to busboy
//     const reader = req.body?.getReader();
//     if (!reader) {
//       console.log('No request body found');
//       return NextResponse.json({ error: 'No request body' }, { status: 400 });
//     }

//     while (true) {
//       const { done, value } = await reader.read();
//       if (done) {
//         busboy.end();
//         break;
//       }
//       busboy.write(Buffer.from(value));
//     }

//     // Wait for busboy to finish parsing
//     await busboyPromise;

//     console.log('File parsed and saved to:', uploadedFilePath);

//     // Authenticate with Aspose API
//     const authResponse = await axios.post(
//       'https://api.aspose.cloud/connect/token',
//       `grant_type=client_credentials&client_id=${process.env.ASPOSE_CLIENT_ID}&client_secret=${process.env.ASPOSE_CLIENT_SECRET}`,
//       {
//         headers: {
//           'Content-Type': 'application/x-www-form-urlencoded',
//         },
//       }
//     );

//     console.log('Authentication response:', authResponse.data);

//     const accessToken = authResponse.data.access_token;

//     // Define uploadPath (file name only)
//     const uploadPath = originalFileName; // e.g., '8uw8.pptx'

//     console.log(`Uploading file to root folder with uploadPath: ${uploadPath}`);

//     const fileData = await fs.promises.readFile(uploadedFilePath);

//     // Log the size of the file being uploaded
//     console.log('File data length:', fileData.length);

//     // **Step 1: Upload the File to the Root Folder**
//     const uploadResponse = await axios.put(
//       `https://api.aspose.cloud/v3.0/slides/storage/file/${encodeURIComponent(uploadPath)}`,
//       fileData,
//       {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//           'Content-Type': 'application/octet-stream',
//         },
//         params: {
//           // No folder parameter needed as we're uploading to root
//         },
//       }
//     );

//     console.log('Upload response data:', uploadResponse.data);

//     // **Step 2: Verification Step** - List files in the root folder to confirm upload
//     console.log(`Verifying upload by listing files in the root folder.`);
//     const listFilesResponse = await axios.get(
//       `https://api.aspose.cloud/v3.0/slides/storage/folder/`,
//       {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//         },
//         params: {
//           // No folder parameter to list root
//         },
//       }
//     );

//     console.log('List files response data:', listFilesResponse.data);

//     // Check if the file exists in the root folder
//     const uploadedFiles = listFilesResponse.data.value;
//     const fileExists = uploadedFiles.some((file: any) => file.name === originalFileName);

//     console.log(`File exists in root folder: ${fileExists}`);

//     if (!fileExists) {
//       throw new Error(`File ${originalFileName} was not found in the root folder`);
//     }

//     // **Step 3: Get the Total Number of Slides**
//     console.log(`Retrieving slide count for file: ${uploadPath}`);
//     const slideCountResponse = await axios.get(
//       `https://api.aspose.cloud/v3.0/slides/${encodeURIComponent(uploadPath)}/slides`,
//       {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//         },
//         params: {
//           // No folder parameter since the file is in root
//         },
//       }
//     );

//     console.log('Slide count response data:', slideCountResponse.data);

//     const slideCount = slideCountResponse.data.slideList.length;
//     console.log(`Total number of slides: ${slideCount}`);

//     for (let i = 1; i <= slideCount; i++) {
//       await axios.put(
//         `https://api.aspose.cloud/v3.0/slides/${encodeURIComponent(uploadPath)}/slides/${i}`,
//         {
//           slideShowTransition: {
//             type: 'Morph',
//             morphTransition: {
//               morphType: 'ByObject', // Options: 'ByObject', 'ByWord', 'ByChar'
//             },
//           },
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${accessToken}`,
//             'Content-Type': 'application/json',
//           },
//         }
//       );
//     }
    
//       // **Step 5: Download the Modified File**
//   console.log(`Downloading the modified file: ${uploadPath}`);
//   const modifiedFileResponse = await axios.get(
//     `https://api.aspose.cloud/v3.0/slides/${encodeURIComponent(uploadPath)}/pptx`,
//     {
//       headers: {
//         Authorization: `Bearer ${accessToken}`,
//       },
//       responseType: 'arraybuffer', // Ensure the response is in binary format
//     }
//   );

//   console.log('Modified file downloaded:', modifiedFileResponse.status);
//   console.log('Modified file data length:', modifiedFileResponse.data.length);



//     // **Step 6: Cleanup - Delete the Temporary Uploaded File**
//     await fs.promises.unlink(uploadedFilePath);
//     console.log('Temporary file deleted:', uploadedFilePath);



//     // **Step 7: Return the Modified File as Response**
// const response = new NextResponse(modifiedFileResponse.data, {
//   status: 200,
//   headers: {
//     'Content-Disposition': `attachment; filename=modified-${originalFileName}`,
//     'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
//   },
// });

// return response;

    

//   } catch (error) {
//     if (axios.isAxiosError(error)) {
//       console.error('Axios error:', JSON.stringify(error.response?.data || error.message, null, 2));
//     } else {
//       console.error('Unexpected error:', error);
//     }

//     // Cleanup uploaded file if it exists
//     if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
//       await fs.promises.unlink(uploadedFilePath);
//       console.log('Temporary file deleted due to error:', uploadedFilePath);
//     }

//     return NextResponse.json({ error: 'Failed to process file' }, { status: 500 });
//   }
// }






    // // **Step 5: Download the Modified File**
    // console.log(`Downloading the modified file: ${uploadPath}`);
    // const modifiedFileResponse = await axios.get(
    //   `https://api.aspose.cloud/v3.0/slides/${encodeURIComponent(uploadPath)}`,
    //   {
    //     headers: {
    //       Authorization: `Bearer ${accessToken}`,
    //     },
    //     params: {
    //       // No folder parameter since the file is in root
    //     },
    //     responseType: 'arraybuffer',
    //   }
    // );

    // console.log('Modified file downloaded:', modifiedFileResponse.status);
    // console.log('Modified file data length:', modifiedFileResponse.data.length);


// // **Step 7: Return the Modified File as Response**
    // const response = new NextResponse(modifiedFileResponse.data, {
    //   status: 200,
    //   headers: {
    //     'Content-Disposition': `attachment; filename=modified-${originalFileName}`,
    //     'Content-Type': 'application/octet-stream',
    //   },
    // });

    // return response;


    // for (let i = 1; i <= slideCount; i++) {
    //   await axios.put(
    //     `https://api.aspose.cloud/v3.0/slides/${encodeURIComponent(fileName)}/slides/${i}`,
    //     {
    //       slideShowTransition: {
    //         type: 'Morph',
    //         morphTransition: {
    //           morphType: 'ByObject', // Options: 'ByObject', 'ByWord', 'ByChar'
    //         },
    //       },
    //     },
    //     {
    //       headers: {
    //         Authorization: `Bearer ${accessToken}`,
    //         'Content-Type': 'application/json',
    //       },
    //     }
    //   );
    // }
    


    // // **Step 4: Apply Morph Transition to Each Slide**
    // for (let slideIndex = 1; slideIndex <= slideCount; slideIndex++) {
    //   console.log(`Applying morph transition to slide ${slideIndex}`);
    //   try {
    //     const transitionResponse = await axios.put(
    //       `https://api.aspose.cloud/v3.0/slides/${encodeURIComponent(uploadPath)}/slides/${slideIndex}/transition`,
    //       {
    //         type: 'Morph', // Only 'type' field
    //         morphType: 'ByObject', // Removed 'morphType' to test
    //       },
    //       {
    //         headers: {
    //           Authorization: `Bearer ${accessToken}`,
    //           'Content-Type': 'application/json',
    //         },
    //         params: {
    //           // No folder parameter since the file is in root
    //         },
    //       }
    //     );

    //     console.log(`Transition applied to slide ${slideIndex}:`, transitionResponse.data);
    //   } catch (transitionError) {
    //     if (axios.isAxiosError(transitionError)) {
    //       console.error('Axios error during transition application:', JSON.stringify(transitionError.response?.data || transitionError.message, null, 2));
    //     } else {
    //       console.error('Unexpected error during transition application:', transitionError);
    //     }
    //     throw new Error(`Failed to apply transition to slide ${slideIndex}`);
    //   }
    // }

// // /app/api/apply-morph/route.ts

// import { NextRequest, NextResponse } from 'next/server';
// import axios from 'axios';
// import fs from 'fs';
// import os from 'os';
// import path from 'path';
// import Busboy from 'busboy';

// export const runtime = 'nodejs'; // Ensure we use Node.js runtime

// export async function POST(req: NextRequest) {
//   console.log('API handler invoked with method:', req.method);

//   let uploadedFilePath = ''; // Temporary file path
//   let originalFileName = '';

//   try {
//     // Ensure the content type is multipart/form-data
//     const contentType = req.headers.get('content-type') || '';
//     if (!contentType.includes('multipart/form-data')) {
//       console.log('Unsupported Media Type:', contentType);
//       return NextResponse.json({ error: 'Unsupported Media Type' }, { status: 415 });
//     }

//     const busboy = Busboy({
//       headers: {
//         'content-type': contentType,
//       },
//     });

//     let fileUploaded = false;

//     // Create a promise to handle the busboy stream
//     const busboyPromise = new Promise<void>((resolve, reject) => {
//       busboy.on('file', (fieldname, file, info) => {
//         const { filename } = info;
//         console.log('Received filename:', filename);

//         if (!filename) {
//           reject(new Error('No filename provided'));
//           return;
//         }

//         console.log(`Processing file: ${filename}`);

//         originalFileName = filename;

//         // Generate a temporary file path
//         const tempDir = os.tmpdir();
//         uploadedFilePath = path.join(tempDir, `${Date.now()}-${originalFileName}`);

//         console.log('Temporary file path:', uploadedFilePath);

//         // Create a write stream to the temporary file
//         const writeStream = fs.createWriteStream(uploadedFilePath);

//         file.pipe(writeStream);

//         file.on('end', () => {
//           fileUploaded = true;
//           console.log(`File [${filename}] upload complete`);
//         });

//         writeStream.on('finish', () => {
//           console.log('Write stream finished');
//           resolve();
//         });

//         writeStream.on('error', (err) => {
//           console.error('Write stream error:', err);
//           reject(err);
//         });
//       });

//       busboy.on('error', (err) => {
//         console.error('Busboy error:', err);
//         reject(err);
//       });

//       busboy.on('finish', () => {
//         console.log('Busboy parsing finished');
//         if (!fileUploaded) {
//           reject(new Error('No file uploaded'));
//         } else {
//           resolve();
//         }
//       });
//     });

//     // Read the request body and pipe it to busboy
//     const reader = req.body?.getReader();
//     if (!reader) {
//       console.log('No request body found');
//       return NextResponse.json({ error: 'No request body' }, { status: 400 });
//     }

//     while (true) {
//       const { done, value } = await reader.read();
//       if (done) {
//         busboy.end();
//         break;
//       }
//       busboy.write(Buffer.from(value));
//     }

//     // Wait for busboy to finish parsing
//     await busboyPromise;

//     console.log('File parsed and saved to:', uploadedFilePath);

//     // Authenticate with Aspose API
//     const authResponse = await axios.post(
//       'https://api.aspose.cloud/connect/token',
//       `grant_type=client_credentials&client_id=${process.env.ASPOSE_CLIENT_ID}&client_secret=${process.env.ASPOSE_CLIENT_SECRET}`,
//       {
//         headers: {
//           'Content-Type': 'application/x-www-form-urlencoded',
//         },
//       }
//     );

//     console.log('Authentication response:', authResponse.data);

//     const accessToken = authResponse.data.access_token;

//     // Define uploadPath (file name only)
//     const uploadPath = originalFileName; // e.g., '8uw8.pptx'

//     console.log(`Uploading file to root folder with uploadPath: ${uploadPath}`);

//     const fileData = await fs.promises.readFile(uploadedFilePath);

//     // Log the size of the file being uploaded
//     console.log('File data length:', fileData.length);

//     // **Step 1: Upload the File to the Root Folder**
//     const uploadResponse = await axios.put(
//       `https://api.aspose.cloud/v3.0/slides/storage/file/${encodeURIComponent(uploadPath)}`,
//       fileData,
//       {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//           'Content-Type': 'application/octet-stream',
//         },
//         params: {
//           // No folder parameter needed as we're uploading to root
//         },
//       }
//     );

//     console.log('Upload response data:', uploadResponse.data);

//     // **Step 2: Verification Step** - List files in the root folder to confirm upload
//     console.log(`Verifying upload by listing files in the root folder.`);
//     const listFilesResponse = await axios.get(
//       `https://api.aspose.cloud/v3.0/slides/storage/folder/`,
//       {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//         },
//         params: {
//           // No folder parameter to list root
//         },
//       }
//     );

//     console.log('List files response data:', listFilesResponse.data);

//     // Check if the file exists in the root folder
//     const uploadedFiles = listFilesResponse.data.value;
//     const fileExists = uploadedFiles.some((file: any) => file.name === originalFileName);

//     console.log(`File exists in root folder: ${fileExists}`);

//     if (!fileExists) {
//       throw new Error(`File ${originalFileName} was not found in the root folder`);
//     }

//     // **Step 3: Get the Total Number of Slides**
//     console.log(`Retrieving slide count for file: ${uploadPath}`);
//     const slideCountResponse = await axios.get(
//       `https://api.aspose.cloud/v3.0/slides/${encodeURIComponent(uploadPath)}/slides`,
//       {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//         },
//         params: {
//           // No folder parameter since the file is in root
//         },
//       }
//     );

//     console.log('Slide count response data:', slideCountResponse.data);

//     const slideCount = slideCountResponse.data.slideList.length;
//     console.log(`Total number of slides: ${slideCount}`);

//     // **Step 4: Apply Morph Transition to Each Slide**
//     for (let slideIndex = 1; slideIndex <= slideCount; slideIndex++) {
//       console.log(`Applying morph transition to slide ${slideIndex}`);
//       const transitionResponse = await axios.put(
//         `https://api.aspose.cloud/v3.0/slides/${encodeURIComponent(uploadPath)}/slides/${slideIndex}/transition`,
//         {
//           Type: 'Morph',
//           MorphType: 'ByObject',
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${accessToken}`,
//             'Content-Type': 'application/json',
//           },
//           params: {
//             // No folder parameter since the file is in root
//           },
//         }
//       );

//       console.log(`Transition applied to slide ${slideIndex}:`, transitionResponse.data);
//     }

//     // **Step 5: Download the Modified File**
//     console.log(`Downloading the modified file: ${uploadPath}`);
//     const modifiedFileResponse = await axios.get(
//       `https://api.aspose.cloud/v3.0/slides/${encodeURIComponent(uploadPath)}`,
//       {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//         },
//         params: {
//           // No folder parameter since the file is in root
//         },
//         responseType: 'arraybuffer',
//       }
//     );

//     console.log('Modified file downloaded:', modifiedFileResponse.status);
//     console.log('Modified file data length:', modifiedFileResponse.data.length);

//     // **Step 6: Cleanup - Delete the Temporary Uploaded File**
//     await fs.promises.unlink(uploadedFilePath);
//     console.log('Temporary file deleted:', uploadedFilePath);

//     // **Step 7: Return the Modified File as Response**
//     const response = new NextResponse(modifiedFileResponse.data, {
//       status: 200,
//       headers: {
//         'Content-Disposition': `attachment; filename=modified-${originalFileName}`,
//         'Content-Type': 'application/octet-stream',
//       },
//     });

//     return response;
//   } catch (error) {
//     if (axios.isAxiosError(error)) {
//       console.error('Axios error:', JSON.stringify(error.response?.data || error.message, null, 2));
//     } else {
//       console.error('Unexpected error:', error);
//     }

//     // Cleanup uploaded file if it exists
//     if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
//       await fs.promises.unlink(uploadedFilePath);
//       console.log('Temporary file deleted due to error:', uploadedFilePath);
//     }

//     return NextResponse.json({ error: 'Failed to process file' }, { status: 500 });
//   }
// }

// app/api/templates/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { google } from 'googleapis';
import { db } from '@/lib/db';
import axios from 'axios';

interface Template {
  id: string;
  name: string;
  preview: string;
  category: string;
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    console.log('🔑 Authenticated User ID:', userId);

    if (!userId) {
      console.log('⚠️ Unauthorized: No userId found.');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user's subscription
    const subscription = await db.userSubscription.findUnique({
      where: { userId },
    });

    const isPro =
      subscription &&
      subscription.stripeCurrentPeriodEnd &&
      new Date(subscription.stripeCurrentPeriodEnd) > new Date();

    const userType: 'pro' | 'free' = isPro ? 'pro' : 'free';
    console.log('🟢 User Type:', userType);

    // Define main folder ID based on userType
    const MAIN_FOLDER_IDS: { [key: string]: string } = {
      free: process.env.FREE_TEMPLATES_FOLDER_ID || '',
      pro: process.env.PRO_TEMPLATES_FOLDER_ID || '',
    };

    const mainFolderId = MAIN_FOLDER_IDS[userType];

    if (!mainFolderId) {
      console.log('⚠️ Main folder ID not configured for user type:', userType);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    // Initialize Google Drive API
    const drive = google.drive({
      version: 'v3',
      auth: process.env.GOOGLE_API_KEY,
    });

    // Fetch all subfolders under the main folder
    const foldersResponse = await drive.files.list({
      q: `'${mainFolderId}' in parents and mimeType='application/vnd.google-apps.folder'`,
      fields: 'files(id, name)',
    });

    const categories = foldersResponse.data.files?.map((folder) => ({
      name: folder.name?.toLowerCase() || 'unknown',
      folderId: folder.id || 'unknown',
    })) || [];

    // Initialize templates array
    let templates: Template[] = [];

    // Fetch templates from each subfolder
    for (const category of categories) {
      console.log(`Fetching templates from ${category.name} folder:`, category.folderId);

      const response = await drive.files.list({
        q: `mimeType='application/vnd.google-apps.presentation' and '${category.folderId}' in parents`,
        fields: 'files(id, name, thumbnailLink)',
      });

      const categoryTemplates: Template[] =
        response.data.files?.map((file) => ({
          id: file.id || '',
          name: file.name || 'Unnamed',
          preview: file.thumbnailLink || '', // May not always have a thumbnail
          category: category.name,
        })) || [];

      templates = templates.concat(categoryTemplates);
    }

    console.log(`Fetched ${templates.length} templates for userType: ${userType}`);

    return NextResponse.json({ templates }, { status: 200 });
  } catch (error: any) {
    console.error('❌ Error fetching templates:', error);

    // Optionally, log more details about the error
    if (error.response) {
      console.error('⚠️ Error response data:', error.response.data);
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}



// import { NextResponse } from 'next/server';
// import { google } from 'googleapis';

// export const dynamic = 'force-dynamic';

// const drive = google.drive({
//   version: 'v3',
//   auth: process.env.GOOGLE_API_KEY,
// });

// // Define a TypeScript interface for the template objects
// interface Template {
//   id: string;
//   name: string;
//   preview: string;
//   category: string;
// }

// export async function GET() {
//   try {
//     const mainFolderId = '1ANhge_SendsF5jKSyEq773TyItk9C6Mn'; // Main folder ID
//     console.log('Fetching categories from main folder:', mainFolderId);

//     // Step 1: Fetch all subfolders under the main folder
//     const foldersResponse = await drive.files.list({
//       q: `'${mainFolderId}' in parents and mimeType='application/vnd.google-apps.folder'`,
//       fields: 'files(id, name)',
//     });

//     const categories = foldersResponse.data.files?.map((folder) => ({
//       name: folder.name?.toLowerCase() || 'unknown', // Fallback if name is null or undefined
//       folderId: folder.id || 'unknown', // Fallback if folder.id is null or undefined
//     })) || [];

//     // Define the templates array with a strict type
//     let templates: Template[] = [];

//     // Step 2: Fetch templates from each subfolder
//     for (const category of categories) {
//       console.log(`Fetching templates from ${category.name} folder:`, category.folderId);

//       const response = await drive.files.list({
//         q: `mimeType='application/vnd.google-apps.presentation' and '${category.folderId}' in parents`,
//         fields: 'files(id, name, thumbnailLink)',
//       });

//       const categoryTemplates: Template[] =
//         response.data.files?.map((file) => ({
//           id: file.id || '', // Fallback if file.id is null or undefined
//           name: file.name || 'Unnamed', // Fallback if file.name is missing
//           preview: file.thumbnailLink || '', // Fallback if thumbnailLink is missing
//           category: category.name, // Assign the category
//         })) || [];

//       templates = templates.concat(categoryTemplates);
//     }

//     return NextResponse.json({ templates }, { status: 200 });
//   } catch (error) {
//     if (error instanceof Error) {
//       console.error('Error fetching templates:', (error as any).response?.data || error.message);
//     } else {
//       console.error('Unexpected error:', error);
//     }
//     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
//   }
// }





// import { NextRequest, NextResponse } from 'next/server';
// import { google } from 'googleapis';

// export const dynamic = 'force-dynamic';

// const drive = google.drive({
//   version: 'v3',
//   auth: process.env.GOOGLE_API_KEY,
// });

// export async function GET(req: NextRequest) {
//   try {
//     const mainFolderId = '1ANhge_SendsF5jKSyEq773TyItk9C6Mn'; // Main folder ID
//     console.log('Fetching categories from main folder:', mainFolderId);

//     // Step 1: Fetch all subfolders under the main folder
//     const foldersResponse = await drive.files.list({
//       q: `'${mainFolderId}' in parents and mimeType='application/vnd.google-apps.folder'`,
//       fields: 'files(id, name)',
//     });

//     const categories = foldersResponse.data.files?.map((folder) => ({
//       name: folder.name.toLowerCase(), // Assuming folder names are 'business', 'children', 'education'
//       folderId: folder.id,
//     })) || [];

//     let templates = [];

//     // Step 2: Fetch templates from each subfolder
//     for (const category of categories) {
//       console.log(`Fetching templates from ${category.name} folder:`, category.folderId);

//       const response = await drive.files.list({
//         q: `mimeType='application/vnd.google-apps.presentation' and '${category.folderId}' in parents`,
//         fields: 'files(id, name, thumbnailLink)',
//       });

//       const categoryTemplates =
//         response.data.files?.map((file) => ({
//           id: file.id,
//           name: file.name,
//           preview: file.thumbnailLink,
//           category: category.name, // Assign the category
//         })) || [];

//       templates = templates.concat(categoryTemplates);
//     }

//     return NextResponse.json({ templates }, { status: 200 });
//   } catch (error) {
//     if (error instanceof Error) {
//       console.error('Error fetching templates:', (error as any).response?.data || error.message);
//     } else {
//       console.error('Unexpected error:', error);
//     }
//     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
//   }
// }


// import { NextRequest, NextResponse } from 'next/server';
// import { google } from 'googleapis';

// export const dynamic = 'force-dynamic';

// const drive = google.drive({
//   version: 'v3',
//   auth: process.env.GOOGLE_API_KEY,
// });

// export async function GET(req: NextRequest) {
//   try {
//     // Replace these with your actual subfolder IDs
//     const categories = [
//       { name: 'business', folderId: 'BUSINESS_FOLDER_ID' },
//       { name: 'children', folderId: 'CHILDREN_FOLDER_ID' },
//       { name: 'education', folderId: 'EDUCATION_FOLDER_ID' },
//     ];

//     let templates = [];

//     for (const category of categories) {
//       console.log(`Fetching templates from ${category.name} folder:`, category.folderId);

//       const response = await drive.files.list({
//         q: `mimeType='application/vnd.google-apps.presentation' and '${category.folderId}' in parents`,
//         fields: 'files(id, name, thumbnailLink)',
//       });

//       const categoryTemplates =
//         response.data.files?.map((file) => ({
//           id: file.id,
//           name: file.name,
//           preview: file.thumbnailLink,
//           category: category.name, // Assign the category
//         })) || [];

//       templates = templates.concat(categoryTemplates);
//     }

//     return NextResponse.json({ templates }, { status: 200 });
//   } catch (error) {
//     if (error instanceof Error) {
//       console.error('Error fetching templates:', (error as any).response?.data || error.message);
//     } else {
//       console.error('Unexpected error:', error);
//     }
//     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
//   }
// }


// import { NextRequest, NextResponse } from 'next/server';
// import { google } from 'googleapis';

// export const dynamic = 'force-dynamic';

// const drive = google.drive({
//   version: 'v3',
//   auth: process.env.GOOGLE_API_KEY,
// });

// export async function GET(req: NextRequest) {
//   try {
//     const folderId = '1V26eaxdAujm-68yTLBcOt8iZMIpZiRvi'; 
//     console.log('Fetching templates from folder:', folderId);

//     const response = await drive.files.list({
//       q: `mimeType='application/vnd.google-apps.presentation' and '${folderId}' in parents`,
//       fields: 'files(id, name, thumbnailLink)',
//     });

//     const templates = response.data.files?.map(file => ({
//       id: file.id,
//       name: file.name,
//       preview: file.thumbnailLink,
//     })) || [];

//     return NextResponse.json({ templates }, { status: 200 });
//   } catch (error) {
//     if (error instanceof Error) {
//       console.error(
//         'Error fetching templates:', 
//         (error as any).response?.data || error.message
//       );
//     } else {
//       console.error('Unexpected error:', error);
//     }
//     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
//   }
// }


// import { NextRequest, NextResponse } from 'next/server';
// import { google } from 'googleapis';

// export const dynamic = 'force-dynamic';

// const drive = google.drive({
//   version: 'v3',
//   auth: process.env.GOOGLE_API_KEY,
// });

// export async function GET(req: NextRequest) {
//   try {
//     const folderId = '1V26eaxdAujm-68yTLBcOt8iZMIpZiRvi'; 
//     console.log('Fetching templates from folder:', folderId);

//     const response = await drive.files.list({
//       q: `mimeType='application/vnd.google-apps.presentation' and '${folderId}' in parents`,
//       fields: 'files(id, name, thumbnailLink)',
//     });

//     const templates = response.data.files?.map(file => ({
//       id: file.id,
//       name: file.name,
//       preview: file.thumbnailLink,
//     })) || [];

//     return NextResponse.json({ templates }, { status: 200 });
//   } catch (error) {
//     console.error(
//       'Error fetching templates:', 
//       error.response?.data || error.message || error
//     );
//     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
//   }
// }



// import { NextRequest, NextResponse } from 'next/server';
// import { google } from 'googleapis';

// export const dynamic = 'force-dynamic';

// const drive = google.drive({
//   version: 'v3',
//   auth: process.env.GOOGLE_API_KEY,
// });

// export async function GET(req: NextRequest) {
//   try {
//     const folderId = '1V26eaxdAujm-68yTLBcOt8iZMIpZiRvi'; 
//     console.log('Fetching templates from folder:', folderId);

//     const response = await drive.files.list({
//       q: `mimeType='application/vnd.google-apps.presentation' and '${folderId}' in parents`,
//       fields: 'files(id, name, thumbnailLink)',
//     });

//     const templates = response.data.files.map(file => ({
//       id: file.id,
//       name: file.name,
//       preview: file.thumbnailLink,
//     }));

//     return NextResponse.json({ templates }, { status: 200 });
//   } catch (error) {
//     console.error('Error fetching templates:', error.response?.data || error.message || error);
//     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
//   }
// }

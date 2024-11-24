import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export const dynamic = 'force-dynamic';

const drive = google.drive({
  version: 'v3',
  auth: process.env.GOOGLE_API_KEY,
});

export async function GET(req: NextRequest) {
  try {
    const mainFolderId = '1ANhge_SendsF5jKSyEq773TyItk9C6Mn'; // Main folder ID
    console.log('Fetching categories from main folder:', mainFolderId);

    // Step 1: Fetch all subfolders under the main folder
    const foldersResponse = await drive.files.list({
      q: `'${mainFolderId}' in parents and mimeType='application/vnd.google-apps.folder'`,
      fields: 'files(id, name)',
    });

    const categories = foldersResponse.data.files?.map((folder) => ({
      name: folder.name.toLowerCase(), // Assuming folder names are 'business', 'children', 'education'
      folderId: folder.id,
    })) || [];

    let templates = [];

    // Step 2: Fetch templates from each subfolder
    for (const category of categories) {
      console.log(`Fetching templates from ${category.name} folder:`, category.folderId);

      const response = await drive.files.list({
        q: `mimeType='application/vnd.google-apps.presentation' and '${category.folderId}' in parents`,
        fields: 'files(id, name, thumbnailLink)',
      });

      const categoryTemplates =
        response.data.files?.map((file) => ({
          id: file.id,
          name: file.name,
          preview: file.thumbnailLink,
          category: category.name, // Assign the category
        })) || [];

      templates = templates.concat(categoryTemplates);
    }

    return NextResponse.json({ templates }, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error fetching templates:', (error as any).response?.data || error.message);
    } else {
      console.error('Unexpected error:', error);
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


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

import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export const dynamic = 'force-dynamic';

const drive = google.drive({
  version: 'v3',
  auth: process.env.GOOGLE_API_KEY,
});

export async function GET(req: NextRequest) {
  try {
    const folderId = '1V26eaxdAujm-68yTLBcOt8iZMIpZiRvi'; 
    console.log('Fetching templates from folder:', folderId);

    const response = await drive.files.list({
      q: `mimeType='application/vnd.google-apps.presentation' and '${folderId}' in parents`,
      fields: 'files(id, name, thumbnailLink)',
    });

    const templates = response.data.files?.map(file => ({
      id: file.id,
      name: file.name,
      preview: file.thumbnailLink,
    })) || [];

    return NextResponse.json({ templates }, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      console.error(
        'Error fetching templates:', 
        (error as any).response?.data || error.message
      );
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

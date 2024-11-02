// src/app/api/templates/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export const dynamic = 'force-dynamic'; // Ensure dynamic content is fetched at runtime

// Set up Google Drive client
const drive = google.drive({
  version: 'v3',
  auth: process.env.GOOGLE_API_KEY // Use your Google API Key or OAuth2 token
});

// Handle GET requests to /api/templates
export async function GET(req: NextRequest) {
  try {
    // Query Google Drive to get a list of presentation templates
    const response = await drive.files.list({
      q: "mimeType='application/vnd.google-apps.presentation' and 'YOUR_FOLDER_ID' in parents",
      fields: 'files(id, name, thumbnailLink)', // Get only necessary fields
    });

    // Extract file information for each template
    const templates = response.data.files.map(file => ({
      id: file.id,
      name: file.name,
      preview: file.thumbnailLink,
    }));

    // Return the templates as JSON response
    return NextResponse.json({ templates }, { status: 200 });

  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

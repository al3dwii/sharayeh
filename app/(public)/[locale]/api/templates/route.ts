// /src/app/api/templates/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { google } from 'googleapis';
import { db } from '@/lib/db';
import { pricingPlans, Plan } from '@/utils/planConfig';
import { getHighestUserTier } from '@/utils/getHighestUserTier'; // Import the utility function

interface Template {
  id: string;
  name: string;
  preview: string;
  category: string;
}

export const dynamic = 'force-dynamic';


export const runtime = 'nodejs'; // Ensure Node.js runtime


// Define a union type for user tiers
type Tier = 'free' | 'standard' | 'premium';

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 Incoming GET request to /api/templates');

    // 1. Authenticate the User
    const { userId } = getAuth(req);
    console.log('👤 Authenticated User ID:', userId);

    if (!userId) {
      console.log('Response: Unauthorized - Missing userId');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Determine User Tier Using the Utility Function
    const userTier: Tier = await getHighestUserTier(userId);
    console.log('🟢 Resolved User Tier:', userTier);

    // 3. Map Tier to Google Drive Folder IDs
    const FOLDER_IDS: Record<Tier, string> = {
      free: process.env.FREE_TEMPLATES_FOLDER_ID || '',
      standard: process.env.STANDARD_TEMPLATES_FOLDER_ID || '',
      premium: process.env.PREMIUM_TEMPLATES_FOLDER_ID || '',
    };

    const folderId = FOLDER_IDS[userTier];
    console.log('🔍 Resolved Folder ID:', folderId);

    if (!folderId) {
      console.log('⚠️ Webhook URL not configured for tier:', userTier);
      return NextResponse.json(
        { error: `No folder ID configured for tier: ${userTier}` },
        { status: 500 }
      );
    }

    // 4. Initialize Google Drive API
    const drive = google.drive({
      version: 'v3',
      auth: process.env.GOOGLE_API_KEY,
    });

    // 5. Fetch Sub-Folders (Categories) Within This Tier's Folder
    const foldersResponse = await drive.files.list({
      q: `'${folderId}' in parents and mimeType='application/vnd.google-apps.folder'`,
      fields: 'files(id, name)',
    });

    const categories =
      foldersResponse.data.files?.map((folder) => ({
        name: folder.name!.toLowerCase(),
        folderId: folder.id,
      })) || [];

    console.log('📂 Retrieved Categories:', categories);

  

    // 6. For Each Category Sub-Folder, Fetch Presentation Files
    let templates: Template[] = [];
    for (const category of categories) {
      console.log(`🔍 Fetching templates for category: ${category.name}`);

      const response = await drive.files.list({
        q: `mimeType='application/vnd.google-apps.presentation' and '${category.folderId}' in parents`,
        fields: 'files(id, name, thumbnailLink)',
      });
      // 2. default
      const files = response.data.files ?? [];

      // 3. filter out any missing ids/names
      const validFiles = files.filter(
        (f): f is { id: string; name: string; thumbnailLink?: string } =>
          typeof f.id === 'string' && typeof f.name === 'string'
      );


      const categoryTemplates: Template[] = validFiles.map((file) => ({

      // const categoryTemplates: Template[] =
      //   response.data.files?.map((file) => ({
          id: file.id,
          name: file.name,
          preview: file.thumbnailLink || '',
          category: category.name,
        })) || [];

      templates = templates.concat(categoryTemplates);
      console.log(`✅ Retrieved ${categoryTemplates.length} templates for category: ${category.name}`);
    }

    // 7. Return All Templates in JSON
    console.log('📊 Total Templates Retrieved:', templates.length);
    return NextResponse.json({ templates });
  } catch (error: any) {
    console.error('❌ Error fetching templates:', error);

    // Enhanced Error Handling
    if (error.response) {
      // Errors from Google Drive API
      console.error('⚠️ Google Drive API Response Status:', error.response.status);
      console.error('⚠️ Google Drive API Response Data:', error.response.data);
    } else if (error.request) {
      // No response received from Google Drive API
      console.error('⚠️ No response received from Google Drive API.');
    } else {
      // Other errors
      console.error('⚠️ Error setting up Google Drive API request:', error.message);
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


// Import necessary modules
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { google } from 'googleapis';
import { db } from '@/lib/db';
import { pricingPlans, Plan } from '@/config/planConfig'; // Ensure you have access to pricingPlans

interface Template {
  id: string;
  name: string;
  preview: string;
  category: string;
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user's subscription from userSubscription instead of subscription
    const userSubscription = await db.userSubscription.findUnique({
      where: { userId },
      select: { stripePriceId: true },
    });

    let userTier = 'free'; // Default tier

    if (userSubscription?.stripePriceId) {
      const plan = pricingPlans.find(
        (plan: Plan) => plan.stripePriceId === userSubscription.stripePriceId
      );

      if (plan) {
        userTier = plan.tier.toLowerCase();
      } else {
        console.warn('No matching SubscriptionPlan found for stripePriceId:', userSubscription.stripePriceId);
      }
    }

    console.log('🔍 Resolved User Tier:', userTier);

    const FOLDER_IDS: Record<string, string> = {
      free: process.env.FREE_TEMPLATES_FOLDER_ID || '',
      standard: process.env.STANDARD_TEMPLATES_FOLDER_ID || '',
      premium: process.env.PREMIUM_TEMPLATES_FOLDER_ID || '',
    };

    const folderId = FOLDER_IDS[userTier];
    console.log('🔍 Resolved Folder ID:', folderId);

    if (!folderId) {
      return NextResponse.json({ error: `No folder ID configured for tier: ${userTier}` }, { status: 400 });
    }

    // Initialize Google Drive API
    const drive = google.drive({
      version: 'v3',
      auth: process.env.GOOGLE_API_KEY,
    });

    const foldersResponse = await drive.files.list({
      q: `'${folderId}' in parents and mimeType='application/vnd.google-apps.folder'`,
      fields: 'files(id, name)',
    });

    console.log('🔍 Folders Response:', foldersResponse.data.files);

    const categories = foldersResponse.data.files?.map((folder) => ({
      name: folder.name.toLowerCase(),
      folderId: folder.id,
    })) || [];

    let templates: Template[] = [];
    for (const category of categories) {
      console.log(`🔍 Fetching templates for category: ${category.name}`);

      const response = await drive.files.list({
        q: `mimeType='application/vnd.google-apps.presentation' and '${category.folderId}' in parents`,
        fields: 'files(id, name, thumbnailLink)',
      });

      const categoryTemplates: Template[] =
        response.data.files?.map((file) => ({
          id: file.id,
          name: file.name,
          preview: file.thumbnailLink || '',
          category: category.name,
        })) || [];

      templates = templates.concat(categoryTemplates);
    }

    return NextResponse.json({ templates });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

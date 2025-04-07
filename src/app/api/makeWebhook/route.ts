// /src/api/makeWebhook/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import axios from 'axios';
import FormData from 'form-data';
import { getHighestUserTier } from '@/utils/getHighestUserTier'; // Ensure this function exists and works as expected

export const runtime = 'nodejs'; // Ensure Node.js runtime

export const dynamic = 'force-dynamic';

// Define a union type for user tiers
type Tier = 'free' | 'standard' | 'premium';

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    console.log('🔑 Authenticated User ID:', userId);

    if (!userId) {
      console.log('⚠️ Unauthorized: No userId found.');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Determine if the request is for topic or file
    const contentType = req.headers.get('content-type') || '';
    let payload: any = {};

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      payload = {
        document: formData.get('document'),
        templateId: formData.get('templateId'),
        categoryId: formData.get('categoryId'),
        userId: formData.get('userId'),
        requestId: formData.get('requestId'),
        uniqueName: formData.get('uniqueName'), // Extract uniqueName
      };
    } else if (contentType.includes('application/json')) {
      payload = await req.json();
      // Ensure uniqueName is extracted if needed
      // Assuming uniqueName is part of the JSON payload
    } else {
      console.log('⚠️ Unsupported content type:', contentType);
      return NextResponse.json({ error: 'Unsupported content type' }, { status: 400 });
    }

    const { topic, templateId, categoryId, requestId, document, uniqueName } = payload;

    // Validate uniqueName
    if (!uniqueName || typeof uniqueName !== 'string') {
      console.log('⚠️ Missing or invalid uniqueName.');
      return NextResponse.json({ error: 'uniqueName is required and must be a string' }, { status: 400 });
    }

    // Optionally, validate the format of uniqueName
    const uniqueNameRegex = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}-\d{13}$/;
    if (!uniqueNameRegex.test(uniqueName)) {
      console.log('⚠️ uniqueName does not match the required format.');
      return NextResponse.json({ error: 'uniqueName format is invalid' }, { status: 400 });
    }

    // **Determine User Tier**

    // 1. Get the highest user tier using the utility function
    let userTier: Tier = await getHighestUserTier(userId);

    // 2. Check if the user is a super admin
    const superAdmin = await db.superAdmin.findUnique({
      where: { userId },
    });

    const isSuperAdmin = !!superAdmin;

    if (isSuperAdmin) {
      console.log('👑 User is a Super Admin.');
      // Option 1: Treat super admins as 'premium' tier
      userTier = 'premium';

     
    }

    // Define webhook URLs from environment variables
    const WEBHOOKS: Record<Tier, { topic: string; file: string }> = {
      free: {
        topic: process.env.FREE_TOPIC_WEBHOOK_URL || '',
        file: process.env.PREMIUM_FILE_WEBHOOK_URL || '',
      },
      standard: {
        topic: process.env.STANDARD_TOPIC_WEBHOOK_URL || '',
        file: process.env.PREMIUM_FILE_WEBHOOK_URL || '',
      },
      premium: {
        topic: process.env.PREMIUM_TOPIC_WEBHOOK_URL || '',
        file: process.env.PREMIUM_FILE_WEBHOOK_URL || '',
      },
     
    };

    let webhookUrl = '';
    let data: any = {};
    let headers: { [key: string]: string } = {};

    if (topic) {
      webhookUrl = WEBHOOKS[userTier]?.topic || '';
      data = {
        topic,
        templateId,
        categoryId,
        userId,
        requestId,
        uniqueName, // Include uniqueName
      };
      console.log('📡 Preparing data for topic-specific webhook:', data);
    } else if (document) {
      webhookUrl = WEBHOOKS[userTier]?.file || '';

      // Ensure 'document' is a Blob and convert it to a Buffer
      if (!(document instanceof Blob)) {
        console.log('⚠️ Invalid document format.');
        return NextResponse.json({ error: 'Invalid document format' }, { status: 400 });
      }

      // Convert Blob to ArrayBuffer, then to Buffer
      const arrayBuffer = await document.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Extract filename and content type if available
      const filename = (document as any).name || 'document'; // Adjust as needed
      const contentType = (document as any).type || 'application/octet-stream';

      const fileFormData = new FormData();
      fileFormData.append('document', buffer, {
        filename,
        contentType,
      });
      fileFormData.append('templateId', templateId as string);
      fileFormData.append('categoryId', categoryId as string);
      fileFormData.append('userId', userId as string);
      fileFormData.append('requestId', requestId as string);
      fileFormData.append('uniqueName', uniqueName as string); // Include uniqueName
      data = fileFormData;
      headers = fileFormData.getHeaders(); // Set headers from FormData
      console.log('📡 Preparing data for file-specific webhook.');
    } else {
      console.log('⚠️ Invalid payload: Neither topic nor document provided.');
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    if (!webhookUrl) {
      console.log('⚠️ Webhook URL not configured for user tier:', userTier);
      return NextResponse.json({ error: 'Webhook URL not configured' }, { status: 500 });
    }

    console.log('📡 Sending data to webhook:', webhookUrl);
    await axios.post(webhookUrl, data, { headers });
    console.log('✅ Data sent to webhook successfully.');

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('❌ Error invoking webhook:', error);

    // Optionally, log more details about the error
    if (error.response) {
      console.error('⚠️ Webhook Response Status:', error.response.status);
      console.error('⚠️ Webhook Response Data:', error.response.data);
    } else if (error.request) {
      console.error('⚠️ No response received from webhook.');
    } else {
      console.error('⚠️ Error setting up webhook request:', error.message);
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

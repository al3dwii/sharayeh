// app/api/makeWebhook/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import axios from 'axios';

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
    let isFile = false;
    let payload: any = {};

    if (contentType.includes('multipart/form-data')) {
      isFile = true;
      const formData = await req.formData();
      payload = {
        document: formData.get('document'),
        templateId: formData.get('templateId'),
        categoryId: formData.get('categoryId'),
        userId: formData.get('userId'),
        requestId: formData.get('requestId'),
      };
    } else if (contentType.includes('application/json')) {
      payload = await req.json();
    } else {
      console.log('⚠️ Unsupported content type:', contentType);
      return NextResponse.json({ error: 'Unsupported content type' }, { status: 400 });
    }

    const { topic, templateId, categoryId, requestId, document } = payload;

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

    // Define webhook URLs from environment variables
    const WEBHOOKS = {
      free: {
        topic: process.env.FREE_TOPIC_WEBHOOK_URL || '',
        file: process.env.FREE_FILE_WEBHOOK_URL || '',
      },
      pro: {
        topic: process.env.PRO_TOPIC_WEBHOOK_URL || '',
        file: process.env.PRO_FILE_WEBHOOK_URL || '',
      },
    };

    let webhookUrl = '';
    let data: any;
    let headers: { [key: string]: string } = {};

    if (topic) {
      webhookUrl = WEBHOOKS[userType].topic;
      data = {
        topic,
        templateId,
        categoryId,
        userId,
        requestId,
      };
      console.log('📡 Preparing data for topic-specific webhook:', data);
    } else if (document) {
      webhookUrl = WEBHOOKS[userType].file;
      data = new FormData();
      data.append('document', document as Blob);
      data.append('templateId', templateId as string);
      data.append('categoryId', categoryId as string);
      data.append('userId', userId as string);
      data.append('requestId', requestId as string);
      headers['Content-Type'] = 'multipart/form-data';
      console.log('📡 Preparing data for file-specific webhook.');
    } else {
      console.log('⚠️ Invalid payload: Neither topic nor document provided.');
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    if (!webhookUrl) {
      console.log('⚠️ Webhook URL not configured for user type:', userType);
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

// app/api/user/status/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req); // Retrieve userId from Clerk's authentication
    console.log('🔑 Authenticated User ID:', userId);

    if (!userId) {
      console.log('⚠️ Unauthorized: No userId found.');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch the user's subscription
    const subscription = await db.userSubscription.findUnique({
      where: { userId },
    });

    let isPro = false;

    if (subscription) {
      // Check if the subscription is active
      if (
        subscription.stripeCurrentPeriodEnd &&
        new Date(subscription.stripeCurrentPeriodEnd) > new Date()
      ) {
        isPro = true;
      }
    }

    return NextResponse.json({ isPro }, { status: 200 });
  } catch (error) {
    console.error('❌ Error fetching user status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


// app/api/user/status/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { pricingPlans, Plan } from '@/config/planConfig'; // Ensure you have access to pricingPlans

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

    return NextResponse.json({ userTier }, { status: 200 });
  } catch (error) {
    console.error('❌ Error fetching user status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


// src/app/api/status/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { pricingPlans, Plan } from '@/utils/planConfig'; // Ensure you have access to pricingPlans

export const runtime = 'nodejs'; // Ensure Node.js runtime

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user's package, including the related Package data
    const userPackage = await db.userPackage.findFirst({
      where: { userId },
      include: { package: true }, // Include the related Package
    });

    let userTier = 'free'; // Default tier if no active subscription

    if (userPackage?.stripeCustomerId && userPackage.package) {
      const plan = pricingPlans.find(
        (plan: Plan) => plan.stripePriceId === userPackage.package.stripePriceId
      );

      if (plan) {
        userTier = plan.tier.toLowerCase();
      } else {
        console.warn(
          'No matching SubscriptionPlan found for stripePriceId:',
          userPackage.package.stripePriceId
        );
      }
    }

    console.log('🔍 Resolved User Tier:', userTier);
    return NextResponse.json({ userTier }, { status: 200 });
  } catch (error) {
    console.error('❌ Error fetching user status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


// app/api/user-data/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db'; // Prisma client
import { getAuth } from '@clerk/nextjs/server'; // Clerk server-side auth
import { pricingPlans, Plan } from '@/config/planConfig'; // Import plan config
import { stripe } from '@/lib/stripe'; // Import Stripe client

export const dynamic = 'force-dynamic'; // Ensure dynamic content is fetched at runtime

// Handle GET requests to /api/user-data
export async function GET(req: NextRequest) {
  try {
    console.log('🔍 Incoming GET request to /api/user-data');

    const { userId } = getAuth(req); // Extract userId from auth context
    console.log('👤 Authenticated User ID:', userId);

    if (!userId) {
      console.log('Response: Unauthorized - Missing userId');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch or create UserCredits using upsert
    const userCredits = await ensureUserCredits(userId);

    // Check for UserPackage, including Package relation
    const userPackage = await db.userPackage.findUnique({
      where: { userId },
      include: {
        package: true, // include the related Package
      },
    });

    // If there's a purchased package, attempt to map it to the config
    if (userPackage?.stripeCustomerId && userPackage.package) {
      console.log('📊 Retrieved UserPackage:', userPackage);

      const plan = pricingPlans.find(
        (p: Plan) => p.stripePriceId === userPackage.package.stripePriceId
      );

      if (plan) {
        console.log('📊 Mapped UserPackage to SubscriptionPlan:', plan);
        return buildResponse(userCredits, plan.id, plan.tier);
      }

      console.log(
        '📊 No matching SubscriptionPlan found for stripePriceId:',
        userPackage.package.stripePriceId
      );
    }

    // Default to Free plan if no active subscription
    const freePlan = getFreePlan();
    console.log('📊 User has no subscription. Assigning Free plan:', freePlan.id);
    return buildResponse(userCredits, freePlan.id, freePlan.tier);
  } catch (error: any) {
    console.error('🛑 Error fetching user data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper to ensure UserCredits exist for the user using upsert
async function ensureUserCredits(userId: string) {
  try {
    console.log('📊 Ensuring UserCredits for userId:', userId);

    const userCredits = await db.userCredits.upsert({
      where: { userId }, // Unique identifier to check existing record
      update: {}, // No fields to update if the record exists
      create: {
        userId,
        credits: 200, // Default credits for Free plan
        usedCredits: 0,
      },
      select: { credits: true, usedCredits: true }, // Select only necessary fields
    });

    console.log('📊 Retrieved or Created UserCredits:', userCredits);
    return userCredits;
  } catch (error: any) {
    console.error('🛑 Error in ensureUserCredits:', error);
    throw error; // Re-throw the error after logging
  }
}

// Helper function to build API response
function buildResponse(
  userCredits: { credits: number; usedCredits: number },
  planId: string,
  tier: string
) {
  return NextResponse.json(
    {
      credits: userCredits.credits,
      usedCredits: userCredits.usedCredits,
      planId,
      tier,
    },
    { status: 200 }
  );
}

// Helper function to get Free plan
function getFreePlan(): Plan {
  const freePlan = pricingPlans.find((plan: Plan) => plan.id === 'cm4kcbd6t00007ndb3r9dydrc');
  if (!freePlan) {
    throw new Error('Free plan not found in pricingPlans');
  }
  return freePlan;
}

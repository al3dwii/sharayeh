// src/app/api/status/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { pricingPlans, Plan } from '@/config/planConfig'; // Ensure you have access to pricingPlans

export async function GET(request: NextRequest) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user's package, including the related Package data
    const userPackage = await db.userPackage.findUnique({
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


// // src/app/api/status/route.ts

// import { NextRequest, NextResponse } from 'next/server';
// import { getAuth } from '@clerk/nextjs/server';
// import { db } from '@/lib/db';
// import { pricingPlans, Plan } from '@/config/planConfig'; // Ensure you have access to pricingPlans

// export async function GET(request: NextRequest) {
//   try {

//   const { userId } = getAuth(request);

//   if (!userId) {
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//   }

//     // Fetch user's subscription from userSubscription instead of subscription
//     const userPackage = await db.userPackage.findUnique({
//       where: { userId },
//       select: { stripePurchaseId: true },
//     });

//     let userTier = 'free'; // Default tier

//     if (userPackage?.stripePurchaseId) {
//       const plan = pricingPlans.find(
//         (plan: Plan) => plan.stripePriceId === userPackage.stripePurchaseId
//       );

//       if (plan) {
//         userTier = plan.tier.toLowerCase();
//       } else {
//         console.warn('No matching SubscriptionPlan found for stripePriceId:', userPackage.stripePurchaseId);
//       }
//     }

//     console.log('🔍 Resolved User Tier:', userTier);

//     return NextResponse.json({ userTier }, { status: 200 });
//   } catch (error) {
//     console.error('❌ Error fetching user status:', error);
//     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
//   }
// }


// import { NextRequest, NextResponse } from 'next/server';
// import { getAuth } from '@clerk/nextjs/server';
// import { db } from '@/lib/db';
// import { pricingPlans, Plan } from '@/config/planConfig';

// /**
//  * GET /api/user/status
//  *
//  * 1. Authenticates via Clerk.
//  * 2. Ensures userCredits exist for the user.
//  * 3. Resolves a tier from the user's credits.
//  * 4. Returns { userTier } in JSON response.
//  */
// export async function GET(req: NextRequest) {
//   try {
//     // 1) Get user ID from Clerk
//     const { userId } = getAuth(req);

//     if (!userId) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     // 2) Ensure the user has a userCredits record. This upsert ensures
//     //    every user at least has a baseline credits row.
//     const userCredits = await upsertUserCredits(userId);

//     // 3) Determine the user's tier based on their total credits
//     //    (e.g., 0–299 = Free, 300–499 = Standard, 500+ = Premium, etc.)
//     const userTier = resolveTierFromCredits(userCredits.credits);

//     // 4) Return the tier in the response
//     console.log('✅ Resolved User Tier:', userTier);
//     return NextResponse.json({ userTier }, { status: 200 });
//   } catch (error) {
//     console.error('❌ Error in GET /api/user/status:', error);
//     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
//   }
// }

// /**
//  * Upsert userCredits so the user always has a row in userCredits.
//  * Adjust the default credits if you want "brand-new" users to have
//  * a different starting amount (e.g., 0 or 200).
//  */
// async function upsertUserCredits(userId: string) {
//   try {
//     return await db.userCredits.upsert({
//       where: { userId },
//       update: {},
//       create: {
//         userId,
//         credits: 200,  // Example default
//         usedCredits: 0,
//       },
//       select: { credits: true, usedCredits: true },
//     });
//   } catch (error) {
//     console.error('❌ Error in upsertUserCredits:', error);
//     throw error;
//   }
// }

// /**
//  * Example logic for determining a tier based on total credits.
//  * - Sort your plans by credits ascending.
//  * - Pick the highest plan the user qualifies for.
//  * - If none, default to 'free'.
//  */
// function resolveTierFromCredits(userCredits: number): string {
//   // Sort plans by their "credits" requirement (lowest to highest)
//   const sortedPlans = [...pricingPlans].sort((a, b) => a.credits - b.credits);

//   let matchedPlan: Plan | undefined = undefined;
//   for (const plan of sortedPlans) {
//     if (userCredits >= plan.credits) {
//       matchedPlan = plan;
//     }
//   }

//   if (matchedPlan) {
//     // Convert, e.g. "FREE" -> "free"
//     return matchedPlan.tier.toLowerCase();
//   }

//   // If nothing matched, consider them 'free'
//   return 'free';
// }




// // app/api/user/status/route.ts

// import { NextRequest, NextResponse } from 'next/server';
// import { getAuth } from '@clerk/nextjs/server';
// import { db } from '@/lib/db';
// import { pricingPlans, Plan } from '@/config/planConfig'; // Ensure you have access to pricingPlans

// export async function GET(req: NextRequest) {
//   try {
//     const { userId } = getAuth(req);

//     if (!userId) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     // Fetch user's subscription from userSubscription instead of subscription
//     const userSubscription = await db.userSubscription.findUnique({
//       where: { userId },
//       select: { stripePriceId: true },
//     });

//     let userTier = 'free'; // Default tier

//     if (userSubscription?.stripePriceId) {
//       const plan = pricingPlans.find(
//         (plan: Plan) => plan.stripePriceId === userSubscription.stripePriceId
//       );

//       if (plan) {
//         userTier = plan.tier.toLowerCase();
//       } else {
//         console.warn('No matching SubscriptionPlan found for stripePriceId:', userSubscription.stripePriceId);
//       }
//     }

//     console.log('🔍 Resolved User Tier:', userTier);

//     return NextResponse.json({ userTier }, { status: 200 });
//   } catch (error) {
//     console.error('❌ Error fetching user status:', error);
//     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
//   }
// }


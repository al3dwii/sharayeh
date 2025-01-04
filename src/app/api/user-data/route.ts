// /src/api/user-data/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db'; // Prisma client
import { getAuth } from '@clerk/nextjs/server'; // Clerk server-side auth
import { pricingPlans, Plan } from '@/config/planConfig'; // Import plan config
import { getHighestUserTier } from '@/utils/getHighestUserTier'; // Import the utility function

export const dynamic = 'force-dynamic'; // Ensure dynamic content is fetched at runtime

// Define tier priorities for determining the highest tier
const tiersPriority: Record<string, number> = {
  super: 4,
  premium: 3,
  standard: 2,
  free: 1,
};

/**
 * Handles GET requests to fetch user data, specifically the user's current tier.
 * @param req - The incoming Next.js API request.
 * @returns Next.js API response containing the user's tier and credit information.
 */
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

    // **Use the Utility Function to Get Highest Tier**
    const userTier: 'free' | 'standard' | 'premium' = await getHighestUserTier(userId);

    // Find the Plan object for the highest tier
    const highestTierPlan = pricingPlans.find(
      (plan: Plan) => plan.tier.toLowerCase() === userTier
    );

    if (!highestTierPlan) {
      console.warn(`⚠️ Plan not found for tier: ${userTier}. Assigning Free plan.`);
      const freePlan = getFreePlan();
      return buildResponse(userCredits, freePlan.id, freePlan.tier);
    }

    // Return the response with the highest tier plan
    return buildResponse(userCredits, highestTierPlan.id, highestTierPlan.tier);
  } catch (error: any) {
    console.error('🛑 Error fetching user data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Ensures that UserCredits exist for the user using upsert.
 * If not, creates a default record with 200 credits for the Free plan.
 * @param userId - The ID of the user.
 * @returns The UserCredits record.
 */
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

/**
 * Builds the API response with user credits and subscription details.
 * @param userCredits - The user's credits and used credits.
 * @param planId - The ID of the subscription plan.
 * @param tier - The tier of the subscription plan.
 * @returns Next.js API response.
 */
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

/**
 * Retrieves the Free plan from the pricingPlans configuration.
 * Throws an error if the Free plan is not found.
 * @returns The Free Plan object.
 */
function getFreePlan(): Plan {
  const freePlan = pricingPlans.find((plan: Plan) => plan.id === 'cm4kcbd6t00007ndb3r9dydrc');
  if (!freePlan) {
    throw new Error('Free plan not found in pricingPlans');
  }
  return freePlan;
}

// // app/api/user-data/route.ts

// import { NextRequest, NextResponse } from 'next/server';
// import { db } from '@/lib/db'; // Prisma client
// import { getAuth } from '@clerk/nextjs/server'; // Clerk server-side auth
// import { pricingPlans, Plan } from '@/config/planConfig'; // Import plan config

// export const dynamic = 'force-dynamic'; // Ensure dynamic content is fetched at runtime

// // Define tier priorities for determining the highest tier
// const tiersPriority: Record<string, number> = {
//   super: 4,
//   premium: 3,
//   standard: 2,
//   free: 1,
// };

// /**
//  * Handles GET requests to fetch user data, specifically the user's current tier.
//  * @param req - The incoming Next.js API request.
//  * @returns Next.js API response containing the user's tier and credit information.
//  */
// export async function GET(req: NextRequest) {
//   try {
//     console.log('🔍 Incoming GET request to /api/user-data');

//     const { userId } = getAuth(req); // Extract userId from auth context
//     console.log('👤 Authenticated User ID:', userId);

//     if (!userId) {
//       console.log('Response: Unauthorized - Missing userId');
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     // Fetch or create UserCredits using upsert
//     const userCredits = await ensureUserCredits(userId);

//     // Fetch all UserPackages for the user, including Package relation
//     const userPackages = await db.userPackage.findMany({
//       where: { userId },
//       include: {
//         package: {
//           select: { tier: true, stripePriceId: true }, // Only select necessary fields
//         },
//       },
//     });

//     // console.log('📊 Retrieved UserPackages:', JSON.stringify(userPackages, null, 2));

//     // If there are no UserPackages, assign the Free plan
//     if (userPackages.length === 0) {
//       const freePlan = getFreePlan();
//       console.log('📊 User has no subscriptions. Assigning Free plan:', freePlan.id);
//       return buildResponse(userCredits, freePlan.id, freePlan.tier);
//     }

//     // Map each UserPackage to its corresponding Plan
//     const mappedPlans = userPackages.map((userPkg) => {
//       const plan = pricingPlans.find(
//         (p: Plan) => p.stripePriceId === userPkg.package.stripePriceId
//       );
//       if (plan) {
//         return plan;
//       } else {
//         console.warn(
//           `⚠️ No matching plan found for stripePriceId: ${userPkg.package.stripePriceId}`
//         );
//         return null;
//       }
//     }).filter(plan => plan !== null) as Plan[]; // Filter out nulls

//     console.log('📊 Mapped Plans:', JSON.stringify(mappedPlans, null, 2));

//     if (mappedPlans.length === 0) {
//       // If no matching plans are found, default to Free
//       const freePlan = getFreePlan();
//       console.log('📊 No matching plans found. Assigning Free plan:', freePlan.id);
//       return buildResponse(userCredits, freePlan.id, freePlan.tier);
//     }

//     // Determine the highest tier based on the mapped plans
//     let highestTier = 'free';
//     let highestPriority = 1;

//     mappedPlans.forEach((plan) => {
//       const currentTier = plan.tier.toLowerCase();
//       const priority = tiersPriority[currentTier] || 1;
//       if (priority > highestPriority) {
//         highestPriority = priority;
//         highestTier = currentTier;
//       }
//     });

//     console.log('🟢 Resolved User Tier:', highestTier);

//     // Find the Plan object for the highest tier
//     const highestTierPlan = mappedPlans.find(
//       (plan) => plan.tier.toLowerCase() === highestTier
//     );

//     if (!highestTierPlan) {
//       console.warn(`⚠️ Highest tier plan not found for tier: ${highestTier}`);
//       const freePlan = getFreePlan();
//       return buildResponse(userCredits, freePlan.id, freePlan.tier);
//     }

//     // Return the response with the highest tier plan
//     return buildResponse(userCredits, highestTierPlan.id, highestTierPlan.tier);
//   } catch (error: any) {
//     console.error('🛑 Error fetching user data:', error);
//     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
//   }
// }

// /**
//  * Ensures that UserCredits exist for the user using upsert.
//  * If not, creates a default record with 200 credits for the Free plan.
//  * @param userId - The ID of the user.
//  * @returns The UserCredits record.
//  */
// async function ensureUserCredits(userId: string) {
//   try {
//     console.log('📊 Ensuring UserCredits for userId:', userId);

//     const userCredits = await db.userCredits.upsert({
//       where: { userId }, // Unique identifier to check existing record
//       update: {}, // No fields to update if the record exists
//       create: {
//         userId,
//         credits: 200, // Default credits for Free plan
//         usedCredits: 0,
//       },
//       select: { credits: true, usedCredits: true }, // Select only necessary fields
//     });

//     console.log('📊 Retrieved or Created UserCredits:', userCredits);
//     return userCredits;
//   } catch (error: any) {
//     console.error('🛑 Error in ensureUserCredits:', error);
//     throw error; // Re-throw the error after logging
//   }
// }

// /**
//  * Builds the API response with user credits and subscription details.
//  * @param userCredits - The user's credits and used credits.
//  * @param planId - The ID of the subscription plan.
//  * @param tier - The tier of the subscription plan.
//  * @returns Next.js API response.
//  */
// function buildResponse(
//   userCredits: { credits: number; usedCredits: number },
//   planId: string,
//   tier: string
// ) {
//   return NextResponse.json(
//     {
//       credits: userCredits.credits,
//       usedCredits: userCredits.usedCredits,
//       planId,
//       tier,
//     },
//     { status: 200 }
//   );
// }

// /**
//  * Retrieves the Free plan from the pricingPlans configuration.
//  * Throws an error if the Free plan is not found.
//  * @returns The Free Plan object.
//  */
// function getFreePlan(): Plan {
//   const freePlan = pricingPlans.find((plan: Plan) => plan.id === 'cm4kcbd6t00007ndb3r9dydrc');
//   if (!freePlan) {
//     throw new Error('Free plan not found in pricingPlans');
//   }
//   return freePlan;
// }




// // app/api/user-data/route.ts

// import { NextRequest, NextResponse } from 'next/server';
// import { db } from '@/lib/db'; // Prisma client
// import { getAuth } from '@clerk/nextjs/server'; // Clerk server-side auth
// import { pricingPlans, Plan } from '@/config/planConfig'; // Import plan config

// export const dynamic = 'force-dynamic'; // Ensure dynamic content is fetched at runtime

// // Handle GET requests to /api/user-data
// export async function GET(req: NextRequest) {
//   try {
//     console.log('🔍 Incoming GET request to /api/user-data');

//     const { userId } = getAuth(req); // Extract userId from auth context
//     console.log('👤 Authenticated User ID:', userId);

//     if (!userId) {
//       console.log('Response: Unauthorized - Missing userId');
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     // Fetch or create UserCredits using upsert
//     const userCredits = await ensureUserCredits(userId);

//     // Check for UserPackage, including Package relation
//     const userPackage = await db.userPackage.findFirst({
//       where: { userId },
//       include: {
//         package: true, // include the related Package
//       },
//     });

//     // If there's a purchased package, attempt to map it to the config
//     if (userPackage?.stripeCustomerId && userPackage.package) {
//       console.log('📊 Retrieved UserPackage:', userPackage);

//       const plan = pricingPlans.find(
//         (p: Plan) => p.stripePriceId === userPackage.package.stripePriceId
//       );

//       if (plan) {
//         console.log('📊 Mapped UserPackage to SubscriptionPlan:', plan);
//         return buildResponse(userCredits, plan.id, plan.tier);
//       }

//       console.log(
//         '📊 No matching SubscriptionPlan found for stripePriceId:',
//         userPackage.package.stripePriceId
//       );
//     }

//     // Default to Free plan if no active subscription
//     const freePlan = getFreePlan();
//     console.log('📊 User has no subscription. Assigning Free plan:', freePlan.id);
//     return buildResponse(userCredits, freePlan.id, freePlan.tier);
//   } catch (error: any) {
//     console.error('🛑 Error fetching user data:', error);
//     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
//   }
// }

// // Helper to ensure UserCredits exist for the user using upsert
// async function ensureUserCredits(userId: string) {
//   try {
//     console.log('📊 Ensuring UserCredits for userId:', userId);

//     const userCredits = await db.userCredits.upsert({
//       where: { userId }, // Unique identifier to check existing record
//       update: {}, // No fields to update if the record exists
//       create: {
//         userId,
//         credits: 200, // Default credits for Free plan
//         usedCredits: 0,
//       },
//       select: { credits: true, usedCredits: true }, // Select only necessary fields
//     });

//     console.log('📊 Retrieved or Created UserCredits:', userCredits);
//     return userCredits;
//   } catch (error: any) {
//     console.error('🛑 Error in ensureUserCredits:', error);
//     throw error; // Re-throw the error after logging
//   }
// }

// // Helper function to build API response
// function buildResponse(
//   userCredits: { credits: number; usedCredits: number },
//   planId: string,
//   tier: string
// ) {
//   return NextResponse.json(
//     {
//       credits: userCredits.credits,
//       usedCredits: userCredits.usedCredits,
//       planId,
//       tier,
//     },
//     { status: 200 }
//   );
// }

// // Helper function to get Free plan
// function getFreePlan(): Plan {
//   const freePlan = pricingPlans.find((plan: Plan) => plan.id === 'cm4kcbd6t00007ndb3r9dydrc');
//   if (!freePlan) {
//     throw new Error('Free plan not found in pricingPlans');
//   }
//   return freePlan;
// }

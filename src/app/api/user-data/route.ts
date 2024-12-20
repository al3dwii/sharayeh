import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db'; // Prisma client
import { getAuth } from '@clerk/nextjs/server'; // Clerk server-side auth
import { pricingPlans, Plan } from '@/config/planConfig'; // Import plan config

export const dynamic = 'force-dynamic'; // Ensure dynamic content is fetched at runtime

// Handle GET requests to /api/user-data
export async function GET(req: NextRequest) {
  try {
    console.log('🔍 Incoming GET request to /api/user-data');

    const { userId } = getAuth(req); // Extract userId from auth context
    console.log('👤 Authenticated User ID:', userId);

    if (!userId) {
      console.log("Response: Unauthorized - Missing userId");
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch or create UserCredits
    const userCredits = await ensureUserCredits(userId);

    // Check for Subscription
    const subscription = await db.subscription.findUnique({
      where: { userId },
      select: {
        planId: true,
        plan: {
          select: {
            tier: true,
          },
        },
      },
    });

    if (subscription?.planId && subscription.plan?.tier) {
      console.log('📊 Retrieved Subscription:', subscription);
      return buildResponse(userCredits, subscription.planId, subscription.plan.tier);
    }

    // Check for UserSubscription
    const userSubscription = await db.userSubscription.findUnique({
      where: { userId },
      select: { stripePriceId: true },
    });

    if (userSubscription?.stripePriceId) {
      console.log('📊 Retrieved UserSubscription:', userSubscription);

      const plan = pricingPlans.find(
        (plan: Plan) => plan.stripePriceId === userSubscription.stripePriceId
      );

      if (plan) {
        console.log('📊 Mapped UserSubscription to SubscriptionPlan:', plan);
        return buildResponse(userCredits, plan.id, plan.tier);
      }

      console.log('📊 No matching SubscriptionPlan found for stripePriceId:', userSubscription.stripePriceId);
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

// Helper to ensure UserCredits exist for the user
async function ensureUserCredits(userId: string) {
  let userCredits = await db.userCredits.findUnique({
    where: { userId },
    select: { credits: true, usedCredits: true },
  });

  if (!userCredits) {
    console.log('📊 UserCredits not found. Creating default UserCredits.');
    userCredits = await db.userCredits.create({
      data: {
        userId,
        credits: 200, // Default credits for Free plan
        usedCredits: 0,
      },
      select: { credits: true, usedCredits: true },
    });
    console.log('📊 Created UserCredits:', userCredits);
  }

  return userCredits;
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


// // src/app/api/user-data/route.ts

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
//       console.log("Response: Unauthorized - Missing userId");
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     // Fetch UserCredits
//     const userCredits = await db.userCredits.findUnique({
//       where: { userId },
//       select: {
//         credits: true,
//         usedCredits: true,
//       },
//     });

//     if (!userCredits) {
//       // If UserCredits doesn't exist, create it with default values
//       console.log('📊 UserCredits not found. Creating default UserCredits.');
//       const createdUserCredits = await db.userCredits.create({
//         data: {
//           userId,
//           credits: 200, // Default credits for Free plan
//           usedCredits: 0, // Default usedCredits
//         },
//         select: {
//           credits: true,
//           usedCredits: true,
//         },
//       });
//       console.log('📊 Created UserCredits:', createdUserCredits);
//       return NextResponse.json({
//         credits: createdUserCredits.credits,
//         usedCredits: createdUserCredits.usedCredits,
//         planId: getFreePlanId(),
//       }, { status: 200 });
//     }

//     // Fetch Subscription
//     const subscription = await db.subscription.findUnique({
//       where: { userId },
//       select: {
//         planId: true,
//       },
//     });

//     if (subscription && subscription.planId) {
//       console.log('📊 Retrieved Subscription:', subscription);
//       return NextResponse.json({
//         credits: userCredits.credits,
//         usedCredits: userCredits.usedCredits,
//         planId: subscription.planId,
//       }, { status: 200 });
//     } else {
//       // If Subscription is not found, check UserSubscription
//       const userSubscription = await db.userSubscription.findUnique({
//         where: { userId },
//         select: {
//           stripePriceId: true,
//         },
//       });

//       if (userSubscription && userSubscription.stripePriceId) {
//         console.log('📊 Retrieved UserSubscription:', userSubscription);
//         // Find the planId based on stripePriceId
//         const plan = pricingPlans.find((plan: Plan) => plan.stripePriceId === userSubscription.stripePriceId);
//         if (plan) {
//           // console.log('📊 Mapped UserSubscription to SubscriptionPlan:', plan);
//           return NextResponse.json({
//             credits: userCredits.credits,
//             usedCredits: userCredits.usedCredits,
//             planId: plan.id,
//           }, { status: 200 });
//         } else {
//           console.log('📊 No matching SubscriptionPlan found for stripePriceId:', userSubscription.stripePriceId);
//           // Assign Free plan if no matching plan is found
//           return NextResponse.json({
//             credits: userCredits.credits,
//             usedCredits: userCredits.usedCredits,
//             planId: getFreePlanId(),
//           }, { status: 200 });
//         }
//       }

//       // User has no active subscription; assign Free plan
//       const freePlanId = getFreePlanId();
//       console.log('📊 User has no subscription. Assigning Free plan:', freePlanId);
//       return NextResponse.json({
//         credits: userCredits.credits,
//         usedCredits: userCredits.usedCredits,
//         planId: freePlanId,
//       }, { status: 200 });
//     }

//   } catch (error: any) {
//     console.error('🛑 Error fetching user data:', error);
//     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
//   }
// }

// // Helper function to get Free plan ID
// function getFreePlanId(): string {
//   const freePlan = pricingPlans.find((plan: Plan) => plan.id === 'cm4kcbd6t00007ndb3r9dydrc');
//   if (!freePlan) {
//     throw new Error('Free plan not found in pricingPlans');
//   }
//   return freePlan.id;
// }



// // src/app/api/user-data/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { db } from '@/lib/db'; // Prisma client
// import { getAuth } from '@clerk/nextjs/server'; // Clerk server-side auth

// export const dynamic = 'force-dynamic'; // Ensure dynamic content is fetched at runtime

// // Handle GET requests to /api/user-data
// export async function GET(req: NextRequest) {
//   try {
//     console.log('🔍 Incoming GET request to /api/user-data');

//     const { userId } = getAuth(req); // Extract userId from auth context
//     console.log('👤 Authenticated User ID:', userId);

//     if (!userId) {
//       console.log("Response: Unauthorized - Missing userId");
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     // Use upsert to fetch or create the userCredits record
//     const userCredits = await db.userCredits.upsert({
//       where: { userId },
//       update: {}, // No fields to update; just fetch the existing record
//       create: {
//         userId,
//         credits: 10, // Default credits
//         usedCredits: 0, // Default usedCredits
//       },
//       select: {
//         credits: true,
//         usedCredits: true,
//       },
//     });

//     console.log('📊 Retrieved User Credits:', userCredits);

//     // Return the user credits data
//     return NextResponse.json({ 
//       credits: userCredits.credits, 
//       usedCredits: userCredits.usedCredits 
//     }, { status: 200 });
    
//   } catch (error) {
//     console.error('🛑 Error fetching user data:', error);
//     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
//   }
// }


// // src/app/api/user-data/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { db } from '@/lib/db'; // Prisma client
// import { getAuth } from '@clerk/nextjs/server'; // Clerk server-side auth

// export const dynamic = 'force-dynamic'; // Ensure dynamic content is fetched at runtime

// // Handle GET requests to /api/user-data
// export async function GET(req: NextRequest) {
//   try {
//     const { userId } = getAuth(req); // Extract userId from auth context

//     if (!userId) {
//       console.log("Response: Unauthorized - Missing userId");
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     // Fetch the credits and usedCredits for the user from the UserCredits table
//     let userCredits = await db.userCredits.findUnique({
//       where: {
//         userId,
//       },
//       select: {
//         credits: true,
//         usedCredits: true,
//       },
//     });

//         // If the userCredits record doesn't exist, create one with default values
//     if (!userCredits) {
//       userCredits = await db.userCredits.create({
//         data: {
//           userId,
//           credits: 10,
//           usedCredits: 0,
//         },
//         select: {
//           credits: true,
//           usedCredits: true,
//         },
//       });
//     }

//     // Return the user credits data
//     return NextResponse.json({ 
//       credits: userCredits.credits, 
//       usedCredits: userCredits.usedCredits 
//     }, { status: 200 });
    
//   } catch (error) {
//     console.error('Error fetching user data:', error);
//     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
//   }
// }





// // src/app/api/user-data/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { db } from '@/lib/db'; // Prisma client
// import { getAuth } from '@clerk/nextjs/server'; // Clerk server-side auth

// export const dynamic = 'force-dynamic'; // Ensure dynamic content is fetched at runtime

// // Handle GET requests to /api/user-data
// export async function GET(req: NextRequest) {
//   try {
//     const { userId } = getAuth(req); // Extract userId from auth context

//     if (!userId) {
//       console.log("Response: Unauthorized - Missing userId");
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     // Fetch the credits and usedCredits for the user from the UserCredits table
//     let userCredits = await db.userCredits.findUnique({
//       where: {
//         userId,
//       },
//       select: {
//         credits: true,
//         usedCredits: true,
//       },
//     });

//     // If the userCredits record doesn't exist, create one with default values
//     if (!userCredits) {
//       userCredits = await db.userCredits.create({
//         data: {
//           userId,
//           credits: 20,
//           usedCredits: 0,
//         },
//         select: {
//           credits: true,
//           usedCredits: true,
//         },
//       });
//     }

//     // Return the user credits data
//     return NextResponse.json({ 
//       credits: userCredits.credits, 
//       usedCredits: userCredits.usedCredits 
//     }, { status: 200 });
    
//   } catch (error) {
//     console.error('Error fetching user data:', error);
//     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
//   }
// }




// // // /Users/omair/arocr/apps/nextjs/src/app/api/user-data/route.ts

// import { NextRequest, NextResponse } from 'next/server';
// import { db } from '@/lib/db'; // Prisma client

// export const dynamic = 'force-dynamic'; // Ensure dynamic content is fetched at runtime

// // Handle GET requests to /api/user-data
// export async function GET(req: NextRequest) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const userId = searchParams.get('userId');

//     if (!userId) {
//       console.log("Response: Missing userId");
//       return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
//     }

//     // Fetch the credits and usedCredits for the user from the UserCredits table
//     let userCredits = await db.userCredits.findUnique({
//       where: {
//         userId,
//       },
//       select: {
//         credits: true,
//         usedCredits: true,
//       },
//     });

//     // If the userCredits record doesn't exist, create one with default values
//     if (!userCredits) {
//       userCredits = await db.userCredits.create({
//         data: {
//           userId,
//           credits: 200,
//           usedCredits: 0,
//         },
//         select: {
//           credits: true,
//           usedCredits: true,
//         },
//       });
//     }

//     // Return the user credits data
//     return NextResponse.json({ 
//       credits: userCredits.credits, 
//       usedCredits: userCredits.usedCredits 
//     }, { status: 200 });
    
//   } catch (error) {
//     console.error('Error fetching user data:', error);
//     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
//   }
// }


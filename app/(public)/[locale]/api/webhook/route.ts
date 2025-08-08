// src/app/api/webhook/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/db'; // Prisma client instance
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

export const runtime = 'nodejs'; // Important for Stripe


// Define supported Stripe events
const supportedEvents = new Set(['checkout.session.completed']);

/**
 * Main handler for incoming webhook POST requests from Stripe.
 * @param request - The incoming Next.js API request.
 * @returns Next.js API response.
 */
export async function POST(request: NextRequest) {
  // Retrieve the Stripe signature from the headers
  const sig = headers().get('stripe-signature');

  // Read the raw request body as a Buffer
  const buf = await request.arrayBuffer();
  const body = Buffer.from(buf);

  let event: Stripe.Event;

  try {
    // Ensure both signature and webhook secret are present
    if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
      throw new Error('Missing Stripe signature or webhook secret.');
    }

    // Verify the event by constructing it with the Stripe library
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: unknown) {
    // Handle signature verification errors
    if (err instanceof Error) {
      console.error('Webhook signature verification failed:', err.message);
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    } else {
      console.error('Webhook signature verification failed:', err);
      return new Response('Webhook Error: Invalid signature.', { status: 400 });
    }
  }

  // Implement idempotency by checking if the event has already been processed
  const eventId = event.id;
  const existingEvent = await db.stripeEvent.findUnique({
    where: { id: eventId },
  });

  if (existingEvent) {
    console.log(`Duplicate event received: ${eventId}`);
    return NextResponse.json({ received: true });
  }

  try {
    // Handle only supported events
    if (!supportedEvents.has(event.type)) {
      console.log(`Unhandled event type ${event.type}`);

    const rawObject = event.data.object;

// 1. Round‑trip through JSON to strip any `undefined` and ensure no top‑level null
    const payload = JSON.parse(JSON.stringify(rawObject)) as Prisma.InputJsonValue;


      // Optionally, store unhandled events to prevent reprocessing
      await db.stripeEvent.create({
        data: {
          id: event.id,
          type: event.type,
          data: payload,
        },
      });

      return NextResponse.json({ received: true });
    }

    // Process the supported event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log(`Received checkout.session.completed for packageId: ${session.metadata?.packageId}`);
      await handleCheckoutSessionCompleted(session);
    }

        // Immediately after you verify/parse the Stripe event:
    const rawObject = event.data.object;

    // 1. Round‑trip through JSON to strip any `undefined` and ensure no top‑level null
    const payload = JSON.parse(JSON.stringify(rawObject)) as Prisma.InputJsonValue;


    // Store the event to ensure idempotency
    await db.stripeEvent.create({
      data: {
        id: event.id,
        type: event.type,
        data: payload,
      },
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook Handling Error:', error);
    return NextResponse.json({ error: 'Webhook Handler Error' }, { status: 500 });
  }
}

/**
 * Handles the 'checkout.session.completed' event from Stripe.
 * Creates a UserPackage record and updates the user's tier based on all their packages.
 * @param session - The Stripe Checkout Session object.
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const packageId = session.metadata?.packageId;
  const customerId = session.customer as string | undefined; // Extract Customer ID

  console.log(`Handling checkout.session.completed for userId: ${userId}, packageId: ${packageId}`);

  // Validate presence of necessary metadata
  if (!userId || !packageId || !customerId) {
    console.error('Missing metadata (userId, packageId, or customerId) in session.');
    return;
  }

  // 1) Create a new UserPackage record for this purchase
  try {
    await db.userPackage.create({
      data: {
        userId,
        packageId,
        stripeCustomerId: customerId, // Associate with Stripe customer
        acquiredAt: new Date(),
        expiresAt: null, // No expiration for one-time purchases; modify if packages have expiry
      },
    });
    console.log(`UserPackage created for userId: ${userId}, packageId: ${packageId}`);
  } catch (error) {
    console.error('Error creating UserPackage:', error);
    throw error; // Re-throw to handle idempotency storage
  }

  // 2) Fetch all UserPackages for the user to determine the highest tier
  const userPackages = await db.userPackage.findMany({
    where: { userId },
    include: { package: { select: { tier: true } } },
  });

  // Define tier priorities
  const tiersPriority: Record<string, number> = {
    super: 4,
    premium: 3,
    standard: 2,
    free: 1,
  };

  let userTier: string = 'free'; // Default tier
  let highestPriority = 1;

  // Determine the highest tier based on existing packages
  userPackages.forEach(pkg => {
    const currentTier = pkg.package.tier.toLowerCase();
    const priority = tiersPriority[currentTier] || 1;
    if (priority > highestPriority) {
      highestPriority = priority;
      userTier = currentTier;
    }
  });

  console.log('🟢 User Tier:', userTier);

  // 3) Update user credits based on the purchased package
  try {
    const purchasedPackage = await db.package.findUnique({
      where: { id: packageId },
    });

    if (purchasedPackage) {
      // Fetch or create UserCredits record
      const userCredits = await db.userCredits.upsert({
        where: { userId },
        update: {
          credits: {
            increment: purchasedPackage.credits,
          },
        },
        create: {
          userId,
          credits: purchasedPackage.credits,
          usedCredits: 0,
        },
      });

      console.log(`UserCredits updated:`, userCredits);
    } else {
      console.warn(`Purchased package not found: packageId ${packageId}`);
    }
  } catch (error) {
    console.error('❌ Error updating UserCredits:', error);
    // Handle the error as needed
  }

  // 4) (Optional) Log the credit addition as a transaction
  try {
    const purchasedPackage = await db.package.findUnique({
      where: { id: packageId },
    });

    if (purchasedPackage) {
      await db.creditTransaction.create({
        data: {
          userId,
          type: 'ADDITION',
          amount: purchasedPackage.credits,
          description: `Credits added for one-time purchase of ${purchasedPackage.name}.`,
        },
      });
      console.log(`Credit transaction logged for userId: ${userId}, amount: ${purchasedPackage.credits}`);
    }
  } catch (error) {
    console.error('❌ Error creating credit transaction:', error);
    // Handle the error as needed
  }

  console.log(`✅ One-time purchase completed for user: ${userId}, package: ${packageId}.`);
}




// // app/api/webhook/route.ts

// import { NextRequest, NextResponse } from 'next/server';
// import { stripe } from '@/lib/stripe';
// import { db } from '@/lib/db'; // Prisma client instance
// import Stripe from 'stripe';
// import { headers } from 'next/headers';
// import { Prisma } from '@prisma/client';
// import { getAuth } from '@clerk/nextjs/server';
// import axios from 'axios';

// export const dynamic = 'force-dynamic';


// // Define a union type for user tiers
// type Tier = 'free' | 'standard' | 'premium' | 'super';

// // Supported Stripe events that this webhook will handle
// const supportedEvents = new Set(['checkout.session.completed']);

// /**
//  * Main handler for incoming webhook POST requests from Stripe.
//  * @param request - The incoming Next.js API request.
//  * @returns Next.js API response.
//  */
// export async function POST(request: NextRequest) {
//   // Retrieve the Stripe signature from the headers
//   const sig = headers().get('stripe-signature');
  
//   // Read the raw request body as a Buffer
//   const buf = await request.arrayBuffer();
//   const body = Buffer.from(buf);
  
//   let event: Stripe.Event;

//   try {
//     // Ensure both signature and webhook secret are present
//     if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
//       throw new Error('Missing Stripe signature or webhook secret.');
//     }

//     // Verify the event by constructing it with the Stripe library
//     event = stripe.webhooks.constructEvent(
//       body,
//       sig,
//       process.env.STRIPE_WEBHOOK_SECRET
//     );
//   } catch (err: unknown) {
//     // Handle signature verification errors
//     if (err instanceof Error) {
//       console.error('Webhook signature verification failed:', err.message);
//       return new Response(`Webhook Error: ${err.message}`, { status: 400 });
//     } else {
//       console.error('Webhook signature verification failed:', err);
//       return new Response('Webhook Error: Invalid signature.', { status: 400 });
//     }
//   }

//   // Implement idempotency by checking if the event has already been processed
//   const eventId = event.id;
//   const existingEvent = await db.stripeEvent.findUnique({
//     where: { id: eventId },
//   });

//   if (existingEvent) {
//     console.log(`Duplicate event received: ${eventId}`);
//     return NextResponse.json({ received: true });
//   }

//   try {
//     // Handle only supported events
//     if (!supportedEvents.has(event.type)) {
//       console.log(`Unhandled event type ${event.type}`);

//       // Optionally, store unhandled events to prevent reprocessing
//       await db.stripeEvent.create({
//         data: {
//           id: event.id,
//           type: event.type,
//           data: event.data.object as Prisma.JsonValue,
//         },
//       });

//       return NextResponse.json({ received: true });
//     }

//     // Process the supported event
//     if (event.type === 'checkout.session.completed') {
//       const session = event.data.object as Stripe.Checkout.Session;
//       console.log(`Received checkout.session.completed for packageId: ${session.metadata?.packageId}`);
//       await handleCheckoutSessionCompleted(session);
//     }

//     // Store the event to ensure idempotency
//     await db.stripeEvent.create({
//       data: {
//         id: event.id,
//         type: event.type,
//         data: event.data.object as Prisma.JsonValue,
//       },
//     });

//     return NextResponse.json({ received: true });
//   } catch (error) {
//     console.error('Webhook Handling Error:', error);
//     return NextResponse.json({ error: 'Webhook Handler Error' }, { status: 500 });
//   }
// }

// /**
//  * Handles the 'checkout.session.completed' event from Stripe.
//  * Creates a UserPackage record and updates the user's tier based on all their packages.
//  * @param session - The Stripe Checkout Session object.
//  */
// async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
//   const userId = session.metadata?.userId;
//   const packageId = session.metadata?.packageId;
//   const customerId = session.customer as string | undefined; // Extract Customer ID

//   console.log(`Handling checkout.session.completed for userId: ${userId}, packageId: ${packageId}`);

//   // Validate presence of necessary metadata
//   if (!userId || !packageId || !customerId) {
//     console.error('Missing metadata (userId, packageId, or customerId) in session.');
//     return;
//   }

//   // 1) Create a new UserPackage record for this purchase
//   try {
//     await db.userPackage.create({
//       data: {
//         userId,
//         packageId,
//         stripeCustomerId: customerId, // Associate with Stripe customer
//         acquiredAt: new Date(),
//         expiresAt: null, // No expiration for one-time purchases; modify if packages have expiry
//       },
//     });
//     console.log(`UserPackage created for userId: ${userId}, packageId: ${packageId}`);
//   } catch (error) {
//     console.error('Error creating UserPackage:', error);
//     throw error; // Re-throw to handle idempotency storage
//   }

//   // 2) Fetch all UserPackages for the user to determine the highest tier
//   const userPackages = await db.userPackage.findMany({
//     where: { userId },
//     include: { package: { select: { stripePriceId: true, tier: true } } },
//   });

//   // Define tier priorities
//   const tiersPriority: Record<Tier, number> = {
//     super: 4,
//     premium: 3,
//     standard: 2,
//     free: 1,
//   };

//   let userTier: Tier = 'free'; // Default tier

//   // Determine the highest tier based on existing packages
//   userPackages.forEach(pkg => {
//     const currentTier = pkg.package.tier.toLowerCase() as Tier;
//     if (tiersPriority[currentTier] > tiersPriority[userTier]) {
//       userTier = currentTier;
//     }
//   });

//   console.log('🟢 User Tier:', userTier);


//   // 4) (Optional) Update user credits or other related data if needed
//   // Example: Increment user credits based on the purchased package
//   try {
//     const purchasedPackage = await db.package.findUnique({
//       where: { id: packageId },
//     });

//     if (purchasedPackage) {
//       // Fetch or create UserCredits record
//       const userCredits = await db.userCredits.upsert({
//         where: { userId },
//         update: {
//           credits: {
//             increment: purchasedPackage.credits,
//           },
//         },
//         create: {
//           userId,
//           credits: purchasedPackage.credits,
//           usedCredits: 0,
//         },
//       });

//       console.log(`UserCredits updated:`, userCredits);
//     } else {
//       console.warn(`Purchased package not found: packageId ${packageId}`);
//     }
//   } catch (error) {
//     console.error('❌ Error updating UserCredits:', error);
//     // Handle the error as needed
//   }

//   // 5) (Optional) Log the credit addition as a transaction
//   try {
//     const purchasedPackage = await db.package.findUnique({
//       where: { id: packageId },
//     });

//     if (purchasedPackage) {
//       await db.creditTransaction.create({
//         data: {
//           userId,
//           type: 'ADDITION',
//           amount: purchasedPackage.credits,
//           description: `Credits added for one-time purchase of ${purchasedPackage.name}.`,
//         },
//       });
//       console.log(`Credit transaction logged for userId: ${userId}, amount: ${purchasedPackage.credits}`);
//     }
//   } catch (error) {
//     console.error('❌ Error creating credit transaction:', error);
//     // Handle the error as needed
//   }

//   console.log(`✅ One-time purchase completed for user: ${userId}, package: ${packageId}.`);
// }


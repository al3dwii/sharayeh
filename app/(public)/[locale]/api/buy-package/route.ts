// src/app/api/buy-package/route.ts

// src/app/api/buy-package/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAuth, clerkClient } from '@clerk/nextjs/server';
import { stripe } from '@/lib/stripe';
import { absoluteUrl } from '@/lib/utils';
import { db } from '@/lib/db';
import { z } from 'zod';
import { stripePriceIds } from '@/utils/planConfig';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const createPackageSchema = z.object({
  packageId: z.string(),
});

export async function POST(request: NextRequest) {
  /* -------------------------------------------------- */
  /* 1. Auth                                             */
  /* -------------------------------------------------- */
  const { userId } = getAuth(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  /* Initialise Clerk backend SDK once */
  const clerk = await clerkClient();                 // ← NEW

  try {
    /* ------------------------------------------------ */
    /* 2. Validate body                                 */
    /* ------------------------------------------------ */
    const { packageId } = createPackageSchema.parse(await request.json());

    const stripePriceId = stripePriceIds[packageId];
    if (!stripePriceId) {
      return NextResponse.json({ error: 'Invalid packageId' }, { status: 400 });
    }

    /* ------------------------------------------------ */
    /* 3. Retrieve or create Stripe customer            */
    /* ------------------------------------------------ */
    let stripeCustomerId: string | undefined;

    const existingUserPackages = await db.userPackage.findMany({ where: { userId } });
    if (existingUserPackages.length > 0) {
      stripeCustomerId = existingUserPackages[0].stripeCustomerId;
    }

    if (!stripeCustomerId) {
      // Get user email from Clerk
      const user = await clerk.users.getUser(userId);       // ← use clerk instance
      const emailAddress =
        user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress;

      if (!emailAddress) {
        return NextResponse.json({ error: 'Email is missing' }, { status: 400 });
      }

      const customer = await stripe.customers.create({
        metadata: { userId },
        email: emailAddress,
      });
      stripeCustomerId = customer.id;
    }

    /* ------------------------------------------------ */
    /* 4. Create checkout session                       */
    /* ------------------------------------------------ */
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: stripePriceId, quantity: 1 }],
      mode: 'payment',
      success_url: `${absoluteUrl('/dashboard')}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${absoluteUrl('/pricing')}`,
      customer: stripeCustomerId,
      metadata: { userId, packageId },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Create Package Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}


// import { NextRequest, NextResponse } from 'next/server';
// import { getAuth, clerkClient } from '@clerk/nextjs/server';
// import { stripe } from '@/lib/stripe'; // Ensure this imports the correctly initialized Stripe client
// import { absoluteUrl } from '@/lib/utils';
// import { db } from '@/lib/db';
// import { z } from 'zod';
// import { stripePriceIds } from '@/config/planConfig'; // Ensure this is correctly mapped

// export const runtime = 'nodejs'; // Ensure Node.js runtime

// // Define schema for request body
// const createPackageSchema = z.object({
//   packageId: z.string(),
// });

// export const dynamic = 'force-dynamic';

// export async function POST(request: NextRequest) {
//   const { userId } = getAuth(request);

//   if (!userId) {
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//   }

//   try {
//     const body = await request.json();
//     const { packageId } = createPackageSchema.parse(body);

//     // 1. Map packageId to Stripe Price ID using environment variables
//     const stripePriceId = stripePriceIds[packageId];

//     if (!stripePriceId) {
//       return NextResponse.json({ error: 'Invalid packageId' }, { status: 400 });
//     }

//     // 2. Retrieve or create a Stripe customer
//     let stripeCustomerId: string | undefined;

//     // Attempt to find an existing UserPackage with the userId
//     const existingUserPackages = await db.userPackage.findMany({
//       where: { userId },
//     });

//     if (existingUserPackages.length > 0) {
//       // If user already has a Stripe customer ID, use the first one
//       stripeCustomerId = existingUserPackages[0].stripeCustomerId;
//       console.log(`Existing Stripe Customer ID: ${stripeCustomerId}`);
//     }

//     if (!stripeCustomerId) {
//       // Fetch user’s email from Clerk
//       const user = await clerkClient.users.getUser(userId);
//       const emailAddress = user.emailAddresses.find(
//         (email) => email.id === user.primaryEmailAddressId
//       )?.emailAddress;

//       if (!emailAddress) {
//         return NextResponse.json({ error: 'Email is missing' }, { status: 400 });
//       }

//       // Create a new Stripe customer
//       const customer = await stripe.customers.create({
//         metadata: { userId },
//         email: emailAddress,
//       });
//       stripeCustomerId = customer.id;
//       console.log(`Created new Stripe Customer ID: ${stripeCustomerId}`);
//     }

//     // 3. Create Stripe Checkout Session for one-time payment
//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ['card'],
//       line_items: [
//         {
//           price: stripePriceId, // Use the Stripe Price ID from environment variables
//           quantity: 1,
//         },
//       ],
//       mode: 'payment', // Ensure it's 'payment' for one-time purchases
//       success_url: `${absoluteUrl('/dashboard')}?session_id={CHECKOUT_SESSION_ID}`,
//       cancel_url: `${absoluteUrl('/pricing')}`, // Redirect to pricing or desired page on cancellation
//       customer: stripeCustomerId, // Associate the session with the Stripe customer
//       metadata: {
//         userId,
//         packageId,
//       },
//     });

//     console.log(`Created Checkout Session: ${session.id} for packageId: ${packageId}`);

//     // 4. Optionally, create a UserPackage entry here or handle it via webhooks after payment confirmation

//     return NextResponse.json({ url: session.url });
//   } catch (error: any) {
//     console.error('Create Package Error:', error);
//     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
//   }
// }



// // app/api/buy-package/route.ts

// import { NextRequest, NextResponse } from 'next/server';
// import { getAuth, clerkClient } from '@clerk/nextjs/server';
// import { stripe } from '@/lib/stripe';
// import { absoluteUrl } from '@/lib/utils';
// import { db } from '@/lib/db';
// import { z } from 'zod';

// export const runtime = 'nodejs'; // Ensure Node.js runtime

// // Define schema for request body
// const createPackageSchema = z.object({
//   packageId: z.string(),
// });

// export const dynamic = 'force-dynamic';

// export async function POST(request: NextRequest) {
//   const { userId } = getAuth(request);

//   if (!userId) {
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//   }

//   try {
//     const body = await request.json();
//     const { packageId } = createPackageSchema.parse(body);

//     // 1. Fetch the selected package from your Package model
//     const selectedPackage = await db.package.findUnique({
//       where: { id: packageId },
//     });

//     console.log(`Selected Package: ${JSON.stringify(selectedPackage)}`);

//     if (!selectedPackage) {
//       return NextResponse.json({ error: 'Package not found' }, { status: 404 });
//     }

//     if (!selectedPackage.stripePriceId) {
//       return NextResponse.json(
//         { error: 'Stripe Price ID is missing for this package' },
//         { status: 500 }
//       );
//     }

//     // 2. Retrieve or create a Stripe customer
//     let stripeCustomerId: string | undefined;

//     // Attempt to find an existing UserPackage with the userId
//     const existingUserPackages = await db.userPackage.findMany({
//       where: { userId },
//     });

//     if (existingUserPackages.length > 0) {
//       // If user already has a Stripe customer ID, use the first one
//       stripeCustomerId = existingUserPackages[0].stripeCustomerId;
//       console.log(`Existing Stripe Customer ID: ${stripeCustomerId}`);
//     }

//     if (!stripeCustomerId) {
//       // Fetch user’s email from Clerk
//       const user = await clerkClient.users.getUser(userId);
//       const emailAddress = user.emailAddresses.find(
//         (email) => email.id === user.primaryEmailAddressId
//       )?.emailAddress;

//       if (!emailAddress) {
//         return NextResponse.json({ error: 'Email is missing' }, { status: 400 });
//       }

//       // Create a new Stripe customer
//       const customer = await stripe.customers.create({
//         metadata: { userId },
//         email: emailAddress,
//       });
//       stripeCustomerId = customer.id;
//       console.log(`Created new Stripe Customer ID: ${stripeCustomerId}`);
//     }

//     // 3. Create Stripe Checkout Session for one-time payment
//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ['card'],
//       line_items: [
//         {
//           price: selectedPackage.stripePriceId, // Use predefined Stripe Price ID
//           quantity: 1,
//         },
//       ],
//       mode: 'payment', // Ensure it's 'payment' for one-time purchases
//       success_url: `${absoluteUrl('/dashboard')}?session_id={CHECKOUT_SESSION_ID}`,
//       cancel_url: `${absoluteUrl('/pricing')}`, // Redirect to pricing or desired page on cancellation
//       customer: stripeCustomerId, // Associate the session with the Stripe customer
//       metadata: {
//         userId,
//         packageId,
//       },
//     });

//     console.log(`Created Checkout Session: ${session.id} for packageId: ${packageId}`);

//     // 4. Optionally, create a UserPackage entry here or handle it via webhooks after payment confirmation

//     return NextResponse.json({ url: session.url });
//   } catch (error: any) {
//     console.error('Create Package Error:', error);
//     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
//   }
// }

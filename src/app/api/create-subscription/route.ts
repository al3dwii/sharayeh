// app/api/create-subscription/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getAuth, clerkClient } from '@clerk/nextjs/server'; // Import clerkClient
import { stripe } from '@/lib/stripe';
import { absoluteUrl } from '@/lib/utils';
import prismadb from '@/utils/prismadb';
import { z } from 'zod';

// Define schema for request body
const createSubscriptionSchema = z.object({
  planId: z.string(),
});

// Disable dynamic rendering if necessary
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const { userId } = getAuth(request);

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { planId } = createSubscriptionSchema.parse(body);

    // Fetch the selected subscription plan from the database
    const plan = await prismadb.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    if (!plan.stripePriceId) {
      return NextResponse.json({ error: 'Stripe Price ID is missing for this plan' }, { status: 500 });
    }

    // Retrieve or create a Stripe customer for the user
    let userSubscription = await prismadb.userSubscription.findUnique({
      where: { userId },
    });

    let stripeCustomerId = userSubscription?.stripeCustomerId;

    if (!stripeCustomerId) {
      // Fetch user email from Clerk
      const user = await clerkClient.users.getUser(userId);
      const emailAddress = user.emailAddresses.find((email) => email.id === user.primaryEmailAddressId)?.emailAddress;

      if (!emailAddress) {
        return NextResponse.json({ error: 'Email is missing' }, { status: 400 });
      }

      // Create a new Stripe customer
      const customer = await stripe.customers.create({
        metadata: { userId },
        email: emailAddress, // Optionally include email
      });
      stripeCustomerId = customer.id;

      // Update or create user subscription with the new Stripe customer ID
      userSubscription = await prismadb.userSubscription.upsert({
        where: { userId },
        update: { stripeCustomerId },
        create: { userId, stripeCustomerId },
      });
    }

    // Create Stripe Checkout Session using predefined Stripe Price ID
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.stripePriceId, // Use predefined Stripe Price ID
          quantity: 1,
        },
      ],
      mode: 'subscription', // Always using subscription mode
      success_url: `${absoluteUrl('/dashboard')}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${absoluteUrl('/pricing')}`, // Redirect to pricing or desired page on cancellation
      customer: stripeCustomerId, // Associate the session with the Stripe customer
      metadata: {
        userId,
        planId,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Create Subscription Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}


// // app/api/create-subscription/route.ts

// import { NextRequest, NextResponse } from 'next/server';
// import { getAuth } from '@clerk/nextjs/server'; // Server-side authentication using Clerk
// import { stripe } from '@/lib/stripe';
// import { absoluteUrl } from '@/lib/utils';
// import prismadb from '@/utils/prismadb';
// import { z } from 'zod';

// // Define schema for request body
// const createSubscriptionSchema = z.object({
//   planId: z.string(),
// });

// // Disable dynamic rendering if necessary
// export const dynamic = 'force-dynamic';

// export async function POST(request: NextRequest) {
//   const { userId } = getAuth(request);

//   if (!userId) {
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//   }

//   try {
//     const body = await request.json();
//     const { planId } = createSubscriptionSchema.parse(body);

//     // Fetch the selected subscription plan from the database
//     const plan = await prismadb.subscriptionPlan.findUnique({
//       where: { id: planId },
//     });

//     if (!plan) {
//       return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
//     }

//     if (!plan.stripePriceId) {
//       return NextResponse.json({ error: 'Stripe Price ID is missing for this plan' }, { status: 500 });
//     }

//     // Retrieve or create a Stripe customer for the user
//     let userSubscription = await prismadb.userSubscription.findUnique({
//       where: { userId },
//     });

//     let stripeCustomerId = userSubscription?.stripeCustomerId;

//     if (!stripeCustomerId) {
//       // Fetch user to get email
//       const user = await prismadb.user.findUnique({ where: { id: userId } });
//       if (!user || !user.email) {
//         return NextResponse.json({ error: 'User not found or email missing' }, { status: 400 });
//       }

//       // Create a new Stripe customer
//       const customer = await stripe.customers.create({
//         metadata: { userId },
//         email: user.email, // Optionally include email
//       });
//       stripeCustomerId = customer.id;

//       // Update or create user subscription with the new Stripe customer ID
//       userSubscription = await prismadb.userSubscription.upsert({
//         where: { userId },
//         update: { stripeCustomerId },
//         create: { userId, stripeCustomerId },
//       });
//     }

//     // Create Stripe Checkout Session using predefined Stripe Price ID
//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ['card'],
//       line_items: [
//         {
//           price: plan.stripePriceId, // Use predefined Stripe Price ID
//           quantity: 1,
//         },
//       ],
//       mode: 'subscription', // Always using subscription mode
//       success_url: `${absoluteUrl('/dashboard')}?session_id={CHECKOUT_SESSION_ID}`,
//       cancel_url: `${absoluteUrl('/pricing')}`, // Redirect to pricing or desired page on cancellation
//       customer: stripeCustomerId, // Associate the session with the Stripe customer
//       metadata: {
//         userId,
//         planId,
//       },
//     });

//     return NextResponse.json({ url: session.url });
//   } catch (error) {
//     console.error('Create Subscription Error:', error);
//     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
//   }
// }



// // app/api/create-subscription/route.ts

// import { NextResponse } from 'next/server';
// import { getAuth } from '@clerk/nextjs/server'; // Server-side authentication using Clerk
// import { stripe } from '@/lib/stripe';
// import { absoluteUrl } from '@/lib/utils';
// import prismadb from '@/utils/prismadb';
// import { z } from 'zod';

// // Define schema for request body
// const createSubscriptionSchema = z.object({
//   planId: z.string(),
// });

// // Disable dynamic rendering if necessary
// export const dynamic = 'force-dynamic';

// export async function POST(request: Request) {
//   const { userId } = getAuth(request);

//   if (!userId) {
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//   }

//   try {
//     const body = await request.json();
//     const { planId } = createSubscriptionSchema.parse(body);

//     // Fetch the selected subscription plan from the database
//     const plan = await prismadb.subscriptionPlan.findUnique({
//       where: { id: planId },
//     });

//     if (!plan) {
//       return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
//     }

//     // Retrieve or create a Stripe customer for the user
//     let userSubscription = await prismadb.userSubscription.findUnique({
//       where: { userId },
//     });

//     let stripeCustomerId = userSubscription?.stripeCustomerId;

//     if (!stripeCustomerId) {
//       // Create a new Stripe customer
//       const customer = await stripe.customers.create({
//         metadata: { userId },
//         email: (await prismadb.user.findUnique({ where: { id: userId } })).email, // Optionally include email
//       });
//       stripeCustomerId = customer.id;

//       // Update or create user subscription with the new Stripe customer ID
//       userSubscription = await prismadb.userSubscription.upsert({
//         where: { userId },
//         update: { stripeCustomerId },
//         create: { userId, stripeCustomerId },
//       });
//     }

//     // Create Stripe Checkout Session using predefined Stripe Price ID
//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ['card'],
//       line_items: [
//         {
//           price: plan.stripePriceId, // Use predefined Stripe Price ID
//           quantity: 1,
//         },
//       ],
//       mode: 'subscription', // Always using subscription mode
//       success_url: `${absoluteUrl('/dashboard')}?session_id={CHECKOUT_SESSION_ID}`,
//       cancel_url: `${absoluteUrl('/pricing')}`, // Redirect to pricing or desired page on cancellation
//       customer: stripeCustomerId, // Associate the session with the Stripe customer
//       metadata: {
//         userId,
//         planId,
//       },
//     });

//     return NextResponse.json({ url: session.url });
//   } catch (error) {
//     console.error('Create Subscription Error:', error);
//     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
//   }
// }


// import { NextResponse } from 'next/server';
// import { stripe } from '@/lib/stripe';
// import { absoluteUrl } from '@/lib/utils';
// import prismadb from '@/utils/prismadb';
// import { z } from 'zod';

// export const dynamic = 'force-dynamic';

// const createSubscriptionSchema = z.object({
//   userId: z.string(),
//   planId: z.string(),
// });

// export async function POST(request: Request) {
//   try {
//     const body = await request.json();
//     const { userId, planId } = createSubscriptionSchema.parse(body);

//     const plan = await prismadb.subscriptionPlan.findUnique({
//       where: { id: planId },
//     });


//     if (!plan) {
//       return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
//     }

//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ['card'],
//       line_items: [{
//         price_data: {
//           currency: 'usd',
//           product_data: {
//             name: plan.name,
//           },
//           unit_amount: Math.round(plan.price * 100),
//           ...(plan.price > 0 && { recurring: { interval: 'month' } }),
//         },
//         quantity: 1,
//       }],
//       mode: plan.price > 0 ? 'subscription' : 'payment',
//       success_url: `${absoluteUrl("/dashboard")}?session_id={CHECKOUT_SESSION_ID}`,
//       cancel_url: `${absoluteUrl("/dashboard")}`,
//       metadata: {
//         userId,
//         planId,
//       },
//       expand: ['line_items'], // Try to get line_items directly
//     });

//     return NextResponse.json({ url: session.url });
//   } catch (error) {
//     console.error('Create Subscription Error:', error);
//     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
//   }
// }





// import { NextResponse } from 'next/server';
// import { stripe } from '@/lib/stripe';
// import { absoluteUrl } from '@/lib/utils';
// import prismadb from '@/utils/prismadb';
// import { z } from 'zod';

// export const dynamic = 'force-dynamic';

// const createSubscriptionSchema = z.object({
//   userId: z.string(),
//   planId: z.string(),
// });

// export async function POST(request: Request) {
//   try {
//     const body = await request.json();
//     const { userId, planId } = createSubscriptionSchema.parse(body);

//     const plan = await prismadb.subscriptionPlan.findUnique({
//       where: { id: planId },
//     });

//     if (!plan) {
//       return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
//     }

//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ['card'],
//       line_items: [{
//         price_data: {
//           currency: 'usd',
//           product_data: {
//             name: plan.name,
//           },
//           unit_amount: plan.price * 100,
//           ...(plan.price > 0 && { recurring: { interval: 'month' } }),
//         },
//         quantity: 1,
//       }],
//       mode: plan.price > 0 ? 'subscription' : 'payment',
//       success_url: `${absoluteUrl("/dashboard")}?session_id={CHECKOUT_SESSION_ID}`,
//       cancel_url: `${absoluteUrl("/dashboard")}`,
//       metadata: {
//         userId,
//         planId,
//       },
//       expand: ['line_items'], // ensure line_items are returned in the event
//     });

//     return NextResponse.json({ url: session.url });
//   } catch (error) {
//     console.error('Create Subscription Error:', error);
//     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
//   }
// }


// // app/api/create-subscription/route.ts
// import { NextResponse } from 'next/server';
// import { stripe } from '@/lib/stripe';
// import { absoluteUrl } from '@/lib/utils';
// import prismadb from '@/utils/prismadb';
// import { z } from 'zod';

// export const dynamic = 'force-dynamic';

// const createSubscriptionSchema = z.object({
//   userId: z.string(),
//   planId: z.string(),
// });

// export async function POST(request: Request) {
//   try {
//     const body = await request.json();
//     const { userId, planId } = createSubscriptionSchema.parse(body);

//     const plan = await prismadb.subscriptionPlan.findUnique({
//       where: { id: planId },
//     });

//     if (!plan) {
//       return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
//     }

//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ['card'],
//       line_items: [{
//         price_data: {
//           currency: 'usd',
//           product_data: {
//             name: plan.name,
//           },
//           unit_amount: plan.price * 100, // Convert to cents
//           ...(plan.price > 0 && { recurring: { interval: 'month' } }),
//         },
//         quantity: 1,
//       }],
//       mode: plan.price > 0 ? 'subscription' : 'payment',
//       success_url: `${absoluteUrl("/dashboard")}?session_id={CHECKOUT_SESSION_ID}`,
//       cancel_url: `${absoluteUrl("/dashboard")}`,
//       metadata: {
//         userId,
//         planId,
//       },
//     });

//     return NextResponse.json({ url: session.url });
//   } catch (error) {
//     console.error('Create Subscription Error:', error);
//     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
//   }
// }


// // app/api/create-subscription/route.js

// import { NextResponse } from 'next/server';
// import { stripe  } from '@/lib/stripe';
// import { absoluteUrl } from "@/lib/utils";
// import prismadb from "@/utils/prismadb";


// const settingsUrl = absoluteUrl("/dashboard");

// export const dynamic = 'force-dynamic';

// export async function POST(request) {
//   const { userId, planId } = await request.json();

//   const plan = await prismadb.subscriptionPlan.findUnique({
//     where: { id: planId },
//   });

//   if (!plan) {
//     return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
//   }

//   const session = await stripe.checkout.sessions.create({
//     payment_method_types: ['card'],
//     line_items: [{
//       price_data: {
//         currency: 'usd',
//         product_data: {
//           name: plan.name,
//         },
//         unit_amount: plan.price * 100, // Convert to cents
//         recurring: plan.price > 0 ? { interval: 'month' } : undefined,
//       },
//       quantity: 1,
//     }],
//     mode: plan.price > 0 ? 'subscription' : 'payment',
//     success_url: settingsUrl,
//     cancel_url: settingsUrl,
//     metadata: {
//       userId: userId,
//       planId: planId,
//     },
//   });

//   return NextResponse.json({ url: session.url });
// }

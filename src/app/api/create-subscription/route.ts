import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { absoluteUrl } from '@/lib/utils';
import prismadb from '@/utils/prismadb';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const createSubscriptionSchema = z.object({
  userId: z.string(),
  planId: z.string(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, planId } = createSubscriptionSchema.parse(body);

    const plan = await prismadb.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: plan.name,
          },
          unit_amount: Math.round(plan.price * 100),
          ...(plan.price > 0 && { recurring: { interval: 'month' } }),
        },
        quantity: 1,
      }],
      mode: plan.price > 0 ? 'subscription' : 'payment',
      success_url: `${absoluteUrl("/dashboard")}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${absoluteUrl("/dashboard")}`,
      metadata: {
        userId,
        planId,
      },
      expand: ['line_items'], // Try to get line_items directly
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Create Subscription Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

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

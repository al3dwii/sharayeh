// Import necessary modules and types
import { headers } from 'next/headers';
import { NextResponse, NextRequest } from 'next/server';
import prismadb from "@/utils/prismadb";
import { stripe } from "@/lib/stripe";
import Stripe from 'stripe';

// Define the POST handler with proper typing
export async function POST(request: NextRequest) {
  const sig = headers().get('stripe-signature');
  const buf = await request.text();

  let event: Stripe.Event;

  try {
    if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
      throw new Error('Missing Stripe signature or webhook secret.');
    }

    // Construct the Stripe event
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err: unknown) {
    // Type guard to ensure err is an Error
    if (err instanceof Error) {
      console.error('Webhook signature verification failed.', err.message);
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    } else {
      console.error('Webhook signature verification failed.', err);
      return new Response('Webhook Error: Invalid signature.', { status: 400 });
    }
  }

  // Handle different event types
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutSessionCompleted(session);
      break;
    case 'customer.subscription.deleted':
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionDeleted(subscription);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

// Handler for checkout.session.completed event
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const planId = session.metadata?.planId;

  if (!userId || !planId) {
    console.error("Missing metadata (userId or planId) in session.");
    return;
  }

  // Attempt to get line items (either expanded or via an API call)
  let lineItem: Stripe.LineItem | undefined = session.line_items?.data?.[0];
  if (!lineItem) {
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
    lineItem = lineItems.data?.[0];
  }

  if (!lineItem || !lineItem.price?.id) {
    console.error("No line_items found on session.");
    return;
  }

  const plan = await prismadb.subscriptionPlan.findUnique({
    where: { id: planId },
  });

  if (!plan) {
    console.error('Subscription plan not found.');
    return;
  }

  if (session.mode === 'subscription') {
    // Fetch subscription details from Stripe
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);

    // Convert Unix timestamp to JavaScript Date
    const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

    // Upsert user subscription in the database
    await prismadb.userSubscription.upsert({
      where: { userId },
      update: {
        stripeSubscriptionId: session.subscription as string,
        stripePriceId: lineItem.price.id,
        stripeCurrentPeriodEnd: currentPeriodEnd,
      },
      create: {
        userId,
        stripeSubscriptionId: session.subscription as string,
        stripePriceId: lineItem.price.id,
        stripeCurrentPeriodEnd: currentPeriodEnd,
      },
    });

    // Upsert user credits
    const existingCredits = await prismadb.userCredits.findUnique({
      where: { userId },
    });

    if (existingCredits) {
      await prismadb.userCredits.update({
        where: { userId },
        data: {
          credits: plan.credits,
        },
      });
    } else {
      await prismadb.userCredits.create({
        data: {
          userId,
          credits: plan.credits,
        },
      });
    }

    // Create a credit transaction
    await prismadb.creditTransaction.create({
      data: {
        userId,
        type: 'ADDITION',
        amount: plan.credits,
        description: `Credits added for ${plan.name} plan.`,
      },
    });
  } else {
    // Handle one-time payments or non-subscription mode
    await prismadb.userCredits.upsert({
      where: { userId },
      update: {
        credits: plan.credits,
      },
      create: {
        userId,
        credits: plan.credits,
      },
    });

    await prismadb.creditTransaction.create({
      data: {
        userId,
        type: 'ADDITION',
        amount: plan.credits,
        description: `Credits added for ${plan.name} plan.`,
      },
    });
  }
}

// Handler for customer.subscription.deleted event
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userSubscription = await prismadb.userSubscription.findUnique({
    where: { stripeSubscriptionId: subscription.id },
  });

  if (!userSubscription) {
    console.error('User subscription not found.');
    return;
  }

  await prismadb.userCredits.update({
    where: { userId: userSubscription.userId },
    data: {
      credits: 0,
    },
  });

  await prismadb.creditTransaction.create({
    data: {
      userId: userSubscription.userId,
      type: 'DEDUCTION',
      amount: 0,
      description: `Subscription canceled. Credits reset.`,
    },
  });
}


// import { headers } from 'next/headers';
// import { NextResponse } from 'next/server';
// import prismadb from "@/utils/prismadb"
// import { stripe } from "@/lib/stripe"

// export async function POST(request) {
//   const sig = headers().get('stripe-signature');
//   const buf = await request.text();

//   let event;

//   try {
//     event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);
//   } catch (err) {
//     console.error('Webhook signature verification failed.', err.message);
//     return new Response(`Webhook Error: ${err.message}`, { status: 400 });
//   }

//   switch (event.type) {
//     case 'checkout.session.completed':
//       await handleCheckoutSessionCompleted(event.data.object);
//       break;
//     case 'customer.subscription.deleted':
//       await handleSubscriptionDeleted(event.data.object);
//       break;
//     default:
//       console.log(`Unhandled event type ${event.type}`);
//   }

//   return NextResponse.json({ received: true });
// }

// async function handleCheckoutSessionCompleted(session) {
//   const userId = session.metadata?.userId;
//   const planId = session.metadata?.planId;

//   if (!userId || !planId) {
//     console.error("Missing metadata (userId or planId) in session.");
//     return;
//   }

//   // Attempt to get line items (either expanded or via an API call)
//   let lineItem = session.line_items?.data?.[0];
//   if (!lineItem) {
//     const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
//     lineItem = lineItems.data?.[0];
//   }

//   if (!lineItem || !lineItem.price?.id) {
//     console.error("No line_items found on session.");
//     return;
//   }

//   const plan = await prismadb.subscriptionPlan.findUnique({
//     where: { id: planId },
//   });

//   if (!plan) {
//     console.error('Subscription plan not found.');
//     return;
//   }

//   if (session.mode === 'subscription') {
//     // Fetch subscription details from Stripe
//     const subscription = await stripe.subscriptions.retrieve(session.subscription);

//     // Use subscription.current_period_end, which is a Unix timestamp
//     const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

//     await prismadb.userSubscription.upsert({
//       where: { userId },
//       update: {
//         stripeSubscriptionId: session.subscription,
//         stripePriceId: lineItem.price.id,
//         stripeCurrentPeriodEnd: currentPeriodEnd,
//       },
//       create: {
//         userId,
//         stripeSubscriptionId: session.subscription,
//         stripePriceId: lineItem.price.id,
//         stripeCurrentPeriodEnd: currentPeriodEnd,
//       },
//     });

//     const existingCredits = await prismadb.userCredits.findUnique({
//       where: { userId },
//     });

//     if (existingCredits) {
//       await prismadb.userCredits.update({
//         where: { userId },
//         data: {
//           credits: plan.credits,
//         },
//       });
//     } else {
//       await prismadb.userCredits.create({
//         data: {
//           userId,
//           credits: plan.credits,
//         },
//       });
//     }

//     await prismadb.creditTransaction.create({
//       data: {
//         userId,
//         type: 'ADDITION',
//         amount: plan.credits,
//         description: `Credits added for ${plan.name} plan.`,
//       },
//     });
//   } else {
//     // Handle one-time payments or non-subscription mode
//     await prismadb.userCredits.upsert({
//       where: { userId },
//       update: {
//         credits: plan.credits,
//       },
//       create: {
//         userId,
//         credits: plan.credits,
//       },
//     });

//     await prismadb.creditTransaction.create({
//       data: {
//         userId,
//         type: 'ADDITION',
//         amount: plan.credits,
//         description: `Credits added for ${plan.name} plan.`,
//       },
//     });
//   }
// }

// async function handleSubscriptionDeleted(subscription) {
//   const userSubscription = await prismadb.userSubscription.findUnique({
//     where: { stripeSubscriptionId: subscription.id },
//   });

//   if (!userSubscription) {
//     console.error('User subscription not found.');
//     return;
//   }

//   await prismadb.userCredits.update({
//     where: { userId: userSubscription.userId },
//     data: {
//       credits: 0,
//     },
//   });

//   await prismadb.creditTransaction.create({
//     data: {
//       userId: userSubscription.userId,
//       type: 'DEDUCTION',
//       amount: 0,
//       description: `Subscription canceled. Credits reset.`,
//     },
//   });
// }


// import { headers } from 'next/headers';
// import { NextResponse } from 'next/server';
// import prismadb from "@/utils/prismadb"
// import { stripe } from "@/lib/stripe"

// export async function POST(request) {
//   const sig = headers().get('stripe-signature');
//   const buf = await request.text();

//   let event;

//   try {
//     event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);
//   } catch (err) {
//     console.error('Webhook signature verification failed.', err.message);
//     return new Response(`Webhook Error: ${err.message}`, { status: 400 });
//   }

//   switch (event.type) {
//     case 'checkout.session.completed':
//       await handleCheckoutSessionCompleted(event.data.object);
//       break;
//     case 'customer.subscription.deleted':
//       await handleSubscriptionDeleted(event.data.object);
//       break;
//     default:
//       console.log(`Unhandled event type ${event.type}`);
//   }

//   return NextResponse.json({ received: true });
// }

// async function handleCheckoutSessionCompleted(session) {
//   const userId = session.metadata?.userId;
//   const planId = session.metadata?.planId;

//   if (!userId || !planId) {
//     console.error("Missing metadata (userId or planId) in session.");
//     return;
//   }

//   let lineItem = session.line_items?.data?.[0];

//   // If line_items were not returned despite expand, fetch them manually
//   if (!lineItem) {
//     try {
//       const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
//       lineItem = lineItems.data?.[0];
//     } catch (error) {
//       console.error("Error fetching line items:", error);
//       return;
//     }
//   }

//   if (!lineItem || !lineItem.price?.id) {
//     console.error("No line_items found on session even after fetching. Check your configuration.");
//     return;
//   }

//   const plan = await prismadb.subscriptionPlan.findUnique({
//     where: { id: planId },
//   });

//   if (!plan) {
//     console.error('Subscription plan not found.');
//     return;
//   }

//   if (session.mode === 'subscription') {
//     await prismadb.userSubscription.upsert({
//       where: { userId },
//       update: {
//         stripeSubscriptionId: session.subscription,
//         stripePriceId: lineItem.price.id,
//         stripeCurrentPeriodEnd: new Date(session.current_period_end * 1000),
//       },
//       create: {
//         userId,
//         stripeSubscriptionId: session.subscription,
//         stripePriceId: lineItem.price.id,
//         stripeCurrentPeriodEnd: new Date(session.current_period_end * 1000),
//       },
//     });

//     const existingCredits = await prismadb.userCredits.findUnique({ where: { userId } });

//     if (existingCredits) {
//       await prismadb.userCredits.update({
//         where: { userId },
//         data: { credits: plan.credits },
//       });
//     } else {
//       await prismadb.userCredits.create({
//         data: { userId, credits: plan.credits },
//       });
//     }

//     await prismadb.creditTransaction.create({
//       data: {
//         userId,
//         type: 'ADDITION',
//         amount: plan.credits,
//         description: `Credits added for ${plan.name} plan.`,
//       },
//     });
//   } else {
//     await prismadb.userCredits.upsert({
//       where: { userId },
//       update: { credits: plan.credits },
//       create: { userId, credits: plan.credits },
//     });

//     await prismadb.creditTransaction.create({
//       data: {
//         userId,
//         type: 'ADDITION',
//         amount: plan.credits,
//         description: `Credits added for ${plan.name} plan.`,
//       },
//     });
//   }
// }

// async function handleSubscriptionDeleted(subscription) {
//   const userSubscription = await prismadb.userSubscription.findUnique({
//     where: { stripeSubscriptionId: subscription.id },
//   });

//   if (!userSubscription) {
//     console.error('User subscription not found.');
//     return;
//   }

//   await prismadb.userCredits.update({
//     where: { userId: userSubscription.userId },
//     data: { credits: 0 },
//   });

//   await prismadb.creditTransaction.create({
//     data: {
//       userId: userSubscription.userId,
//       type: 'DEDUCTION',
//       amount: 0,
//       description: `Subscription canceled. Credits reset.`,
//     },
//   });
// }



// import { headers } from 'next/headers';
// import { NextResponse } from 'next/server';
// import prismadb from "@/utils/prismadb"
// import { stripe } from "@/lib/stripe"

// export async function POST(request) {
//   const sig = headers().get('stripe-signature');
//   const buf = await request.text();

//   let event;

//   try {
//     event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);
//   } catch (err) {
//     console.error('Webhook signature verification failed.', err.message);
//     return new Response(`Webhook Error: ${err.message}`, { status: 400 });
//   }

//   switch (event.type) {
//     case 'checkout.session.completed':
//       // This event includes the session with line_items if we expanded them during session creation
//       await handleCheckoutSessionCompleted(event.data.object);
//       break;
//     case 'customer.subscription.deleted':
//       await handleSubscriptionDeleted(event.data.object);
//       break;
//     // You can add more event types as needed
//     default:
//       console.log(`Unhandled event type ${event.type}`);
//   }

//   return NextResponse.json({ received: true });
// }

// async function handleCheckoutSessionCompleted(session) {
//   const userId = session.metadata?.userId;
//   const planId = session.metadata?.planId;

//   if (!userId || !planId) {
//     console.error("Missing metadata (userId or planId) in session.");
//     return;
//   }

//   // Fetch the corresponding plan from the database
//   const plan = await prismadb.subscriptionPlan.findUnique({
//     where: { id: planId },
//   });

//   if (!plan) {
//     console.error('Subscription plan not found.');
//     return;
//   }

//   // Ensure line_items are available; they should be if we expanded them at session creation
//   const lineItem = session.line_items?.data?.[0];
//   if (!lineItem?.price?.id) {
//     console.error("No line_items found on session. Ensure `expand: ['line_items']` was used during session creation.");
//     return;
//   }

//   // For subscription-type sessions, update or create the userSubscription
//   if (session.mode === 'subscription') {
//     await prismadb.userSubscription.upsert({
//       where: { userId },
//       update: {
//         stripeSubscriptionId: session.subscription,
//         stripePriceId: lineItem.price.id,
//         stripeCurrentPeriodEnd: new Date(session.current_period_end * 1000),
//       },
//       create: {
//         userId,
//         stripeSubscriptionId: session.subscription,
//         stripePriceId: lineItem.price.id,
//         stripeCurrentPeriodEnd: new Date(session.current_period_end * 1000),
//       },
//     });

//     const existingCredits = await prismadb.userCredits.findUnique({
//       where: { userId },
//     });

//     if (existingCredits) {
//       await prismadb.userCredits.update({
//         where: { userId },
//         data: {
//           credits: plan.credits,
//         },
//       });
//     } else {
//       await prismadb.userCredits.create({
//         data: {
//           userId,
//           credits: plan.credits,
//         },
//       });
//     }

//     await prismadb.creditTransaction.create({
//       data: {
//         userId,
//         type: 'ADDITION',
//         amount: plan.credits,
//         description: `Credits added for ${plan.name} plan.`,
//       },
//     });
//   } else {
//     // For one-time payments, just add credits
//     await prismadb.userCredits.upsert({
//       where: { userId },
//       update: {
//         credits: plan.credits,
//       },
//       create: {
//         userId,
//         credits: plan.credits,
//       },
//     });

//     await prismadb.creditTransaction.create({
//       data: {
//         userId,
//         type: 'ADDITION',
//         amount: plan.credits,
//         description: `Credits added for ${plan.name} plan.`,
//       },
//     });
//   }
// }

// async function handleSubscriptionDeleted(subscription) {
//   const userSubscription = await prismadb.userSubscription.findUnique({
//     where: { stripeSubscriptionId: subscription.id },
//   });

//   if (!userSubscription) {
//     console.error('User subscription not found.');
//     return;
//   }

//   await prismadb.userCredits.update({
//     where: { userId: userSubscription.userId },
//     data: {
//       credits: 0,
//     },
//   });

//   await prismadb.creditTransaction.create({
//     data: {
//       userId: userSubscription.userId,
//       type: 'DEDUCTION',
//       amount: 0,
//       description: `Subscription canceled. Credits reset.`,
//     },
//   });
// }


// // app/api/webhooks/route.js

// import { headers } from 'next/headers';
// import { NextResponse } from 'next/server';
// import prismadb from "@/utils/prismadb"
// import { stripe } from "@/lib/stripe"


// export async function POST(request) {
//   const sig = headers().get('stripe-signature');
//   const buf = await request.text();

//   let event;

//   try {
//     event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);
//   } catch (err) {
//     console.error('Webhook signature verification failed.', err.message);
//     return new Response(`Webhook Error: ${err.message}`, { status: 400 });
//   }

//   switch (event.type) {
//     case 'payment_intent.succeeded':
//       await handleCheckoutSessionCompleted(event.data.object);
//       break;
//     case 'checkout.session.completed':
//       await handleCheckoutSessionCompleted(event.data.object);
//       break;
//     case 'customer.subscription.deleted':
//       await handleSubscriptionDeleted(event.data.object);
//       break;
//     // Add more cases as needed
//     default:
//       console.log(`Unhandled event type ${event.type}`);
//   }

//   return NextResponse.json({ received: true });
// }

// async function handleCheckoutSessionCompleted(session) {
//   const userId = session.metadata.userId;
//   const planId = session.metadata.planId; // a string

//   // const planId = parseInt(session.metadata.planId, 10);

//   const plan = await prisma.subscriptionPlan.findUnique({
//     where: { id: planId },
//   });

//   if (!plan) {
//     console.error('Subscription plan not found.');
//     return;
//   }

//   if (session.mode === 'subscription') {
//     await prisma.userSubscription.upsert({
//       where: { userId },
//       update: {
//         stripeSubscriptionId: session.subscription,
//         stripePriceId: session.line_items.data[0].price.id,
//         stripeCurrentPeriodEnd: new Date(session.current_period_end * 1000),
//       },
//       create: {
//         userId,
//         stripeSubscriptionId: session.subscription,
//         stripePriceId: session.line_items.data[0].price.id,
//         stripeCurrentPeriodEnd: new Date(session.current_period_end * 1000),
//       },
//     });

//     const existingCredits = await prisma.userCredits.findUnique({
//       where: { userId },
//     });

//     if (existingCredits) {
//       await prisma.userCredits.update({
//         where: { userId },
//         data: {
//           credits: plan.credits,
//         },
//       });
//     } else {
//       await prisma.userCredits.create({
//         data: {
//           userId,
//           credits: plan.credits,
//         },
//       });
//     }

//     await prisma.creditTransaction.create({
//       data: {
//         userId,
//         type: 'ADDITION',
//         amount: plan.credits,
//         description: `Credits added for ${plan.name} plan.`,
//       },
//     });
//   } else {
//     await prisma.userCredits.upsert({
//       where: { userId },
//       update: {
//         credits: plan.credits,
//       },
//       create: {
//         userId,
//         credits: plan.credits,
//       },
//     });

//     await prisma.creditTransaction.create({
//       data: {
//         userId,
//         type: 'ADDITION',
//         amount: plan.credits,
//         description: `Credits added for ${plan.name} plan.`,
//       },
//     });
//   }
// }

// async function handleSubscriptionDeleted(subscription) {
//   const userSubscription = await prisma.userSubscription.findUnique({
//     where: { stripeSubscriptionId: subscription.id },
//   });

//   if (!userSubscription) {
//     console.error('User subscription not found.');
//     return;
//   }

//   await prisma.userCredits.update({
//     where: { userId: userSubscription.userId },
//     data: {
//       credits: 0,
//     },
//   });

//   await prisma.creditTransaction.create({
//     data: {
//       userId: userSubscription.userId,
//       type: 'DEDUCTION',
//       amount: 0,
//       description: `Subscription canceled. Credits reset.`,
//     },
//   });
// }




// // app/api/webhooks/route.js

// import { headers } from 'next/headers';
// import { NextResponse } from 'next/server';
// import prismadb from "@/utils/prismadb"
// import { stripe } from "@/lib/stripe"


// export async function POST(request) {
//   const sig = headers().get('stripe-signature');
//   const buf = await request.text();

//   let event;

//   try {
//     event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);
//   } catch (err) {
//     console.error('Webhook signature verification failed.', err.message);
//     return new Response(`Webhook Error: ${err.message}`, { status: 400 });
//   }

//   switch (event.type) {
//     case 'checkout.session.completed':
//       await handleCheckoutSessionCompleted(event.data.object);
//       break;
//     case 'customer.subscription.deleted':
//       await handleSubscriptionDeleted(event.data.object);
//       break;
//     // Add more cases as needed
//     default:
//       console.log(`Unhandled event type ${event.type}`);
//   }

//   return NextResponse.json({ received: true });
// }

// async function handleCheckoutSessionCompleted(session) {
//   const userId = session.metadata.userId;
//   const planId = parseInt(session.metadata.planId, 10);

//   const plan = await prisma.subscriptionPlan.findUnique({
//     where: { id: planId },
//   });

//   if (!plan) {
//     console.error('Subscription plan not found.');
//     return;
//   }

//   if (session.mode === 'subscription') {
//     await prisma.userSubscription.upsert({
//       where: { userId },
//       update: {
//         stripeSubscriptionId: session.subscription,
//         stripePriceId: session.line_items.data[0].price.id,
//         stripeCurrentPeriodEnd: new Date(session.current_period_end * 1000),
//       },
//       create: {
//         userId,
//         stripeSubscriptionId: session.subscription,
//         stripePriceId: session.line_items.data[0].price.id,
//         stripeCurrentPeriodEnd: new Date(session.current_period_end * 1000),
//       },
//     });

//     const existingCredits = await prisma.userCredits.findUnique({
//       where: { userId },
//     });

//     if (existingCredits) {
//       await prisma.userCredits.update({
//         where: { userId },
//         data: {
//           credits: plan.credits,
//         },
//       });
//     } else {
//       await prisma.userCredits.create({
//         data: {
//           userId,
//           credits: plan.credits,
//         },
//       });
//     }

//     await prisma.creditTransaction.create({
//       data: {
//         userId,
//         type: 'ADDITION',
//         amount: plan.credits,
//         description: `Credits added for ${plan.name} plan.`,
//       },
//     });
//   } else {
//     await prisma.userCredits.upsert({
//       where: { userId },
//       update: {
//         credits: plan.credits,
//       },
//       create: {
//         userId,
//         credits: plan.credits,
//       },
//     });

//     await prisma.creditTransaction.create({
//       data: {
//         userId,
//         type: 'ADDITION',
//         amount: plan.credits,
//         description: `Credits added for ${plan.name} plan.`,
//       },
//     });
//   }
// }

// async function handleSubscriptionDeleted(subscription) {
//   const userSubscription = await prisma.userSubscription.findUnique({
//     where: { stripeSubscriptionId: subscription.id },
//   });

//   if (!userSubscription) {
//     console.error('User subscription not found.');
//     return;
//   }

//   await prisma.userCredits.update({
//     where: { userId: userSubscription.userId },
//     data: {
//       credits: 0,
//     },
//   });

//   await prisma.creditTransaction.create({
//     data: {
//       userId: userSubscription.userId,
//       type: 'DEDUCTION',
//       amount: 0,
//       description: `Subscription canceled. Credits reset.`,
//     },
//   });
// }




// import Stripe from "stripe"
// import { headers } from "next/headers"
// import { NextResponse } from "next/server"

// import prismadb from "@/utils/prismadb"
// import { stripe } from "@/lib/stripe"

// export async function POST(req: Request) {
//   const body = await req.text()
//   const signature = headers().get("Stripe-Signature") as string

//   let event: Stripe.Event

//   try {
//     event = stripe.webhooks.constructEvent(
//       body,
//       signature,
//       process.env.STRIPE_WEBHOOK_SECRET!
//     )
//   } catch (error: any) {
//     return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 })
//   }

//   // Handle the event
//   if (event.type === "checkout.session.completed") {
//     const session = event.data.object as Stripe.Checkout.Session

//     if (!session?.metadata?.userId) {
//       return new NextResponse("User id is required", { status: 400 })
//     }

//     const userId = session.metadata.userId

//     const subscription = await stripe.subscriptions.retrieve(
//       session.subscription as string
//     )

//     // Create the user subscription in your database
//     await prismadb.userSubscription.create({
//       data: {
//         userId: userId,
//         stripeSubscriptionId: subscription.id,
//         stripeCustomerId: subscription.customer as string,
//         stripePriceId: subscription.items.data[0].price.id,
//         stripeCurrentPeriodEnd: new Date(
//           subscription.current_period_end * 1000
//         ),
//       },
//     })

//     // Add 500 credits to the user's account
//     await prismadb.userCredits.upsert({
//       where: { userId: userId },
//       update: { credits: { increment: 500 } },
//       create: { userId: userId, credits: 500 },
//     })
//   }

//   if (event.type === "invoice.payment_succeeded") {
//     const invoice = event.data.object as Stripe.Invoice
//     const subscriptionId = invoice.subscription as string

//     // Retrieve the subscription to get the customer and metadata
//     const subscription = await stripe.subscriptions.retrieve(subscriptionId)

//     // Find the user subscription in your database
//     const userSubscription = await prismadb.userSubscription.findUnique({
//       where: {
//         stripeSubscriptionId: subscription.id,
//       },
//     })

//     if (userSubscription) {
//       // Update the subscription details in your database
//       await prismadb.userSubscription.update({
//         where: {
//           stripeSubscriptionId: subscription.id,
//         },
//         data: {
//           stripePriceId: subscription.items.data[0].price.id,
//           stripeCurrentPeriodEnd: new Date(
//             subscription.current_period_end * 1000
//           ),
//         },
//       })

//       // // Add 500 credits to the user's account upon successful payment
//       // await prismadb.userCredits.upsert({
//       //   where: { userId: userSubscription.userId },
//       //   update: { credits: { increment: 500 } },
//       //   create: { userId: userSubscription.userId, credits: 500 },
//       // })
//     }
//   }

//   return new NextResponse(null, { status: 200 })
// }







// import Stripe from "stripe"
// import { headers } from "next/headers"
// import { NextResponse } from "next/server"

// import prismadb from "@/utils/prismadb"
// import { stripe } from "@/lib/stripe"

// export async function POST(req: Request) {
//   const body = await req.text()
//   const signature = headers().get("Stripe-Signature") as string

//   let event: Stripe.Event

//   try {
//     event = stripe.webhooks.constructEvent(
//       body,
//       signature,
//       process.env.STRIPE_WEBHOOK_SECRET!
//     )
//   } catch (error: any) {
//     return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 })
//   }

//   // Handle the event
//   if (event.type === "checkout.session.completed") {
//     const session = event.data.object as Stripe.Checkout.Session

//     if (!session?.metadata?.userId) {
//       return new NextResponse("User id is required", { status: 400 })
//     }

//     const userId = session.metadata.userId

//     const subscription = await stripe.subscriptions.retrieve(
//       session.subscription as string
//     )

//     // Create the user subscription in your database
//     await prismadb.userSubscription.create({
//       data: {
//         userId: userId,
//         stripeSubscriptionId: subscription.id,
//         stripeCustomerId: subscription.customer as string,
//         stripePriceId: subscription.items.data[0].price.id,
//         stripeCurrentPeriodEnd: new Date(
//           subscription.current_period_end * 1000
//         ),
//       },
//     })

//     // Add 500 credits to the user's account
//     await prismadb.userCredits.upsert({
//       where: { userId: userId },
//       update: { credits: { increment: 500 } },
//       create: { userId: userId, credits: 500 },
//     })
//   }

//   if (event.type === "invoice.payment_succeeded") {
//     const invoice = event.data.object as Stripe.Invoice
//     const subscriptionId = invoice.subscription as string

//     // Retrieve the subscription to get the customer and metadata
//     const subscription = await stripe.subscriptions.retrieve(subscriptionId)

//     // Find the user subscription in your database
//     const userSubscription = await prismadb.userSubscription.findUnique({
//       where: {
//         stripeSubscriptionId: subscription.id,
//       },
//     })

//     if (userSubscription) {
//       // Update the subscription details in your database
//       await prismadb.userSubscription.update({
//         where: {
//           stripeSubscriptionId: subscription.id,
//         },
//         data: {
//           stripePriceId: subscription.items.data[0].price.id,
//           stripeCurrentPeriodEnd: new Date(
//             subscription.current_period_end * 1000
//           ),
//         },
//       })

//       // Add 500 credits to the user's account upon successful payment
//       await prismadb.userCredits.upsert({
//         where: { userId: userSubscription.userId },
//         update: { credits: { increment: 500 } },
//         create: { userId: userSubscription.userId, credits: 500 },
//       })
//     }
//   }

//   return new NextResponse(null, { status: 200 })
// }



// import Stripe from "stripe"
// import { headers } from "next/headers"
// import { NextResponse } from "next/server"

// import prismadb from "@/utils/prismadb"
// import { stripe } from "@/lib/stripe"

// export async function POST(req: Request) {
//   const body = await req.text()
//   const signature = headers().get("Stripe-Signature") as string

//   let event: Stripe.Event

//   try {
//     event = stripe.webhooks.constructEvent(
//       body,
//       signature,
//       process.env.STRIPE_WEBHOOK_SECRET!
//     )
//   } catch (error: any) {
//     return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 })
//   }

//   const session = event.data.object as Stripe.Checkout.Session

//   if (event.type === "checkout.session.completed") {
//     const subscription = await stripe.subscriptions.retrieve(
//       session.subscription as string
//     )

//     if (!session?.metadata?.userId) {
//       return new NextResponse("User id is required", { status: 400 });
//     }

//     await prismadb.userSubscription.create({
//       data: {
//         userId: session?.metadata?.userId,
//         stripeSubscriptionId: subscription.id,
//         stripeCustomerId: subscription.customer as string,
//         stripePriceId: subscription.items.data[0].price.id,
//         stripeCurrentPeriodEnd: new Date(
//           subscription.current_period_end * 1000
//         ),
//       },
//     })
//   }

//   if (event.type === "invoice.payment_succeeded") {
//     const subscription = await stripe.subscriptions.retrieve(
//       session.subscription as string
//     )

//     await prismadb.userSubscription.update({
//       where: {
//         stripeSubscriptionId: subscription.id,
//       },
//       data: {
//         stripePriceId: subscription.items.data[0].price.id,
//         stripeCurrentPeriodEnd: new Date(
//           subscription.current_period_end * 1000
//         ),
//       },
//     })
//   }

//   return new NextResponse(null, { status: 200 })
// };

import Stripe from "stripe"
import { headers } from "next/headers"
import { NextResponse } from "next/server"

import prismadb from "@/utils/prismadb"
import { stripe } from "@/lib/stripe"

export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get("Stripe-Signature") as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 })
  }

  // Handle the event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session

    if (!session?.metadata?.userId) {
      return new NextResponse("User id is required", { status: 400 })
    }

    const userId = session.metadata.userId

    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    )

    // Create the user subscription in your database
    await prismadb.userSubscription.create({
      data: {
        userId: userId,
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: subscription.customer as string,
        stripePriceId: subscription.items.data[0].price.id,
        stripeCurrentPeriodEnd: new Date(
          subscription.current_period_end * 1000
        ),
      },
    })

    // Add 500 credits to the user's account
    await prismadb.userCredits.upsert({
      where: { userId: userId },
      update: { credits: { increment: 500 } },
      create: { userId: userId, credits: 500 },
    })
  }

  if (event.type === "invoice.payment_succeeded") {
    const invoice = event.data.object as Stripe.Invoice
    const subscriptionId = invoice.subscription as string

    // Retrieve the subscription to get the customer and metadata
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)

    // Find the user subscription in your database
    const userSubscription = await prismadb.userSubscription.findUnique({
      where: {
        stripeSubscriptionId: subscription.id,
      },
    })

    if (userSubscription) {
      // Update the subscription details in your database
      await prismadb.userSubscription.update({
        where: {
          stripeSubscriptionId: subscription.id,
        },
        data: {
          stripePriceId: subscription.items.data[0].price.id,
          stripeCurrentPeriodEnd: new Date(
            subscription.current_period_end * 1000
          ),
        },
      })

      // // Add 500 credits to the user's account upon successful payment
      // await prismadb.userCredits.upsert({
      //   where: { userId: userSubscription.userId },
      //   update: { credits: { increment: 500 } },
      //   create: { userId: userSubscription.userId, credits: 500 },
      // })
    }
  }

  return new NextResponse(null, { status: 200 })
}



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

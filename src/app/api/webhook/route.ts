// app/api/webhook/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/db'; // Use consistent Prisma client
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { Prisma } from '@prisma/client';

// Only handle checkout.session.completed for one-time payments
const supportedEvents = new Set(['checkout.session.completed']);

export async function POST(request: NextRequest) {
  const sig = headers().get('stripe-signature');
  const buf = await request.arrayBuffer();
  const body = Buffer.from(buf);

  let event: Stripe.Event;

  try {
    if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
      throw new Error('Missing Stripe signature or webhook secret.');
    }

    // Verify and construct the Stripe event
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('Webhook signature verification failed:', err.message);
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    } else {
      console.error('Webhook signature verification failed:', err);
      return new Response('Webhook Error: Invalid signature.', { status: 400 });
    }
  }

  // Implement idempotency by checking if the event has been processed
  const eventId = event.id;
  const existingEvent = await db.stripeEvent.findUnique({
    where: { id: eventId },
  });

  if (existingEvent) {
    console.log(`Duplicate event received: ${eventId}`);
    return NextResponse.json({ received: true });
  }

  try {
    if (!supportedEvents.has(event.type)) {
      console.log(`Unhandled event type ${event.type}`);
      // Optionally, store unhandled events to prevent reprocessing
      await db.stripeEvent.create({
        data: {
          id: event.id,
          type: event.type,
          data: event.data.object as Prisma.JsonValue,
        },
      });
      return NextResponse.json({ received: true });
    }

    // Handle the supported event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutSessionCompleted(session);
    }

    // Store the event to ensure idempotency
    await db.stripeEvent.create({
      data: {
        id: event.id,
        type: event.type,
        data: event.data.object as Prisma.JsonValue,
      },
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook Handling Error:', error);
    return NextResponse.json({ error: 'Webhook Handler Error' }, { status: 500 });
  }
}

// =============================================================================
// Handler for checkout.session.completed event (one-time payment)
// =============================================================================
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const packageId = session.metadata?.packageId;
  const customerId = session.customer as string | undefined; // Extract Customer ID

  if (!userId || !packageId || !customerId) {
    console.error('Missing metadata (userId, packageId, or customerId) in session.');
    return;
  }

  // 1) Upsert a UserPackage record for this user/package
  try {
    await db.userPackage.upsert({
      where: { userId },
      update: {
        packageId,
        acquiredAt: new Date(),
        expiresAt: null, // No expiration for one-time purchases
        stripeCustomerId: customerId, // Updated field
      },
      create: {
        userId,
        packageId,
        acquiredAt: new Date(),
        expiresAt: null,
        stripeCustomerId: customerId, // Updated field
      },
    });
    console.log(`UserPackage upserted for userId: ${userId}, packageId: ${packageId}`);
  } catch (error) {
    console.error('Error upserting userPackage:', error);
    throw error; // Re-throw to handle idempotency storage
  }

  // 2) Fetch the purchased package details
  const purchasedPackage = await db.package.findUnique({
    where: { id: packageId },
  });
  if (!purchasedPackage) {
    console.error('Package not found for the provided packageId.');
    return;
  }

  // 3) Initialize or increment user credits
  try {
    const existingCredits = await db.userCredits.findUnique({
      where: { userId },
    });

    if (existingCredits) {
      // Increment existing credits
      await db.userCredits.update({
        where: { userId },
        data: {
          credits: {
            increment: purchasedPackage.credits,
          },
        },
      });
      console.log(`Credits incremented by ${purchasedPackage.credits} for userId: ${userId}`);
    } else {
      // Create user credits
      await db.userCredits.create({
        data: {
          userId,
          credits: purchasedPackage.credits,
          usedCredits: 0,
        },
      });
      console.log(`UserCredits created with ${purchasedPackage.credits} credits for userId: ${userId}`);
    }
  } catch (error) {
    console.error('Error initializing/updating user credits:', error);
    throw error; // Re-throw to handle idempotency storage
  }

  // 4) Log the credit addition as a transaction
  try {
    await db.creditTransaction.create({
      data: {
        userId,
        type: 'ADDITION',
        amount: purchasedPackage.credits,
        description: `Credits added for one-time purchase of ${purchasedPackage.name}.`,
      },
    });
    console.log(`Credit transaction logged for userId: ${userId}, amount: ${purchasedPackage.credits}`);
  } catch (error) {
    console.error('Error creating credit transaction:', error);
    throw error; // Re-throw to handle idempotency storage
  }

  console.log(`One-time purchase completed for user: ${userId}, package: ${packageId}.`);
}



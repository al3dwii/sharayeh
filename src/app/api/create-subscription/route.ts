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


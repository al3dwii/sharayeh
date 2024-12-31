// app/api/create-subscription/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getAuth, clerkClient } from '@clerk/nextjs/server'; // Import clerkClient
import { stripe } from '@/lib/stripe';
import { absoluteUrl } from '@/lib/utils';
import { db } from '@/lib/db'; // Use your db import here
import { z } from 'zod';

// Define schema for request body
const createPackageSchema = z.object({
  packageId: z.string(),
});

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const { userId } = getAuth(request);

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { packageId } = createPackageSchema.parse(body);

    // 1. Fetch the selected package from your Package model
    const selectedPackage = await db.package.findUnique({
      where: { id: packageId },
    });

    if (!selectedPackage) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 });
    }

    if (!selectedPackage.stripePriceId) {
      return NextResponse.json(
        { error: 'Stripe Price ID is missing for this package' },
        { status: 500 }
      );
    }

    // 2. Retrieve or create a UserPackage record (your user’s package subscription data)
    let userPackage = await db.userPackage.findUnique({
      where: { userId },
    });

    // 3. If the user doesn’t have a Stripe customer ID, create it
    let stripeCustomerId = userPackage?.stripeCustomerId;

    if (!stripeCustomerId) {
      // Fetch user’s email from Clerk
      const user = await clerkClient.users.getUser(userId);
      const emailAddress = user.emailAddresses.find(
        (email) => email.id === user.primaryEmailAddressId
      )?.emailAddress;

      if (!emailAddress) {
        return NextResponse.json({ error: 'Email is missing' }, { status: 400 });
      }

      // Create a new Stripe customer
      const customer = await stripe.customers.create({
        metadata: { userId },
        email: emailAddress,
      });
      stripeCustomerId = customer.id;

      // Upsert UserPackage with the new Stripe customer ID
      userPackage = await db.userPackage.upsert({
        where: { userId },
        update: { stripeCustomerId },
        create: {
          userId,
          packageId,          // Optionally associate the user with this package
          stripeCustomerId,
        },
      });
    }

    // 4. Create Stripe Checkout Session using predefined Stripe Price ID
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: selectedPackage.stripePriceId, // Use predefined Stripe Price ID
          quantity: 1,
        },
      ],
      mode: 'payment', // Ensure it's 'payment' for one-time purchases
      success_url: `${absoluteUrl('/dashboard')}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${absoluteUrl('/pricing')}`, // Redirect to pricing or desired page on cancellation
      customer: stripeCustomerId, // Associate the session with the Stripe customer
      metadata: {
        userId,
        packageId,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Create Package Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

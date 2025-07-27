// import Stripe from "stripe"

// export const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
//   apiVersion: "2023-10-16",
//   typescript: true,
// });

// src/lib/stripe.ts

import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16', // Use the latest stable API version
});

// BilandPages.tsx
import React from "react";
import BilandPagesClient from "@/components/custom/BilClient";
import { getUserSubscription } from "@/lib/queries";

interface BilandPagesProps {
  userId: string;
}

export async function BilandPages({ userId }: BilandPagesProps) {
  // Fetch subscription data from the database
  const subscriptionData = await getUserSubscription(userId);

  // Transform subscription data to fit Subscription interface
  const subscription = subscriptionData
    ? {
        plan: subscriptionData.stripePriceId, // or map it to a human-readable name
        endsAt: subscriptionData.stripeCurrentPeriodEnd,
      }
    : null;

  return <BilandPagesClient userId={userId} subscription={subscription} />;
}


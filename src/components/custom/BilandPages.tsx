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



// // BilandPages.tsx
// import React from "react";
// import BilandPagesClient from "./BilandPagesClient";
// import { getUserSubscription } from "@/lib/queries";

// interface BilandPagesProps {
//   userId: string;
// }

// export async function BilandPages({ userId }: BilandPagesProps) {
//   // Fetch subscription data from the database
//   const subscription = await getUserSubscription(userId);

//   return <BilandPagesClient userId={userId} subscription={subscription} />;
// }



// // BilandPages.tsx
// import React from 'react';
// import BilandPagesclient from './BilandPagesclient';
// import { getUserSubscription } from '@/lib/queries';

// export async function BilandPages({ userId }: { userId: string }) {
//   // Fetch subscription data from the database
//   const subscription = await getUserSubscription(userId);

//   return <BilandPagesclient userId={userId} Subscription={subscription} />;
// }

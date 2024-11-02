// src/types/Subscription.ts

export interface Subscription {
    id: string;
    userId: string;
    createdAt: Date;
    stripeCustomerId: string | null;
    stripeSubscriptionId: string | null;
    stripePriceId: string | null;
    stripeCurrentPeriodEnd: Date | null;
    updatedAt: Date;
    plan: string;          // Included
    endsAt: Date;          // Included
  }
  
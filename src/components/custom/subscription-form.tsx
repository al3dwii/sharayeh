// apps/nextjs/src/app/[lang]/(dashboard)/dashboard/billing/subscription-form.tsx

"use client";

import { Button } from '@/components/custom/custom-button';
import Link from 'next/link';

export function SubscriptionForm({ hasSubscription }: { hasSubscription: boolean }) {
  const buttonText = hasSubscription ? "Manage Subscription" : "Upgrade";

  return (
    <Link href="/pricing">
      <Button text={buttonText} />
    </Link>
  );
}

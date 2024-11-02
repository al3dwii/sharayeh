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


// "use client";

// import { Button } from '@/components/custom/custom-button';
// import Link from 'next/link';

// export function SubscriptionForm(props: {
//   hasSubscription: boolean;
//   dict: Record<string, string>;
// }) {
//   const buttonText = props.hasSubscription
//     ? props.dict.manage_subscription
//     : props.dict.upgrade;

//   return (
//     <Link href="/pricing">
//       <Button text={buttonText} />
//     </Link>
//   );
// }




// import Link from "next/link";

// import { cn } from "@saasfly/ui";
// import { buttonVariants } from "@saasfly/ui/button";

// export function SubscriptionForm(props: {
//   hasSubscription: boolean;
//   dict: Record<string, string>;
// }) {
//   return (
//     <Link href="/pricing" className={cn(buttonVariants())}>
//       {props.hasSubscription
//         ? props.dict.manage_subscription
//         : props.dict.upgrade}
//     </Link>
//   );
// }

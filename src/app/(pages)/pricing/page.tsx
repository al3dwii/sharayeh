// Import Prisma client
import  prismadb from "@/utils/prismadb";
import { currentUser } from "@clerk/nextjs";
import { PricingCards } from "@/components/gadawel/pricing-cards";
import { PricingFaq } from "@/components/gadawel/pricing-faq";
import { Footer } from "@/components/gadawel/footer";
import Navigation from '@/components/site/navigation';

export const metadata = {
  title: "Pricing",
};

export default async function PricingPage() {
  const user = await currentUser();
  let isPro = false;

  if (user) {
    // Fetch the subscription plan using Prisma
    const subscriptionPlan = await prismadb.userSubscription.findUnique({
      where: { userId: user.id },
      select: {
        stripeSubscriptionId: true,
        stripePriceId: true,
        stripeCurrentPeriodEnd: true,
      },
    });

    // Set isPro to true if there is an active subscription
    isPro = !!subscriptionPlan?.stripeSubscriptionId;
  }

  return (
    <>
      <div className="flex w-full flex-col gap-16 py-8 md:py-8">
        <PricingCards userId={user?.id ?? null} isPro={isPro} />
        <hr className="container" />
        <PricingFaq />
      </div>
      <Footer />
    </>
  );
}


// // apps/nextjs/src/app/[lang]/(marketing)/pricing/page.tsx

// // apps/nextjs/src/app/(marketing)/pricing/page.tsx
// import { currentUser } from "@clerk/nextjs";
// import { PricingCards } from "@/components/gadawel/pricing-cards";
// import { PricingFaq } from "@/components/gadawel/pricing-faq";
// import { Footer } from "@/components/gadawel/footer";

// import Navigation from '@/components/site/navigation'


// export const metadata = {
//   title: "Pricing",
// };

// export default async function PricingPage() {
//   const user = await currentUser();
//   let subscriptionPlan = null;

//   if (user) {
//     // Assuming you have a function to get subscription plans for Clerk
//     subscriptionPlan = await fetchUserSubscriptionPlan(user.id);
//   }

//   return (
//     <>

//       <div className="flex w-full flex-col gap-16 py-8 md:py-8">
//         <PricingCards userId={user?.id} subscriptionPlan={subscriptionPlan} />
//         <hr className="container" />
//         <PricingFaq />
//       </div>
//       <Footer />
//     </>
//   );
// }


// Example function to fetch user subscription plan; replace with your actual implementation
async function fetchUserSubscriptionPlan(userId: string) {
  // Implement your logic here, e.g., fetch from your backend or directly from Stripe
  return null; // Replace with actual plan data
}


// import { getCurrentUser } from "@saasfly/auth";

// import { PricingCards } from "@/components/gadawel/pricing-cards";
// import { PricingFaq } from "@/components/gadawel/pricing-faq";
// import { trpc } from "~/trpc/server";

// import { Footer } from "@/components/gadawel/footer";


// export const metadata = {
//   title: "Pricing",
// };

// export default async function PricingPage({
//   params: { lang },
// }: {
//   params: {
//     lang: Locale;
//   };
// }) {
//   const user = await getCurrentUser();
//   let subscriptionPlan;

//   if (user) {
//     subscriptionPlan = await trpc.stripe.userPlans.query();
//   }
//   return (
//     <>
//     <div className="flex w-full flex-col gap-16 py-8 md:py-8">
//       <PricingCards
//         userId={user?.id}
//         subscriptionPlan={subscriptionPlan}
       
//         params={{ lang }}
//       />
//       <hr className="container" />
//       <PricingFaq  />
//     </div>
//           <Footer />
//           </>
//   );
// }

// src/app/pricing/page.tsx

import prismadb from "@/utils/prismadb";
import { getCurrentUser } from "@/utils/auth"; 
import PricingSection from "@/components/pricing/PricingSection";
import { Footer } from "@/components/gadawel/footer";
import { PricingFaqs } from "@/components/gadawel/pricingfags";

import { Metadata } from "next";

import { pricingPlans } from "@/config/planConfig";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Choose the plan that fits your needs.",
};

export default async function PricingPage() {
  try {
    const user = await getCurrentUser(); 
    let currentPlanId: string | null = null;

    if (user) {
      const subscriptionPlan = await prismadb.userSubscription.findUnique({
        where: { userId: user.id },
        select: {
          stripeSubscriptionId: true,
          stripePriceId: true, // This is the stripePriceId
          stripeCurrentPeriodEnd: true,
        },
      });

      const stripePriceId = subscriptionPlan?.stripePriceId || null;

      if (stripePriceId) {
        const currentPlan = pricingPlans.find(p => p.stripePriceId === stripePriceId);
        currentPlanId = currentPlan ? currentPlan.id : null;
      }
    }

    console.log("PricingPage - Current Plan ID:", currentPlanId); // Debugging

    return (
      <>
        <main className="flex w-full flex-col gap-16 py-8 md:py-12">
          <PricingSection currentPlanId={currentPlanId} />
          <hr className="container my-8" />
          <PricingFaqs />
        </main>
        <Footer />
      </>
    );
  } catch (error) {
    console.error("Error loading pricing page:", error);
    return (
      <div className="container mx-auto py-20 text-center">
        <h1 className="text-2xl font-bold">Something went wrong</h1>
        <p className="mt-4">Please try again later.</p>
      </div>
    );
  }
}

// // src/app/pricing/page.tsx

// import prismadb from "@/utils/prismadb";
// import { getCurrentUser } from "@/utils/auth"; 
// import PricingSection from "@/components/pricing/PricingSection";
// import { Footer } from "@/components/gadawel/footer";
// import { PricingFaqs } from "@/components/gadawel/pricingfags";

// import { Metadata } from "next";

// export const metadata: Metadata = {
//   title: "Pricing",
//   description: "Choose the plan that fits your needs.",
// };

// export default async function PricingPage() {
//   try {
//     const user = await getCurrentUser(); 
//     let currentPlanId: string | null = null;

//     if (user) {
//       const subscriptionPlan = await prismadb.userSubscription.findUnique({
//         where: { userId: user.id },
//         select: {
//           stripeSubscriptionId: true,
//           stripePriceId: true, // This is the stripePriceId
//           stripeCurrentPeriodEnd: true,
//         },
//       });

//       currentPlanId = subscriptionPlan?.stripePriceId || null;
//     }

//     console.log("PricingPage - Current Plan ID:", currentPlanId); // Debugging

//     return (
//       <>
//         <main className="flex w-full flex-col gap-16 py-8 md:py-12">
//           <PricingSection currentPlanId={currentPlanId} />
//           <hr className="container my-8" />
//           <PricingFaqs />
//         </main>
//         <Footer />
//       </>
//     );
//   } catch (error) {
//     console.error("Error loading pricing page:", error);
//     return (
//       <div className="container mx-auto py-20 text-center">
//         <h1 className="text-2xl font-bold">Something went wrong</h1>
//         <p className="mt-4">Please try again later.</p>
//       </div>
//     );
//   }
// }


// // /src/app/pricing/page.tsx

// import prismadb from "@/utils/prismadb";
// import { getCurrentUser } from "@/utils/auth"; 
// import PricingSection from "@/components/pricing/PricingSection";
// import { Footer } from "@/components/gadawel/footer";
// import { PricingFaqs } from "@/components/gadawel/pricingfags";

// import { Metadata } from "next";

// export const metadata: Metadata = {
//   title: "Pricing",
//   description: "Choose the plan that fits your needs.",
// };

// export default async function PricingPage() {
//   try {
//     const user = await getCurrentUser(); 
//     let isPro = false;

//     if (user) {
//       const subscriptionPlan = await prismadb.userSubscription.findUnique({
//         where: { userId: user.id },
//         select: {
//           stripeSubscriptionId: true,
//           stripePriceId: true,
//           stripeCurrentPeriodEnd: true,
//         },
//       });

//       isPro = !!subscriptionPlan?.stripeSubscriptionId;
//     }

//     return (
//       <>
//         <main className="flex w-full flex-col gap-16 py-8 md:py-12">
//           <PricingSection isPro={isPro} />
//           <hr className="container my-8" />
//           <PricingFaqs />
//         </main>
//         <Footer />
//       </>
//     );
//   } catch (error) {
//     console.error("Error loading pricing page:", error);
//     return (
//       <div className="container mx-auto py-20 text-center">
//         <h1 className="text-2xl font-bold">Something went wrong</h1>
//         <p className="mt-4">Please try again later.</p>
//       </div>
//     );
//   }
// }


// // /src/app/pricing/page.tsx

// import prismadb from "@/utils/prismadb";
// import { getCurrentUser } from "@/utils/auth"; 
// import PricingSection from "@/components/pricing/PricingSection";
// import { Footer } from "@/components/gadawel/footer";
// import { PricingFaqs } from "@/components/gadawel/pricingfags";

// import { Metadata } from "next";

// export const metadata: Metadata = {
//   title: "Pricing",
//   description: "Choose the plan that fits your needs.",
// };

// export default async function PricingPage() {
//   try {
//     const user = await getCurrentUser(); 
//     let isPro = false;

//     if (user) {
//       const subscriptionPlan = await prismadb.userSubscription.findUnique({
//         where: { userId: user.id },
//         select: {
//           stripeSubscriptionId: true,
//           stripePriceId: true,
//           stripeCurrentPeriodEnd: true,
//         },
//       });

//       isPro = !!subscriptionPlan?.stripeSubscriptionId;
//     }

//     return (
//       <>
//         <main className="flex w-full flex-col gap-16 py-8 md:py-12">
//           <PricingSection isPro={isPro} />
//           <hr className="container my-8" />
//           <PricingFaqs />
//         </main>
//         <Footer />
//       </>
//     );
//   } catch (error) {
//     console.error("Error loading pricing page:", error);
//     return (
//       <div className="container mx-auto py-20 text-center">
//         <h1 className="text-2xl font-bold">Something went wrong</h1>
//         <p className="mt-4">Please try again later.</p>
//       </div>
//     );
//   }
// }



// // /Users/omair/shraih/src/app/(pages)/pricing/page.tsx
// // Import Prisma client
// import  prismadb from "@/utils/prismadb";
// import { currentUser } from "@clerk/nextjs";
// import { PricingCards } from "@/components/gadawel/pricing-cards";
// // import { PricingFaq } from "@/components/gadawel/pricing-faq";
// import { Footer } from "@/components/gadawel/footer";
// // import Navigation from '@/components/site/navigation';
// import { PricingFaqs } from "@/components/gadawel/pricingfags";
// import  SubscriptionPlans  from "@/components/SubscriptionPlans";


// export const metadata = {
//   title: "Pricing",
// };

// export default async function PricingPage() {
//   const user = await currentUser();
//   let isPro = false;

//   if (user) {
//     // Fetch the subscription plan using Prisma
//     const subscriptionPlan = await prismadb.userSubscription.findUnique({
//       where: { userId: user.id },
//       select: {
//         stripeSubscriptionId: true,
//         stripePriceId: true,
//         stripeCurrentPeriodEnd: true,
//       },
//     });

//     // Set isPro to true if there is an active subscription
//     isPro = !!subscriptionPlan?.stripeSubscriptionId;
//   }

//   return (
//     <>
//       <div className="flex w-full flex-col gap-16 py-8 md:py-8">
//         <PricingCards userId={user?.id ?? null} isPro={isPro} />
//         <hr className="container" />
        
//         <SubscriptionPlans /> 

//         <PricingFaqs /> 

//         {/* <PricingFaq /> */}
//       </div>
//       <Footer />
//     </>
//   );
// }




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


// // Example function to fetch user subscription plan; replace with your actual implementation
// async function fetchUserSubscriptionPlan(userId: string) {
//   // Implement your logic here, e.g., fetch from your backend or directly from Stripe
//   return null; // Replace with actual plan data
// }


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

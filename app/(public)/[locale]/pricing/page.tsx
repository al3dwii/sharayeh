// src/app/pricing/page.tsx

import prismadb from "../../../utils/prismadb";
import { getCurrentUser } from "../../../utils/auth"; 
import PricingSection from "./PricingSection";
import { PricingFaqs } from "./pricingfags";

import { Metadata } from "next";
import { pricingPlans } from "./planConfig";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Pricing",
  description: "Choose the plan that fits your needs.",
};

export default async function PricingPage() {
  try {
    const user = await getCurrentUser(); 
    let currentPlanId: string | null = null;

    if (user) {
      const userPackages = await prismadb.userPackage.findMany({
        where: { userId: user.id },
        include: { package: { select: { tier: true } } }, // Removed stripePriceId
      });

      if (userPackages.length > 0) {
        // Define tier priorities
        const tiersPriority: Record<string, number> = {
          super: 4,
          premium: 3,
          standard: 2,
          free: 1,
        };

        let highestTier = 'free';
        let highestPriority = 1;

        userPackages.forEach(pkg => {
          const currentTier = pkg.package.tier.toLowerCase();
          const priority = tiersPriority[currentTier] || 1;
          if (priority > highestPriority) {
            highestPriority = priority;
            highestTier = currentTier;
          }
        });

        // Find the plan that matches the highest tier
        const currentPlan = pricingPlans.find(p => p.tier.toLowerCase() === highestTier);
        currentPlanId = currentPlan ? currentPlan.id : null;
      }
    }

    console.log("PricingPage - Current Plan ID:", currentPlanId); // Debugging

    return (
      <>
        <main className="flex w-full flex-col gap-16 py-8  md:py-12">
          <PricingSection currentPlanId={currentPlanId} />
        </main>
        <PricingFaqs />
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
// import { pricingPlans } from "@/config/planConfig";

// export const dynamic = 'force-dynamic';


// export const metadata: Metadata = {
//   title: "Pricing",
//   description: "Choose the plan that fits your needs.",
// };

// export default async function PricingPage() {
//   try {
//     const user = await getCurrentUser(); 
//     let currentPlanId: string | null = null;

//     if (user) {
//       const userPackages = await prismadb.userPackage.findMany({
//         where: { userId: user.id },
//         include: { package: { select: { stripePriceId: true, tier: true } } },
//       });

//       if (userPackages.length > 0) {
//         // Define tier priorities
//         const tiersPriority: Record<string, number> = {
//           super: 4,
//           premium: 3,
//           standard: 2,
//           free: 1,
//         };

//         let highestTier = 'free';
//         let highestPriority = 1;

//         userPackages.forEach(pkg => {
//           const currentTier = pkg.package.tier.toLowerCase();
//           const priority = tiersPriority[currentTier] || 1;
//           if (priority > highestPriority) {
//             highestPriority = priority;
//             highestTier = currentTier;
//           }
//         });

//         // Find the plan that matches the highest tier
//         const currentPlan = pricingPlans.find(p => p.tier.toLowerCase() === highestTier);
//         currentPlanId = currentPlan ? currentPlan.id : null;
//       }
//     }

//     console.log("PricingPage - Current Plan ID:", currentPlanId); // Debugging

//     return (
//       <>
//         <main className="flex w-full flex-col gap-16 py-8  md:py-12">
//           <PricingSection currentPlanId={currentPlanId} />
//         </main>
//         <PricingFaqs />
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

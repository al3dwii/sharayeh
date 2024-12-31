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
      const userPackage = await prismadb.userPackage.findUnique({
        where: { userId: user.id },
        include: {
          package: {
            select: {
              stripePriceId: true,
              tier: true,
            },
          },
        },
      });

      const stripePriceId = userPackage?.package?.stripePriceId || null;

      if (stripePriceId) {
        const currentPlan = pricingPlans.find(p => p.stripePriceId === stripePriceId);
        currentPlanId = currentPlan ? currentPlan.id : null;
      }
    }

    console.log("PricingPage - Current Plan ID:", currentPlanId); // Debugging

    return (
      <>
        <main className="flex w-full flex-col gap-16 py-8  md:py-12">
          <PricingSection currentPlanId={currentPlanId} />
          <hr className="container my-8" />
        </main>
        <PricingFaqs />

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



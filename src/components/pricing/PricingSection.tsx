// src/components/pricing/PricingSection.tsx
'use client'

import React, { useState } from 'react';
import axios from 'axios';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Balancer from "react-wrap-balancer";

import { toast } from 'sonner';
import Loading from '@/components/global/loading';
import PlanCard from './PlanCard';
import { pricingPlans } from '@/config/planConfig';

interface PricingSectionProps {
  currentPlanId: string | null;
}

const PricingSection: React.FC<PricingSectionProps> = ({ currentPlanId }) => {
  const { isSignedIn, user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleBuyPackage = async (packageId: string) => {
    if (!isSignedIn) {
      toast.info('Please sign in to purchase packages.');
      router.push('/sign-in');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/buy-package', {
        packageId,
      });
      // Redirect to Stripe Checkout
      window.location.href = response.data.url;
    } catch (error: any) {
      console.error('Purchase error:', error);
      const message =
        error.response?.data?.error || 'Failed to purchase package. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="container mt-8 flex flex-col items-center text-center">
      <div className="mx-auto mt-10 flex w-full flex-col gap-5">
        <p className="font-tajawal text-4xl font-bold text-black">الباقات</p>
        <h2 className="font-tajawal font-heading text-sm leading-[1.1] md:text-xl text-blue-500">
          الشراء مرة واحدة ولا يتم التجديد تلقائياً
        </h2>
      </div>

      <div className="mx-auto grid max-w-screen-lg gap-5 py-5 md:grid-cols-2 lg:grid-cols-3">
        {pricingPlans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            onBuy={handleBuyPackage}
            currentPlanId={currentPlanId}
          />
        ))}
      </div>

      <p className="mt-3 text-center text-base text-muted-foreground">
        {/* Your existing footer content */}
        <Balancer>
          البريد الالكتروني{" "}
          <a
            className="font-medium text-primary hover:underline"
            href="mailto:admin@arabicocr.net"
          >
            admin@sharayeh.com
          </a>{" "}
          <br />
          راسلنا لاي استفسار
          <br />
          <strong>جاهزين للرد والدعم</strong>
        </Balancer>
      </p>

      {loading && <Loading />}
    </section>
  );
};

export default PricingSection;

// // src/components/pricing/PricingSection.tsx

// "use client";

// import { useState, useEffect } from "react";
// import Balancer from "react-wrap-balancer";
// import { useUser } from "@clerk/nextjs";
// import { useRouter } from "next/navigation";
// import axios from "axios";
// import { toast } from "sonner";
// import PlanCard from "./PlanCard";
// import Loading from '@/components/global/loading';

// import { pricingPlans, Plan } from "@/config/planConfig";

// interface PricingSectionProps {
//   currentPlanId: string | null;
// }

// const PricingSection: React.FC<PricingSectionProps> = ({ currentPlanId }) => {
//   const { isSignedIn, user } = useUser();
//   const router = useRouter();
//   const [loading, setLoading] = useState(false);
//   const [currentUserId, setCurrentUserId] = useState<string | null>(null);

//   useEffect(() => {
//     if (user) {
//       setCurrentUserId(user.id);
//     } else {
//       setCurrentUserId(null);
//     }
//   }, [user]);

//   const handleBuy = async (packageId: string) => { // Renamed to handleBuy
//     if (!isSignedIn) {
//       toast.info("Please sign in to purchase packages.");
//       router.push("/sign-in");
//       return;
//     }

//     setLoading(true);
//     try {
//       const response = await axios.post("/api/buy-package", { // Updated API endpoint
//         packageId, // Send packageId
//       });
//       // Assuming the API returns a URL to redirect the user for payment
//       window.location.href = response.data.url;
//     } catch (error: any) {
//       console.error("Purchase error:", error);
//       const message =
//         error.response?.data?.error || "Failed to purchase package. Please try again.";
//       toast.error(message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <section className="container mt-8 flex flex-col items-center text-center">
//       <div className="mx-auto mt-10 flex w-full flex-col gap-5">
//         <p className="font-tajawal text-4xl font-bold text-black">
//           الباقات
//         </p>
//         <h2 className="font-tajawal font-heading text-sm leading-[1.1] md:text-xl text-blue-500">
//           الشراء مرة واحدة ولا يتم التجديد تلقائياً   
//         </h2>
//       </div>

//       <div className="mx-auto grid max-w-screen-lg gap-5 py-5 md:grid-cols-2 lg:grid-cols-3">
//         {pricingPlans.map((plan: Plan) => (
//           <PlanCard
//             key={plan.id}
//             plan={plan}
//             onBuy={handleBuy} // Pass the handleBuy function
//             currentPlanId={currentPlanId}
//           />
//         ))}
//       </div>

//       <p className="mt-3 text-center text-base text-muted-foreground">
//         <Balancer>
//           البريد الالكتروني{" "}
//           <a
//             className="font-medium text-primary hover:underline"
//             href="mailto:admin@arabicocr.net"
//           >
//             admin@sharayeh.com
//           </a>{" "}
//           <br />
//           راسلنا لاي استفسار
//           <br />
//           <strong>جاهزين للرد والدعم</strong>
//         </Balancer>
//       </p>

//       {loading && <Loading />}
//     </section>
//   );
// };

// export default PricingSection;


// // src/components/pricing/PricingSection.tsx

// "use client";

// import { useState, useEffect } from "react";
// import Balancer from "react-wrap-balancer";
// import { useUser } from "@clerk/nextjs";
// import { useRouter } from "next/navigation";
// import axios from "axios";
// import { toast } from "sonner";
// import PlanCard from "./PlanCard";
// import Loading from '@/components/global/loading';

// import { planHierarchy, pricingPlans, Plan } from "@/config/planConfig";

// interface PricingSectionProps {
//   currentPlanId: string | null;
// }

// const PricingSection: React.FC<PricingSectionProps> = ({ currentPlanId }) => {
//   const { isSignedIn, user } = useUser();
//   const router = useRouter();
//   const [loading, setLoading] = useState(false);
//   const [currentUserId, setCurrentUserId] = useState<string | null>(null);

//   useEffect(() => {
//     if (user) {
//       setCurrentUserId(user.id);
//     } else {
//       setCurrentUserId(null);
//     }
//   }, [user]);

//   const handleSubscribe = async (packageId: string) => { // Renamed parameter to packageId
//     if (!isSignedIn) {
//       toast.info("Please sign in to subscribe.");
//       router.push("/sign-in");
//       return;
//     }

//     setLoading(true);
//     try {
//       const response = await axios.post("/api/create-subscription", {
//         packageId, // Send packageId instead of planId
//       });
//       window.location.href = response.data.url;
//     } catch (error: any) {
//       console.error("Subscription error:", error);
//       const message =
//         error.response?.data?.error || "Failed to create subscription. Please try again.";
//       toast.error(message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <section className="container mt-8 flex flex-col items-center text-center">
//       <div className="mx-auto mt-10 flex w-full flex-col gap-5">
//         <p className="font-tajawal text-4xl font-bold text-black">
//           الباقات
//         </p>
//         <h2 className="font-tajawal font-heading text-sm leading-[1.1] md:text-xl text-blue-500">
//          الشراء مرة واحدة ولا يتم التجديد تلقائياً   
//               </h2>
//       </div>

//       <div className="mx-auto grid max-w-screen-lg gap-5 py-5 md:grid-cols-2 lg:grid-cols-3">
//         {pricingPlans.map((plan: Plan) => (
//           <PlanCard
//             key={plan.id}
//             plan={plan}
//             onSubscribe={handleSubscribe}
//             currentPlanId={currentPlanId}
//             planHierarchy={planHierarchy}
//           />
//         ))}
//       </div>

//       <p className="mt-3 text-center text-base text-muted-foreground">
//         <Balancer>
//           البريد الالكتروني{" "}
//           <a
//             className="font-medium text-primary hover:underline"
//             href="mailto:admin@arabicocr.net"
//           >
//             admin@sharayeh.com
//           </a>{" "}
//           <br />
//           راسلنا لاي استفسار
//           <br />
//           <strong>جاهزين للرد والدعم</strong>
//         </Balancer>
//       </p>

//       {loading && <Loading />}
//     </section>
//   );
// };

// export default PricingSection;


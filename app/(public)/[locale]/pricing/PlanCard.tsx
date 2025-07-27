// src/components/pricing/PlanCard.tsx

"use client";

import React from "react";
import Link from "next/link";
import Button from "@/components/ui/Button2";
import * as Icons from "@/components/ui/Icons";

import { Plan } from "./planConfig";

interface PlanCardProps {
  plan: Plan;
  onBuy: (planId: string) => void; // Callback prop for buying a package
  currentPlanId: string | null;
}

const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  onBuy,
  currentPlanId,
}) => {
  // Define the Free plan's id
  const freePlanId = "cm4kcbd6t00007ndb3r9dydrc"; // Free plan ID

  // Determine if this is the user's current plan
  const isCurrentPlan = plan.id === currentPlanId;

  // Determine if this is the Free plan
  const isFreePlan = plan.id === freePlanId;

  // Button Label Helpers
  const getButtonLabel = () => {
    if (isFreePlan) {
      return "لوحة التحكم"; 
    } else {
      return "اشترِ الآن"; // Buy Now
    }
  };

  // Button Action Helpers
  const getButtonAction = () => {
    if (isFreePlan || isCurrentPlan) {
      return (
        <Link href="/dashboard">
          <Button className="w-full">
            {getButtonLabel()}
          </Button>
        </Link>
      );
    } else {
      return (
        <Button
          className="w-full"
          onClick={() => {
            console.log(`Buy Now clicked for packageId: ${plan.id}`);
            onBuy(plan.id); // Handle buy action
          }}
        >
          {getButtonLabel()}
        </Button>
      );
    }
  };

  return (
    <div className="relative flex flex-col overflow-hidden rounded-xl border shadow-sm hover:shadow-md transition-shadow duration-300">
      {/* Highlight Current Plan */}
      {isCurrentPlan && !isFreePlan && (
        <div className="absolute top-2 right-2 bg-green-500 text-white text-l px-2 py-1 rounded">
          الباقة الحالية
        </div>
      )}
      <div className="min-h-[150px] bg-blue-200 p-6 flex flex-col justify-between">
        <p className="font-tajawal text-l font-bold p-6 uppercase tracking-wider text-black">
          {plan.title}
        </p>
        <div className="flex flex-row items-baseline">
          <span className="text-3xl m-2 center font-bold font-tajawal">{plan.price}</span>
          <span className="ml-2 text-xl font-medium">{plan.frequency}</span>
        </div>
      </div>

      <div className="flex flex-col justify-between gap-6 p-6">
        <ul className="space-y-2 text-left text-sm font-medium">
          {plan.features.map((feature, idx) => (
            <li className="flex items-start" key={idx}>
              <Icons.Check className="mr-3 h-5 w-5 text-green-500" />
              <span>{feature}</span>
            </li>
          ))}
          {plan.limitations.map((limitation, idx) => (
            <li className="flex items-start text-muted-foreground" key={idx}>
              <Icons.Close className="mr-3 h-5 w-5 text-red-500" />
              <span>{limitation}</span>
            </li>
          ))}
        </ul>

        {/* Render the appropriate button based on plan type */}
        {getButtonAction()}
      </div>
    </div>
  );
};

export default PlanCard;


// // src/components/pricing/PlanCard.tsx

// "use client";

// import React from "react";
// import Link from "next/link";
// import Button from "@/components/ui/Button2";
// import * as Icons from "@/components/ui/Icons";

// import { Plan } from "@/config/planConfig";

// interface PlanCardProps {
//   plan: Plan;
//   onSubscribe: (planId: string) => void;
//   currentPlanId: string | null;
//   planHierarchy: string[];
// }

// const PlanCard: React.FC<PlanCardProps> = ({
//   plan,
//   onSubscribe,
//   currentPlanId,
//   planHierarchy,
// }) => {
//   // Define the Free plan's id
//   const freePlanId = "cm4kcbd6t00007ndb3r9dydrc"; // Free plan ID

//   // Determine if this is the user's current plan
//   const isCurrentPlan = plan.id === currentPlanId;

//   // Determine if this is the Free plan
//   const isFreePlan = plan.id === freePlanId;

//   // Determine if an upgrade is available for this plan
//   const isUpgradeAvailable = (): boolean => {
//     if (!currentPlanId) {
//       // User is not subscribed; allow subscribing to any paid plan
//       return !isFreePlan;
//     }
//     const currentPlanIndex = planHierarchy.indexOf(currentPlanId);
//     const targetPlanIndex = planHierarchy.indexOf(plan.id);
//     return targetPlanIndex > currentPlanIndex;
//   };

//   // Button Label Helpers
//   const getButtonLabel = () => {
//     if (isFreePlan) {
//       return "لوحة التحكم"; // Dashboard
//     } else if (isCurrentPlan) {
//       return `مشترك في   ${plan.title}`; // You are on [Plan]
//     } else {
//       return `ترقية إلى ${plan.title}`; // Upgrade to [Plan]
//     }
//   };

//   return (
//     <div className="relative flex flex-col overflow-hidden rounded-xl border shadow-sm hover:shadow-md transition-shadow duration-300">
//       {/* Highlight Current Plan */}
//       {isCurrentPlan && !isFreePlan && (
//         <div className="absolute top-2 right-2 bg-green-500 text-white text-l px-2 py-1 rounded">
//           الباقة الحالية
//         </div>
//       )}
//       <div className="min-h-[150px] bg-blue-200 p-6 flex flex-col justify-between">
//         <p className="font-tajawal text-l font-bold p-6 uppercase tracking-wider text-black">
//           {plan.title}
//         </p>
//         <div className="flex flex-row items-baseline">
//           <span className="text-3xl m-2 center font-bold font-tajawal">{plan.price}</span>
//           <span className="ml-2 text-xl font-medium">{plan.frequency}</span>
//         </div>
//       </div>

//       <div className="flex flex-col justify-between gap-6 p-6">
//         <ul className="space-y-2 text-left text-sm font-medium">
//           {plan.features.map((feature, idx) => (
//             <li className="flex items-start" key={idx}>
//               <Icons.Check className="mr-3 h-5 w-5 text-green-500" />
//               <span>{feature}</span>
//             </li>
//           ))}
//           {plan.limitations.map((limitation, idx) => (
//             <li className="flex items-start text-muted-foreground" key={idx}>
//               <Icons.Close className="mr-3 h-5 w-5 text-red-500" />
//               <span>{limitation}</span>
//             </li>
//           ))}
//         </ul>

//         {isFreePlan ? (
//           <Link href="/dashboard">
//             <Button  className="w-full">
//               {getButtonLabel()}
//             </Button>
//           </Link>
//         ) : currentPlanId ? (
//           isCurrentPlan ? (
//             <Link href="/dashboard">
//               <Button  className="w-full">
//                 {getButtonLabel()}
//               </Button>
//             </Link>
//           ) : isUpgradeAvailable() ? (
//             <Button
             
//               className="w-full"
//               onClick={() => onSubscribe(plan.id)} // Pass plan.id here
//             >
//               {getButtonLabel()}
//             </Button>
//           ) : null
//         ) : (
//           <Button
           
//             className="w-full"
//             onClick={() => onSubscribe(plan.id)} // Pass plan.id here
//           >
//             اشترك
//           </Button>
//         )}
//       </div>
//     </div>
//   );
// };

// export default PlanCard;


// // src/components/pricing/PlanCard.tsx

// "use client";

// import React from "react";
// import Link from "next/link";
// import Button from "@/components/ui/Button2";
// import * as Icons from "@/components/ui/Icons";

// import { Plan } from "@/config/planConfig";

// interface PlanCardProps {
//   plan: Plan;
//   onSubscribe: (planId: string) => void;
//   currentPlanId: string | null;
//   planHierarchy: string[];
// }

// const PlanCard: React.FC<PlanCardProps> = ({
//   plan,
//   onSubscribe,
//   currentPlanId,
//   planHierarchy,
// }) => {
//   // Define the Free plan's stripePriceId
//   const freePlanStripePriceId = "price_1QVtmXAlDgxzsK9aFXzqJmSy"; // Replace with your actual Free plan Stripe Price ID

//   // Determine if this is the user's current plan
//   const isCurrentPlan = plan.stripePriceId === currentPlanId;

//   // Determine if this is the Free plan
//   const isFreePlan = plan.stripePriceId === freePlanStripePriceId;

//   // Determine if an upgrade is available for this plan
//   const isUpgradeAvailable = (): boolean => {
//     if (!currentPlanId) {
//       // User is not subscribed; allow subscribing to any paid plan
//       return !isFreePlan;
//     }
//     const currentPlanIndex = planHierarchy.indexOf(currentPlanId);
//     const targetPlanIndex = planHierarchy.indexOf(plan.stripePriceId);
//     return targetPlanIndex > currentPlanIndex;
//   };

//   // Button Label Helpers
//   const getButtonLabel = () => {
//     if (isFreePlan) {
//       return "لوحة التحكم"; // Dashboard
//     } else if (isCurrentPlan) {
//       return `أنت على  ${plan.title}`; // You are on [Plan]
//     } else {
//       return `ترقية إلى ${plan.title}`; // Upgrade to [Plan]
//     }
//   };

//   return (
//     <div className="relative flex flex-col overflow-hidden rounded-xl border shadow-sm hover:shadow-md transition-shadow duration-300">
//       {/* Highlight Current Plan */}
//       {isCurrentPlan && !isFreePlan && (
//         <div className="absolute top-4 right-4 bg-green-500 text-white text-xs px-2 py-1 rounded">
//           الخطة الحالية
//         </div>
//       )}
//       <div className="min-h-[150px] bg-blue-200 p-6 flex flex-col justify-between">
//         <p className="font-urban text-sm font-bold uppercase tracking-wider text-muted-foreground">
//           {plan.title}
//         </p>
//         <div className="flex flex-row items-baseline">
//           <span className="text-3xl font-semibold">{plan.price}</span>
//           <span className="ml-2 text-sm font-medium">/{plan.frequency}</span>
//         </div>
//       </div>

//       <div className="flex flex-col justify-between gap-6 p-6">
//         <ul className="space-y-2 text-left text-sm font-medium">
//           {plan.features.map((feature, idx) => (
//             <li className="flex items-start" key={idx}>
//               <Icons.Check className="mr-3 h-5 w-5 text-green-500" />
//               <span>{feature}</span>
//             </li>
//           ))}
//           {plan.limitations.map((limitation, idx) => (
//             <li className="flex items-start text-muted-foreground" key={idx}>
//               <Icons.Close className="mr-3 h-5 w-5 text-red-500" />
//               <span>{limitation}</span>
//             </li>
//           ))}
//         </ul>

//         {isFreePlan ? (
//           <Link href="/dashboard">
//             <Button variant="primary" className="w-full">
//               {getButtonLabel()}
//             </Button>
//           </Link>
//         ) : currentPlanId ? (
//           isCurrentPlan ? (
//             <Link href="/dashboard">
//               <Button variant="primary" className="w-full">
//                 {getButtonLabel()}
//               </Button>
//             </Link>
//           ) : isUpgradeAvailable() ? (
//             <Button
//               variant="primary"
//               className="w-full"
//               onClick={() => onSubscribe(plan.stripePriceId)}
//             >
//               {getButtonLabel()}
//             </Button>
//           ) : null
//         ) : (
//           <Button
//             variant="primary"
//             className="w-full"
//             onClick={() => onSubscribe(plan.stripePriceId)}
//           >
//             اشترك
//           </Button>
//         )}
//       </div>
//     </div>
//   );
// };

// export default PlanCard;


// // /src/components/Pricing/PlanCard.tsx

// "use client";

// import React from "react";
// import Link from "next/link";
// import Button from "@/components/ui/Button2";
// import * as Icons from "@/components/ui/Icons";

// interface Plan {
//   id: string;
//   title: string;
//   price: string;
//   frequency: string;
//   features: string[];
//   limitations: string[];
// }

// interface PlanCardProps {
//   plan: Plan;
//   onSubscribe: (planId: string) => void;
//   isPro: boolean;
//   currentUserId: string | null;
// }

// const PlanCard: React.FC<PlanCardProps> = ({ plan, onSubscribe, isPro, currentUserId }) => {
//   return (
//     <div
//       className="relative flex flex-col overflow-hidden rounded-xl border shadow-sm hover:shadow-md transition-shadow duration-300"
//     >
//       <div className="min-h-[150px] bg-blue-200 p-6 flex flex-col justify-between">
//         <p className="font-urban text-sm font-bold uppercase tracking-wider text-muted-foreground">
//           {plan.title}
//         </p>
//         <div className="flex flex-row items-baseline">
//           <span className="text-3xl font-semibold">{plan.price}</span>
//           <span className="ml-2 text-sm font-medium">/{plan.frequency}</span>
//         </div>
//       </div>

//       <div className="flex flex-col justify-between gap-6 p-6">
//         <ul className="space-y-2 text-left text-sm font-medium">
//           {plan.features.map((feature, idx) => (
//             <li className="flex items-start" key={idx}>
//               <Icons.Check className="mr-3 h-5 w-5 text-green-500" />
//               <span>{feature}</span>
//             </li>
//           ))}
//           {plan.limitations.map((limitation, idx) => (
//             <li className="flex items-start text-muted-foreground" key={idx}>
//               <Icons.Close className="mr-3 h-5 w-5 text-red-500" />
//               <span>{limitation}</span>
//             </li>
//           ))}
//         </ul>

//         {currentUserId ? (
//           plan.id === "cm4kcbd6t00007ndb3r9dydrc" ? ( // Assuming "starter" plan ID
//             <Link href="/dashboard">
//               <Button variant="primary" className="w-full">
//                 لوحة التحكم
//               </Button>
//             </Link>
//           ) : (
//             <Button
//               variant="primary"
//               className="w-full"
//               onClick={() => onSubscribe(plan.id)}
//               disabled={isPro}
//             >
//               {isPro ? "You are Pro" : "Upgrade"}
//             </Button>
//           )
//         ) : (
//           <Link href="/sign-up">
//             <Button variant="secondary" className="w-full">
//               التسجيل
//             </Button>
//           </Link>
//         )}
//       </div>
//     </div>
//   );
// };

// export default PlanCard;




// // /src/components/Pricing/PlanCard.tsx

// "use client";

// import { FC } from "react";
// import Button from "@/components/ui/Button2";

// interface Plan {
//   id: string;
//   name: string;
//   price: number;
// }

// interface PlanCardProps {
//   plan: Plan;
//   onSubscribe: (planId: string) => void;
// }

// const PlanCard: FC<PlanCardProps> = ({ plan, onSubscribe }) => {
//   return (
//     <div className="flex flex-col border rounded-lg shadow-sm p-6 w-80 hover:shadow-md transition-shadow duration-300">
//       <h4 className="text-xl font-semibold mb-4">{plan.name}</h4>
//       <p className="text-3xl font-bold mb-6">${plan.price}/month</p>
//       <ul className="mb-6 space-y-2">
//         {/* Example features, replace with actual data */}
//         <li className="flex items-center">
//           <span className="text-green-500 mr-2">✔️</span>
//           Feature 1
//         </li>
//         <li className="flex items-center">
//           <span className="text-green-500 mr-2">✔️</span>
//           Feature 2
//         </li>
//         <li className="flex items-center">
//           <span className="text-green-500 mr-2">✔️</span>
//           Feature 3
//         </li>
//       </ul>
//       <Button onClick={() => onSubscribe(plan.id)} variant="primary" className="w-full">
//         Subscribe
//       </Button>
//     </div>
//   );
// };

// export default PlanCard;

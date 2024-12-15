// /src/components/Pricing/PlanCard.tsx

"use client";

import { FC } from "react";
import Button from "@/components/ui/Button2";

interface Plan {
  id: string;
  name: string;
  price: number;
}

interface PlanCardProps {
  plan: Plan;
  onSubscribe: (planId: string) => void;
}

const PlanCard: FC<PlanCardProps> = ({ plan, onSubscribe }) => {
  return (
    <div className="flex flex-col border rounded-lg shadow-sm p-6 w-80 hover:shadow-md transition-shadow duration-300">
      <h4 className="text-xl font-semibold mb-4">{plan.name}</h4>
      <p className="text-3xl font-bold mb-6">${plan.price}/month</p>
      <ul className="mb-6 space-y-2">
        {/* Example features, replace with actual data */}
        <li className="flex items-center">
          <span className="text-green-500 mr-2">✔️</span>
          Feature 1
        </li>
        <li className="flex items-center">
          <span className="text-green-500 mr-2">✔️</span>
          Feature 2
        </li>
        <li className="flex items-center">
          <span className="text-green-500 mr-2">✔️</span>
          Feature 3
        </li>
      </ul>
      <Button onClick={() => onSubscribe(plan.id)} variant="primary" className="w-full">
        Subscribe
      </Button>
    </div>
  );
};

export default PlanCard;

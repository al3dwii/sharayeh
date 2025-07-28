// components/SubscriptionPlans.tsx

'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';
import PlanCard from './PlanCard';

const SubscriptionPlans = () => {
  const { isSignedIn } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // // Fetch plans dynamically from the server or define them statically
  // // It's recommended to fetch plans from the server to ensure consistency
  // const plans = [
  //   { id: 'price_1Hh1XYZ...', name: 'Free', price: 0 },
  //   { id: 'price_1Hh2ABC...', name: 'Standard', price: 10 },
  //   { id: 'price_1Hh3DEF...', name: 'Premium', price: 25 },
  // ];

    // Use the plan IDs that exist in your database as strings
  const plans = [
    { id: 'cm4kcbd6t00007ndb3r9dydrc', name: 'Free', price: 0 },
    { id: 'cm4kcbe5u00017ndbe7dphuoo', name: 'Standard', price: 10 },
    { id: 'cm4kcbeop00027ndbbg8k20me', name: 'Premium', price: 25 },
  ];

  const handleSubscribe = async (planId: string) => {
    if (!isSignedIn) {
      router.push('/sign-in');
      return;
    }

    setLoading(true);
    try {
      // Initiate subscription by calling the server-side API
      const response = await axios.post('/api/create-subscription', {
        planId, // Only send planId; userId is derived server-side
      });
      // Redirect the user to Stripe Checkout
      window.location.href = response.data.url;
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error('Failed to create subscription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col md:flex-row justify-center items-center gap-6 p-4">
        {plans.map(plan => (
          <PlanCard key={plan.id} plan={plan} onSubscribe={handleSubscribe} />
        ))}
      </div>
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="loader">Loading...</div>
        </div>
      )}
    </>
  );
};

export default SubscriptionPlans;


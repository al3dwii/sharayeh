'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';
import PlanCard from './PlanCard';

const SubscriptionPlans = () => {
  const { isSignedIn, user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Use the plan IDs that exist in your database as strings
  const plans = [
    { id: 'cm4ijzevp00008ys5enalik51', name: 'Free', price: 0 },
    { id: 'cm4ijzfm500018ys5lfls9223', name: 'Standard', price: 10 },
    { id: 'cm4ijzg3700028ys5w7agup9y', name: 'Premium', price: 25 },
  ];

  const handleSubscribe = async (planId: string) => {
    if (!isSignedIn) {
      router.push('/sign-in');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/create-subscription', {
        planId,
        userId: user.id,
      });
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
      {loading && <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center">
        <div className="loader">Loading...</div>
      </div>}
    </>
  );
};

export default SubscriptionPlans;


// ///Users/omair/shraih/src/components/SubscriptionPlans.tsx

// 'use client';

// import { useState } from 'react';
// import { useUser } from '@clerk/nextjs';
// import { useRouter } from 'next/navigation';
// import axios from 'axios';
// import { toast } from 'sonner';
// import PlanCard from './PlanCard';

// const SubscriptionPlans = () => {
//   const { isSignedIn, user } = useUser();
//   const router = useRouter();
//   const [loading, setLoading] = useState(false);

//   const plans = [
//     { id: 'cm4ieqz970000mw1r3u8sga62', name: 'Free', price: 0 },
//     { id: 'cm4ier04w0001mw1r7huqcv4g', name: 'Standard', price: 10 },
//     { id: 'cm4ier0nc0002mw1rx21i4618', name: 'Premium', price: 25 },
//   ];

//   const handleSubscribe = async (planId) => {
//     if (!isSignedIn) {
//       router.push('/sign-in');
//       return;
//     }

//     setLoading(true);
//     try {
//       const response = await axios.post('/api/create-subscription', {
//         planId,
//         userId: user.id, // Ensure userId is sent securely
//       });
//       window.location.href = response.data.url;
//     } catch (error) {
//       console.error('Subscription error:', error);
//       toast.error('Failed to create subscription. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <>
     
//       <div className="flex flex-col md:flex-row justify-center items-center gap-6 p-4">
//         {plans.map(plan => (
//           <PlanCard key={plan.id} plan={plan} onSubscribe={handleSubscribe} />
//         ))}
//       </div>
//       {loading && <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center">
//         <div className="loader">Loading...</div>
//       </div>}
//     </>
//   );
// };

// export default SubscriptionPlans;


// // app/components/SubscriptionPlans.js

// 'use client';

// import { useUser } from '@clerk/nextjs';
// import { useRouter } from 'next/navigation';
// import axios from 'axios';

// const SubscriptionPlans = () => {
//   const { isSignedIn } = useUser();
//   const router = useRouter();

//   const plans = [
//     { id: '1', name: 'Free', price: 0 },
//     { id: '2', name: 'Standard', price: 10 },
//     { id: '3', name: 'Premium', price: 25 },
//   ];

//   const handleSubscribe = async (planId) => {
//     if (!isSignedIn) {
//       router.push('/sign-in');
//       return;
//     }

//     try {
//       const response = await axios.post('/api/create-subscription', { planId });
//       window.location.href = response.data.url;
//     } catch (error) {
//       console.error('Subscription error:', error);
//       alert('Failed to create subscription.');
//     }
//   };

//   return (
//     <div className="flex flex-col md:flex-row justify-center items-center gap-6 p-4">
//       {plans.map(plan => (
//         <div key={plan.id} className="border p-6 rounded-lg shadow-lg w-64 text-center">
//           <h2 className="text-2xl font-bold">{plan.name}</h2>
//           <p className="mt-4 text-xl">${plan.price === 0 ? 'Free' : `${plan.price} / month`}</p>
//           <button
//             onClick={() => handleSubscribe(plan.id)}
//             className="mt-6 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
//           >
//             {plan.price === 0 ? 'Start Free' : 'Subscribe'}
//           </button>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default SubscriptionPlans;

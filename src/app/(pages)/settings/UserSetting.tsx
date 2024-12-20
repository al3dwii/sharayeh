'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ClientToast from '@/components/custom/ClientToast';
import SubscriptionCard from '@/components/SubscriptionCard';
import CreditsCard from '@/components/CreditsCard';
import CreditTransactionsCard from '@/components/CreditTransactionsCard';

interface UserSettingProps {
  userId: string;
  isPro: boolean;
  onUpdate?: () => void;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  UserCredits: {
    credits: number;
    usedCredits: number;
    createdAt: string;
    updatedAt: string;
  } | null;
  UserSubscription: {
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    stripePriceId?: string;
    stripeCurrentPeriodEnd?: string;
    createdAt: string;
    updatedAt: string;
  } | null;
  CreditTransactions: Array<{
    type: string;
    amount: number;
    description: string;
    timestamp: string;
  }>;
  Files: Array<{
    id: number;
    fileName: string;
    fileUrl: string;
    type: string;
    status: string;
    createdAt: string;
  }>;
  Subscriptions: Array<{
    plan: {
      name: string;
      price: number;
      credits: number;
      presentations: number;
      slidesPerPresentation: number;
      canAddTransition: boolean;
      canUploadPDF: boolean;
    };
  }>;
  // Add other user-related fields as necessary
}

const UserSetting: React.FC<UserSettingProps> = ({ onUpdate }) => { // Destructure onUpdate
  const [user, setUser] = useState<UserData | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    // Add other fields as necessary
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState<boolean>(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await axios.get('/api/userSetting');
      setUser(response.data);
      setFormData({
        name: response.data.name || '',
        email: response.data.email || '',
        // Populate other fields as necessary
      });
    } catch (err: any) {
      console.error('Error fetching user data:', err);
      setError(err.response?.data?.error || 'Failed to load user data.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.put('/api/userSetting', formData);
      setUser(response.data);
      setShowToast(true);
      
      // Call onUpdate if provided
      if (onUpdate) {
        onUpdate();
      }
    } catch (err: any) {
      console.error('Error updating user data:', err);
      setError(err.response?.data?.error || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  if (error && !user) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!user) {
    return <div className="text-gray-500">Loading user data...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-md">
      <h2 className="text-2xl font-semibold mb-6">إعدادات المستخدم</h2>

      {error && <div className="mb-4 text-red-500">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            الاسم
          </label>
          <input
            type="text"
            name="name"
            id="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="أدخل اسمك"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            البريد الإلكتروني
          </label>
          <input
            type="email"
            name="email"
            id="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="أدخل بريدك الإلكتروني"
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Add other fields as necessary */}

        <button
          type="submit"
          disabled={loading}
          className={`w-full px-4 py-2 font-semibold text-white rounded-md ${
            loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'جارٍ التحديث...' : 'تحديث الملف الشخصي'}
        </button>
      </form>

      {/* Subscription and Credits Cards */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Subscription Card */}
        <SubscriptionCard subscription={user.UserSubscription} />

        {/* Credits Card */}
        <CreditsCard userCredits={user.UserCredits} />
      </div>

      {/* Credit Transactions Card */}
      <div className="mt-8">
        <CreditTransactionsCard transactions={user.CreditTransactions} />
      </div>

      {showToast && (
        <ClientToast
          message="تم تحديث الملف الشخصي بنجاح!"
          onClose={() => setShowToast(false)} // Ensure ClientToast accepts onClose
        />
      )}
    </div>
  );
};

export default UserSetting;


// 'use client'

// import { Zap } from "lucide-react";
// import { useEffect, useState } from "react";
// import { useUser } from '@clerk/nextjs';
// import axios from 'axios';
// import { useRouter } from 'next/navigation'; // <-- Import here

// import { Card, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Progress } from "@/components/ui/progress";
// import { useProModal } from "@/hooks/use-pro-modal";
// import { useStore } from '@/store/useStore';

// import Skel from '@/components/global/Skeleton'

// export const UserSetting = ({
//   isPro = true,
// }: {
//   isPro: boolean,
// }) => {
//   const [mounted, setMounted] = useState(false);
//   const [isLoading, setIsLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);

//   const { user, isLoaded } = useUser();
//   const proModal = useProModal();
//   const router = useRouter(); // <-- Use router

//   const credits = useStore((state) => state.credits);
//   const usedCredits = useStore((state) => state.usedCredits);
//   const setCredits = useStore((state) => state.setCredits);
//   const setUsedCredits = useStore((state) => state.setUsedCredits);

//   useEffect(() => {
//     setMounted(true);

//     // If you want to trigger a refresh right after the component mounts:
//     // This will cause any server components data to be refetched
//     router.refresh();
//   }, [router]);

//   useEffect(() => {
//     const fetchUserCredits = async () => {
//       if (!isLoaded) return;

//       if (!user) {
//         setError("User not authenticated.");
//         setIsLoading(false);
//         return;
//       }

//       try {
//         const response = await axios.get(`/api/user-data`);
//         const { credits, usedCredits } = response.data;
//         setCredits(credits);
//         setUsedCredits(usedCredits);
//         setIsLoading(false);
//       } catch (err: any) {
//         console.error('Error fetching user credits:', err);
//         setError("Failed to fetch credit data.");
//         setIsLoading(false);
//       }
//     };

//     fetchUserCredits();
//   }, [user, isLoaded, setCredits, setUsedCredits]);

//   useEffect(() => {
//     console.log("User data in FreeCounter:", user);
//   }, [user]);

//   if (!mounted) {
//     return null;
//   }

//   if (isLoading) {
//     return (
//       <div className="px-3">
//         <Card className="bg-blue-200 border-0">
//           <CardContent className="py-6">
//             <Skel />
//           </CardContent>
//         </Card>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="px-3">
//         <Card className="bg-red-200 border-0">
//           <CardContent className="py-6">
//             <p className="text-center text-sm text-red-800">{error}</p>
//           </CardContent>
//         </Card>
//       </div>
//     );
//   }

//   const totalCredits = (credits ?? 0) + (usedCredits ?? 0);
//   const progressValue = totalCredits > 0
//     ? ((usedCredits ?? 0) / totalCredits) * 100
//     : 0;

//   return (
//     <div className="m-auto px-3 max-w-[800px]">
//       <Card className="bg-blue-100 border-0">
//         <CardContent className="py-6">
//           <div className="text-center text-sm text-black mb-4 space-y-2">
//             <p>
//               النقاط المستخدمة: {usedCredits ?? 0} / إجمالي النقاط: {totalCredits}
//             </p>
//             <Progress className="h-3" value={progressValue} />
//           </div>

//           {!isPro && (
//             <div className="flex justify-center">
//               <Button onClick={proModal.onOpen} className="w-40 bg-blue-500">
//                 ترقية الباقة
//                 <Zap className="w-4 h-4 mr-4 fill-white" />
//               </Button>
//             </div>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// };



// // No 'use client' here. This is a pure server component.

// // Import server-only utilities
// import { auth } from '@clerk/nextjs';
// import { Card, CardContent } from "@/components/ui/card";
// import { Progress } from "@/components/ui/progress";
// import { Zap } from "lucide-react";
// import { Button } from "@/components/ui/button";

// interface UserInfoProps {
//   isPro?: boolean;
// }

// export const UserInfo = async ({ isPro = true }: UserInfoProps) => {
//   // Await the auth call since it’s async
//   const { userId } = auth();

//   if (!userId) {
//     return (
//       <div className="px-3">
//         <Card className="bg-red-200 border-0">
//           <CardContent className="py-6">
//             <p className="text-center text-sm text-red-800">User not authenticated.</p>
//           </CardContent>
//         </Card>
//       </div>
//     );
//   }

//   // Fetch user data from an API route or directly from a database
//   // Note: fetch() in a server component is run on the server at request time.
//   const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/user-data`, {
//     // Ensure no caching if you want the freshest data
//     cache: 'no-store'
//   });

//   if (!res.ok) {
//     return (
//       <div className="px-3">
//         <Card className="bg-red-200 border-0">
//           <CardContent className="py-6">
//             <p className="text-center text-sm text-red-800">Failed to fetch credit data.</p>
//           </CardContent>
//         </Card>
//       </div>
//     );
//   }

//   const { credits, usedCredits } = await res.json();
  
//   const totalCredits = (credits ?? 0) + (usedCredits ?? 0);
//   const progressValue = totalCredits > 0 ? ((usedCredits ?? 0) / totalCredits) * 100 : 0;

//   return (
//     <div className="m-auto px-3 max-w-[800px]">
//       <Card className="bg-blue-100 border-0">
//         <CardContent className="py-6">
//           <div className="text-center text-sm text-black mb-4 space-y-2">
//             <p>
//               النقاط المستخدمة: {usedCredits ?? 0} / إجمالي النقاط: {totalCredits}
//             </p>
//             <Progress className="h-3" value={progressValue} />
//           </div>

//           {!isPro && (
//             <div className="flex justify-center">
//               {/* This button can open a modal, but modal logic should be in a client component */}
//               <Button className="w-40 bg-blue-500">
//                 ترقية الباقة
//                 <Zap className="w-4 h-4 mr-4 fill-white" />
//               </Button>
//             </div>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// };




// 'use client';
// import { Zap } from "lucide-react";
// import { useEffect, useState } from "react";
// import { useUser } from '@clerk/nextjs'; // Correct client-side hook
// import axios from 'axios';

// import { Card, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Progress } from "@/components/ui/progress";
// import { useProModal } from "@/hooks/use-pro-modal";
// import { useStore } from '@/store/useStore'; // Import the global store

// import Skel from '@/components/global/Skeleton'


// export const FreeCounter = ({
//   isPro = true,
// }: {
//   isPro: boolean,
// }) => {
//   const [mounted, setMounted] = useState(false);
//   const [isLoading, setIsLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);

//   const { user, isLoaded } = useUser(); // Access user data and loading state
//   const proModal = useProModal();

//   // Subscribe to the global store
//   const credits = useStore((state) => state.credits);
//   const usedCredits = useStore((state) => state.usedCredits);
//   const setCredits = useStore((state) => state.setCredits);
//   const setUsedCredits = useStore((state) => state.setUsedCredits);

//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   useEffect(() => {
//     const fetchUserCredits = async () => {
//       if (!isLoaded) return; // Wait until user data is loaded

//       if (!user) {
//         setError("User not authenticated.");
//         setIsLoading(false);
//         return;
//       }

//       try {
//         // Fetch user credits
//         const response = await axios.get(`/api/user-data`);
//         const { credits, usedCredits } = response.data;
//         setCredits(credits);
//         setUsedCredits(usedCredits);
//         setIsLoading(false);
//       } catch (err: any) {
//         console.error('Error fetching user credits:', err);
//         setError("Failed to fetch credit data.");
//         setIsLoading(false);
//       }
//     };

//     fetchUserCredits();
//   }, [user, isLoaded, setCredits, setUsedCredits]);

//   // Debugging: Log user data
//   useEffect(() => {
//     console.log("User data in FreeCounter:", user);
//   }, [user]);

//   if (!mounted) {
//     return null;
//   }


//   if (isLoading) {
//     return (
//       <div className="px-3  ">
//         <Card className="bg-blue-200  border-0">
//           <CardContent className="py-6">
//           <Skel></Skel>

//           </CardContent>
//         </Card>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="px-3 ">
//         <Card className="bg-red-200 border-0">
//           <CardContent className="py-6">
//             <p className="text-center text-sm text-red-800">{error}</p>
//           </CardContent>
//         </Card>
//       </div>
//     );
//   }

//   return (
    
// <div className=" m-auto px-3 max-w-[800px] ">
// <Card className="bg-blue-100 border-0">
//         <CardContent className="py-6 ">
//           <div className="text-center text-sm text-black mb-4 space-y-2">
//             <p>
//               {/* Used Credits: {usedCredits ?? 0} / Total Credits: {(credits ?? 0) + (usedCredits ?? 0)} */}
//               النقاط المستخدمة: {usedCredits ?? 0} / إجمالي النقاط: {(credits ?? 0) + (usedCredits ?? 0)}

//             </p>
//             <Progress
//               className="h-3"
//               value={
//                 credits !== null && usedCredits !== null
//                   ? (usedCredits / (credits + usedCredits)) * 100
//                   : 0 // Default to 0 if either value is null
//               }
//             />
//           </div>

      
//           {!isPro && (
//             <div className="flex justify-center">
//             <Button onClick={proModal.onOpen} className="w-40  bg-blue-500">
//               ترقية الباقة
//               <Zap className="w-4 h-4 mr-4 fill-white" />
//             </Button>
//             </div>
//           )}
          
//         </CardContent>
//       </Card>
//     </div>
//   );
// };


// 'use client';
// import { Zap } from "lucide-react";
// import { useEffect, useState } from "react";
// import { useUser } from '@clerk/nextjs'; // Correct client-side hook
// import axios from 'axios';

// import { Card, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Progress } from "@/components/ui/progress";
// import { useProModal } from "@/hooks/use-pro-modal";

// export const FreeCounter = ({
//   isPro = false,
// }: {
//   isPro: boolean,
// }) => {
//   const [mounted, setMounted] = useState(false);
//   const [credits, setCredits] = useState<number | null>(null);
//   const [usedCredits, setUsedCredits] = useState<number | null>(null);
//   const [maxCredits, setMaxCredits] = useState<number>(0);
//   const [isLoading, setIsLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);

//   const { user, isLoaded } = useUser(); // Access user data and loading state
//   const proModal = useProModal();

//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   useEffect(() => {
//     const fetchUserCredits = async () => {
//       if (!isLoaded) return; // Wait until user data is loaded

//       if (!user) {
//         setError("User not authenticated.");
//         setIsLoading(false);
//         return;
//       }

//       try {
//         // Now, since the server extracts userId, no need to pass it
//         const response = await axios.get(`/api/user-data`);
//         const { credits, usedCredits } = response.data;
//         setCredits(credits);
//         setUsedCredits(usedCredits);
//         setMaxCredits(credits + usedCredits);
//         setIsLoading(false);
//       } catch (err: any) {
//         console.error('Error fetching user credits:', err);
//         setError("Failed to fetch credit data.");
//         setIsLoading(false);
//       }
//     };

//     fetchUserCredits();
//   }, [user, isLoaded]);

//   // Debugging: Log user data
//   useEffect(() => {
//     console.log("User data in FreeCounter:", user);
//   }, [user]);

//   if (!mounted) {
//     return null;
//   }

//   if (isPro) {
//     return null;
//   }

//   if (isLoading) {
//     return (
//       <div className="px-3">
//         <Card className="bg-blue-200 border-0">
//           <CardContent className="py-6">
//             <p className="text-center text-sm text-black">Loading credits...</p>
//           </CardContent>
//         </Card>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="px-3">
//         <Card className="bg-red-200 border-0">
//           <CardContent className="py-6">
//             <p className="text-center text-sm text-red-800">{error}</p>
//           </CardContent>
//         </Card>
//       </div>
//     );
//   }

//   return (
//     <div className="px-3">
//       <Card className="bg-blue-100 border-0">
//         <CardContent className="py-6">
//           <div className="text-center text-sm text-black mb-4 space-y-2">
//             <p>
//               Used Credits: {usedCredits} / Total Credits: {maxCredits}
//             </p>
//             <Progress className="h-3" value={(usedCredits / maxCredits) * 100} />
//           </div>
//           <Button onClick={proModal.onOpen}  className="w-40 bg-blue-500 ">
//             Upgrade
//             <Zap className="w-4 h-4 ml-2 fill-white" />
//           </Button>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };



// 'use client';
// import { Zap } from "lucide-react";
// import { useEffect, useState } from "react";
// import { useUser } from '@clerk/nextjs';
// import axios from 'axios';

// import { Card, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Progress } from "@/components/ui/progress";
// import { useProModal } from "@/hooks/use-pro-modal";

// export const FreeCounter = ({
//   isPro = false,
// }: {
//   isPro: boolean,
// }) => {
//   const [mounted, setMounted] = useState(false);
//   const [credits, setCredits] = useState<number | null>(null);
//   const [usedCredits, setUsedCredits] = useState<number | null>(null);
//   const [maxCredits, setMaxCredits] = useState<number>(0);
//   const [isLoading, setIsLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);

//   const { user } = useUser(); // Correctly using useUser hook for client-side
//   const proModal = useProModal();

//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   useEffect(() => {
//     const fetchUserCredits = async () => {
//       if (!user?.id) {
//         setError("User not authenticated.");
//         setIsLoading(false);
//         return;
//       }
//       try {
//         const response = await axios.get(`/api/user-data?userId=${user.id}`);
//         const { credits, usedCredits } = response.data;
//         setCredits(credits);
//         setUsedCredits(usedCredits);
//         setMaxCredits(credits + usedCredits);
//         setIsLoading(false);
//       } catch (err: any) {
//         console.error('Error fetching user credits:', err);
//         setError("Failed to fetch credit data.");
//         setIsLoading(false);
//       }
//     };

//     fetchUserCredits();
//   }, [user]);

//   if (!mounted) {
//     return null;
//   }

//   if (isPro) {
//     return null;
//   }

//   if (isLoading) {
//     return (
//       <div className="px-3">
//         <Card className="bg-blue-200 border-0">
//           <CardContent className="py-6">
//             <p className="text-center text-sm text-black">Loading credits...</p>
//           </CardContent>
//         </Card>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="px-3">
//         <Card className="bg-red-200 border-0">
//           <CardContent className="py-6">
//             <p className="text-center text-sm text-red-800">{error}</p>
//           </CardContent>
//         </Card>
//       </div>
//     );
//   }

//   return (
//     <div className="px-3">
//       <Card className="bg-blue-200 border-0">
//         <CardContent className="py-6">
//           <div className="text-center text-sm text-black mb-4 space-y-2">
//             <p>
//               Used Credits: {usedCredits} / Total Credits: {maxCredits}
//             </p>
//             <Progress className="h-3" value={(usedCredits / maxCredits) * 100} />
//           </div>
//           <Button onClick={proModal.onOpen} variant="premium" className="w-full">
//             Upgrade
//             <Zap className="w-4 h-4 ml-2 fill-white" />
//           </Button>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };


// 'use client'
// import { Zap } from "lucide-react";
// import { useEffect, useState } from "react";

// import { MAX_FREE_COUNTS } from "@/constants";
// import { Card, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Progress } from "@/components/ui/progress";
// import { useProModal } from "@/hooks/use-pro-modal";

// export const FreeCounter = ({
//   isPro = false,
//   apiLimitCount = 0,
// }: {
//   isPro: boolean,
//   apiLimitCount: number
// }) => {
//   const [mounted, setMounted] = useState(false);
//   const proModal = useProModal();

//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   if (!mounted) {
//     return null;
//   }
  

//   if (isPro) {
//     return null;
//   }

//   return (
//     <div className="px-3">
//       <Card className="bg-blue-200 border-0">
//         <CardContent className="py-6">
//           <div className="text-center text-sm text-black mb-4 space-y-2">
//             <p>
//               {apiLimitCount} / {MAX_FREE_COUNTS} Free Generations
//             </p>
//             <Progress className="h-3" value={(apiLimitCount / MAX_FREE_COUNTS) * 100} />
//           </div>
//           <Button onClick={proModal.onOpen} variant="premium" className="w-full">
//             Upgrade
//             <Zap className="w-4 h-4 ml-2 fill-white" />
//           </Button>
//         </CardContent>
//       </Card>
//     </div>
//   )
// }
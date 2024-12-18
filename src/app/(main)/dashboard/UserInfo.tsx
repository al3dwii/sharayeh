
'use client'

import { Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { useUser } from '@clerk/nextjs';
import axios from 'axios';
import { useRouter } from 'next/navigation'; // <-- Import here

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useProModal } from "@/hooks/use-pro-modal";
import { useStore } from '@/store/useStore';

import Skel from '@/components/global/Skeleton'

export const UserInfo = ({
  isPro = true,
}: {
  isPro: boolean,
}) => {
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { user, isLoaded } = useUser();
  const proModal = useProModal();
  const router = useRouter(); // <-- Use router

  const credits = useStore((state) => state.credits);
  const usedCredits = useStore((state) => state.usedCredits);
  const setCredits = useStore((state) => state.setCredits);
  const setUsedCredits = useStore((state) => state.setUsedCredits);

  useEffect(() => {
    setMounted(true);

    // If you want to trigger a refresh right after the component mounts:
    // This will cause any server components data to be refetched
    router.refresh();
  }, [router]);

  useEffect(() => {
    const fetchUserCredits = async () => {
      if (!isLoaded) return;

      if (!user) {
        setError("User not authenticated.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get(`/api/user-data`);
        const { credits, usedCredits } = response.data;
        setCredits(credits);
        setUsedCredits(usedCredits);
        setIsLoading(false);
      } catch (err: any) {
        console.error('Error fetching user credits:', err);
        setError("Failed to fetch credit data.");
        setIsLoading(false);
      }
    };

    fetchUserCredits();
  }, [user, isLoaded, setCredits, setUsedCredits]);

  useEffect(() => {
    console.log("User data in FreeCounter:", user);
  }, [user]);

  if (!mounted) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="px-3">
        <Card className="bg-blue-200 border-0">
          <CardContent className="py-6">
            <Skel />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-3">
        <Card className="bg-red-200 border-0">
          <CardContent className="py-6">
            <p className="text-center text-sm text-red-800">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalCredits = (credits ?? 0) + (usedCredits ?? 0);
  const progressValue = totalCredits > 0
    ? ((usedCredits ?? 0) / totalCredits) * 100
    : 0;

  return (
    <div className="m-auto px-3 max-w-[800px]">
      <Card className="bg-blue-100 border-0">
        <CardContent className="py-6">
          <div className="text-center text-sm text-black mb-4 space-y-2">
            <p>
              النقاط المستخدمة: {usedCredits ?? 0} / إجمالي النقاط: {totalCredits}
            </p>
            <Progress className="h-3" value={progressValue} />
          </div>

          {!isPro && (
            <div className="flex justify-center">
              <Button onClick={proModal.onOpen} className="w-40 bg-blue-500">
                ترقية الباقة
                <Zap className="w-4 h-4 mr-4 fill-white" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

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
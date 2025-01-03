'use client'

import { Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { useUser } from '@clerk/nextjs';
import axios from 'axios';
import { useRouter } from 'next/navigation';

import { Card, CardContent } from "@/components/ui/card";
import Button from "@/components/ui/Button2";
import { Progress } from "@/components/ui/progress";
import { useProModal } from "@/hooks/use-pro-modal";
import { useStore } from '@/store/useStore';
import { useGlobalStore } from '@/store/useGlobalStore';

import Link from 'next/link';
import Skel from '@/components/global/Skeleton'

export const UserInfo = () => {
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Global store to decide if we re-fetch user data
  const shouldRefreshUserInfo = useGlobalStore((state) => state.shouldRefreshUserInfo);
  const setShouldRefreshUserInfo = useGlobalStore((state) => state.setShouldRefreshUserInfo);

  const { user, isLoaded } = useUser();
  const proModal = useProModal();
  const router = useRouter();

  const credits = useStore((state) => state.credits);
  const usedCredits = useStore((state) => state.usedCredits);
  const setCredits = useStore((state) => state.setCredits);
  const setUsedCredits = useStore((state) => state.setUsedCredits);


  // 1) Modify fetchUserCredits to accept a retryCount parameter:
const fetchUserCredits = async (retryCount = 0) => {
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
    console.error(`Error fetching user credits (attempt #${retryCount + 1})`, err);

    // 2) If the retryCount is still below 3, wait 2 seconds, then retry
    if (retryCount < 2) {
      setTimeout(() => {
        fetchUserCredits(retryCount + 1);
      }, 2000);
    } else {
      // 3) After 3 attempts, give up and show the error
      setError("Failed to fetch credit data.");
      setIsLoading(false);
    }
  }
};


  // // 1) Define fetchUserCredits at the top level
  // const fetchUserCredits = async () => {
  //   if (!isLoaded) return;

  //   if (!user) {
  //     setError("User not authenticated.");
  //     setIsLoading(false);
  //     return;
  //   }

  //   try {
  //     const response = await axios.get(`/api/user-data`);
  //     const { credits, usedCredits } = response.data;
  //     setCredits(credits);
  //     setUsedCredits(usedCredits);
  //     setIsLoading(false);
  //   } catch (err: any) {
  //     console.error('Error fetching user credits:', err);
  //     setError("Failed to fetch credit data.");
  //     setIsLoading(false);
  //   }
  // };

  useEffect(() => {
    setMounted(true);
    // Optionally refresh server components on mount
    router.refresh();
  }, [router]);

  // 2) Call fetchUserCredits when the component is ready
  useEffect(() => {
    fetchUserCredits();
  }, [isLoaded, user]); // run when user data becomes available

  // 3) Re-fetch if the global store says we need to refresh
  useEffect(() => {
    if (shouldRefreshUserInfo) {
      fetchUserCredits(); // <-- Now this function is in scope!
      setShouldRefreshUserInfo(false);
    }
  }, [shouldRefreshUserInfo, setShouldRefreshUserInfo]);

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
          <div className="flex justify-center">
            <Link href="/pricing">
              <Button className="w-40 bg-blue-500 flex items-center justify-center">
                اضافة رصيد 
                <Zap className="w-4 h-4 mr-2 fill-white" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};


// // /Users/omair/sharayeh/src/app/(main)/dashboard/UserInfo.tsx
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

// import Link from 'next/link';


// import Skel from '@/components/global/Skeleton'

// export const UserInfo = () => {
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
//             <div className="flex justify-center">
//             <Link href="/pricing">
//           <Button className="w-40 bg-blue-500 flex items-center justify-center">
//             اضافة رصيد 
//             <Zap className="w-4 h-4 mr-2 fill-white" />
//           </Button>
//         </Link>
//             </div>
          
//         </CardContent>
//       </Card>
//     </div>
//   );
// };


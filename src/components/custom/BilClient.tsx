"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { SubscriptionForm } from "./subscription-form"; // Ensure this path is correct

interface Subscription {
  plan: string | null;
  endsAt: Date | null;
}

interface BilandPagesClientProps {
  userId: string;
  subscription: Subscription | null;
}

export default function BilandPagesClient({ userId, subscription }: BilandPagesClientProps) {
  return (
    <div className="mt-2 grid grid-cols-1 gap-6 sm:grid-cols-2">
      {/* Billing Section */}
      <Card className="bg-blue-200">
        <CardContent className="p-4">
          {subscription ? (
            <p dangerouslySetInnerHTML={{ __html: generateSubscriptionMessage(subscription) }} />
          ) : (
            <p>No subscription found.</p>
          )}
        </CardContent>
        <CardFooter>
          <SubscriptionForm hasSubscription={!!subscription} />
        </CardFooter>
      </Card>

      {/* Pages Info Section */}
      <PagesInfo userId={userId} />
    </div>
  );
}

function PagesInfo({ userId }: { userId: string }) {
  const [credits, setCredits] = useState<number | null>(null);
  const [usedCredits, setUsedCredits] = useState<number | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data } = await axios.get(`/api/user-data?userId=${userId}`);
        setCredits(data.credits);
        setUsedCredits(data.usedCredits);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [userId]);

  return (
    <Card className="bg-blue-100">
      <CardContent>
        {credits !== null && usedCredits !== null ? (
          <div className="mt-4">
            <p>Available credits: {credits}</p>
            <p>Used Credits: {usedCredits}</p>
          </div>
        ) : (
          <p>Loading credits...</p>
        )}
      </CardContent>
    </Card>
  );
}

function generateSubscriptionMessage(subscription: Subscription): string {
  if (subscription.plan && subscription.endsAt) {
    return `Your plan: ${subscription.plan} <br/> Ends at: ${subscription.endsAt.toLocaleDateString()}`;
  }
  return "No active subscription.";
}



// "use client"; 

// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { Card, CardContent, CardFooter } from "@/components/ui/card";
// import { SubscriptionForm } from "./subscription-form"; // Ensure this path is correct

// interface Subscription {
//   plan: string | null;
//   endsAt: Date | null;
// }

// interface BilandPagesclientProps {
//   userId: string;
//   subscription: Subscription | null;
// }

// export default function BilandPagesclient({ userId, subscription }: BilandPagesclientProps) {
//   return (
//     <div className="mt-2 grid grid-cols-1  gap-6 sm:grid-cols-2">
//       {/* Billing Section */}
//       <Card className="bg-blue-200 ">
//         <CardContent className="p-4 ">
//           {subscription ? (
//             <p dangerouslySetInnerHTML={{ __html: generateSubscriptionMessage(subscription) }} />
//           ) : (
//             <p>No subscription found.</p>
//           )}
//         </CardContent>
//         <CardFooter>
//           <SubscriptionForm hasSubscription={!!subscription} />
//         </CardFooter>
//       </Card>

//       {/* Pages Info Section */}
//       <Pagesinfo userId={userId} />
//     </div>
//   );
// }

// function Pagesinfo({ userId }: { userId: string }) {
//   const [credits, setCredits] = useState<number | null>(null);
//   const [usedCredits, setUsedCredits] = useState<number | null>(null);

//   useEffect(() => {
//     const fetchUserData = async () => {
//       try {
//         const { data } = await axios.get(`/api/user-data?userId=${userId}`);
//         setCredits(data.credits);
//         setUsedCredits(data.usedCredits);
//       } catch (error) {
//         console.error('Error fetching user data:', error);
//       }
//     };

//     fetchUserData();
//   }, [userId]);

//   return (
//     <Card className="bg-blue-100 ">
//       <CardContent>
//         {credits !== null && usedCredits !== null && (
//           <div className="mt-4">
//             <p>Available credits: {credits}</p>
//             <p>Used Credits: {usedCredits}</p>
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   );
// }

// function generateSubscriptionMessage(subscription: Subscription): string {
//   if (subscription.plan && subscription.endsAt) {
//     return `Your plan: ${subscription.plan} <br/> Ends at: ${subscription.endsAt.toLocaleDateString()}`;
//   }
//   return "";
// }



// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
// // import type { Locale } from "~/config/i18n-config";
// import { SubscriptionForm } from "./subscription-form"; // Ensure this path is correct

// interface Subscription {
//   plan: string | null;
//   endsAt: Date | null;
// }

// interface BilandPagesclientProps {
//   lang: Locale;
//   userId: string;
//   dict: Record<string, string>;
//   subscription: Subscription | null;
// }

// export default function BilandPagesclient({ lang, userId, subscription }: BilandPagesclientProps) {
//   return (
//     <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
//       {/* Billing Section */}
//       <Card>
        
//         <CardContent>
//           {subscription ? (
//             <p dangerouslySetInnerHTML={{ __html: generateSubscriptionMessage(dict.business.billing, subscription) }} />
//           ) : (
//             <p>{dict.business.billing.noSubscription}</p>
//           )}
//         </CardContent>
//         <CardFooter>
//           <SubscriptionForm hasSubscription={!!subscription} dict={dict.business.billing} />
//         </CardFooter>
//       </Card>

//       {/* Pages Info Section */}
//       <Pagesinfo userId={userId} />
//     </div>
//   );
// }

// function Pagesinfo({ userId }: { userId: string }) {
//   const [pageAllowance, setPageAllowance] = useState<number | null>(null);
//   const [processedPages, setProcessedPages] = useState<number | null>(null);

//   useEffect(() => {
//     const fetchUserData = async () => {
//       try {
//         const { data } = await axios.get(`/api/user-data?userId=${userId}`);
//         setPageAllowance(data.pageAllowance);
//         setProcessedPages(data.processedPages);
//       } catch (error) {
//         console.error('Error fetching user data:', error);
//       }
//     };

//     fetchUserData();
//   }, [userId]);

//   return (
//     <Card>
     
//       <CardContent>
//         {pageAllowance !== null && processedPages !== null && (
//           <div className="mt-4">
//             <p>عدد الصفحات المتاحة: {pageAllowance}</p>
//             <p>عدد الصفحات المستخدمة: {processedPages}</p>
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   );
// }

// function generateSubscriptionMessage(
//   dict: Record<string, string>,
//   subscription: Subscription,
// ): string {
//   const content = String(dict.subscriptionInfo);
//   if (subscription.plan && subscription.endsAt) {
//     return content
//       .replace("{plan}", subscription.plan)
//       .replace("{date}", subscription.endsAt.toLocaleDateString());
//   }
//   return "";
// }

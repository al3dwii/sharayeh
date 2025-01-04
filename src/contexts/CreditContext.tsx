'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import axios from 'axios';
import { useUser, useAuth } from '@clerk/nextjs';
import { pricingPlans, Plan } from '@/config/planConfig'; // Import plan config

interface CreditContextType {
  credits: number | null;
  usedCredits: number | null;
  planId: string | null;
  planDetails: Plan | null; // Include plan details for richer context
  refreshCredits: () => Promise<void>;
}

const CreditContext = createContext<CreditContextType | undefined>(undefined);

export const CreditProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const [credits, setCredits] = useState<number | null>(null);
  const [usedCredits, setUsedCredits] = useState<number | null>(null);
  const [planId, setPlanId] = useState<string | null>(null);
  const [planDetails, setPlanDetails] = useState<Plan | null>(null); // Track detailed plan info

  // Ref to track if fetchUserData has been called
  const hasFetched = useRef(false);

  // Optional: Track if component is mounted to avoid state updates after unmount
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchUserData = async (attempt: number = 1, maxRetries: number = 3, retryDelay: number = 1000): Promise<void> => {
    if (!user) {
      resetCreditData();
      return;
    }

    try {
      const token = await getToken();
      const response = await axios.get('/api/user-data', {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('🔍 Raw API response:', response.data);

      const { credits, usedCredits, planId } = response.data;

      if (
        typeof credits === 'number' &&
        typeof usedCredits === 'number' &&
        typeof planId === 'string'
      ) {
        const planDetails = pricingPlans.find((plan) => plan.id === planId) || null;
        if (isMounted.current) { // Ensure component is still mounted
          setCredits(credits);
          setUsedCredits(usedCredits);
          setPlanId(planId);
          setPlanDetails(planDetails);
          console.log('✅ User data fetched successfully:', { credits, usedCredits, planId, planDetails });
        }
      } else {
        throw new Error('Invalid data format received');
      }
    } catch (error: any) {
      console.error(`❌ Error fetching user data (Attempt ${attempt}):`, error);

      if (attempt < maxRetries) {
        console.log(`🔄 Retrying fetchUserData in ${retryDelay}ms... (Attempt ${attempt + 1} of ${maxRetries})`);
        setTimeout(() => {
          fetchUserData(attempt + 1, maxRetries, retryDelay * 2); // Exponential backoff
        }, retryDelay);
      } else {
        console.error('❌ Max retry attempts reached. Could not fetch user data.');
        if (isMounted.current) {
          resetCreditData();
        }
      }
    }
  };

  // Reset state for credits, usedCredits, and plan details
  const resetCreditData = () => {
    setCredits(null);
    setUsedCredits(null);
    setPlanId(null);
    setPlanDetails(null);
  };

  useEffect(() => {
    if (isLoaded && user && !hasFetched.current) {
      // Set the ref to true to prevent future fetches
      hasFetched.current = true;
      fetchUserData();
    }
  }, [user, isLoaded]);

  // Optional: Listen for user changes and reset the fetch guard if user logs out/in
  useEffect(() => {
    if (!user) {
      hasFetched.current = false;
      resetCreditData();
    }
  }, [user]);

  return (
    <CreditContext.Provider
      value={{ credits, usedCredits, planId, planDetails, refreshCredits: fetchUserData }}
    >
      {children}
    </CreditContext.Provider>
  );
};

export const useCredits = (): CreditContextType => {
  const context = useContext(CreditContext);
  if (!context) {
    throw new Error('useCredits must be used within a CreditProvider');
  }
  return context;
};

// 'use client';

// import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
// import axios from 'axios';
// import { useUser, useAuth } from '@clerk/nextjs';
// import { pricingPlans, Plan } from '@/config/planConfig'; // Import plan config

// interface CreditContextType {
//   credits: number | null;
//   usedCredits: number | null;
//   planId: string | null;
//   planDetails: Plan | null; // Include plan details for richer context
//   refreshCredits: () => Promise<void>;
// }

// const CreditContext = createContext<CreditContextType | undefined>(undefined);

// export const CreditProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
//   const { user, isLoaded } = useUser();
//   const { getToken } = useAuth();
//   const [credits, setCredits] = useState<number | null>(null);
//   const [usedCredits, setUsedCredits] = useState<number | null>(null);
//   const [planId, setPlanId] = useState<string | null>(null);
//   const [planDetails, setPlanDetails] = useState<Plan | null>(null); // Track detailed plan info

//   // Ref to track if fetchUserData has been called
//   const hasFetched = useRef(false);

//   const fetchUserData = async () => {
//     if (user) {
//       try {
//         const token = await getToken();
//         const response = await axios.get('/api/user-data', {
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         console.log('🔍 Raw API response:', response.data);

//         const { credits, usedCredits, planId } = response.data;

//         if (
//           typeof credits === 'number' &&
//           typeof usedCredits === 'number' &&
//           typeof planId === 'string'
//         ) {
//           const planDetails = pricingPlans.find((plan) => plan.id === planId) || null;
//           setCredits(credits);
//           setUsedCredits(usedCredits);
//           setPlanId(planId);
//           setPlanDetails(planDetails);
//           console.log('✅ User data fetched successfully:', { credits, usedCredits, planId, planDetails });
//         } else {
//           throw new Error('Invalid data format received');
//         }
//       } catch (error: any) {
//         console.error('❌ Error fetching user data:', error);
//         resetCreditData();
//       }
//     } else {
//       resetCreditData();
//     }
//   };

//   // Reset state for credits, usedCredits, and plan details
//   const resetCreditData = () => {
//     setCredits(null);
//     setUsedCredits(null);
//     setPlanId(null);
//     setPlanDetails(null);
//   };

//   useEffect(() => {
//     if (isLoaded && user && !hasFetched.current) {
//       // Set the ref to true to prevent future fetches
//       hasFetched.current = true;
//       fetchUserData();
//     }
//   }, [user, isLoaded]);

//   // Optional: Listen for user changes and reset the fetch guard if user logs out/in
//   useEffect(() => {
//     if (!user) {
//       hasFetched.current = false;
//       resetCreditData();
//     }
//   }, [user]);

//   return (
//     <CreditContext.Provider
//       value={{ credits, usedCredits, planId, planDetails, refreshCredits: fetchUserData }}
//     >
//       {children}
//     </CreditContext.Provider>
//   );
// };

// export const useCredits = (): CreditContextType => {
//   const context = useContext(CreditContext);
//   if (!context) {
//     throw new Error('useCredits must be used within a CreditProvider');
//   }
//   return context;
// };


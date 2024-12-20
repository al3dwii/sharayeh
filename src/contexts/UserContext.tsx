"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import axios from "axios";
import { useUser, useAuth } from "@clerk/nextjs";
import { Plan, pricingPlans } from "@/config/planConfig";

export type UserTier = "FREE" | "STANDARD" | "PREMIUM";

// Define the structure of user data
interface UserData {
  credits: number;
  usedCredits: number;
  planId: string;
  tier: UserTier;
  planDetails?: Plan; // Optional: Include detailed plan information
}

// Define the context properties
interface UserContextProps {
  userData: UserData | null;
  setUserData: (data: UserData) => void;
  refreshUserData: () => Promise<void>;
}

// Create the context with default values
const UserContext = createContext<UserContextProps>({
  userData: null,
  setUserData: () => {},
  refreshUserData: async () => {},
});

// Provider component that wraps the application and provides the context
export const UserProvider = ({ children }: { children: ReactNode }) => {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);

  // Ref to prevent multiple fetches
  const hasFetched = useRef(false);

  // Function to fetch user data from the backend
  const fetchUserData = async () => {
    if (user) {
      try {
        const token = await getToken();
        const response = await axios.get("/api/user-data", {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        console.log("🔍 Raw API response:", response.data);
  
        const { credits, usedCredits, planId, tier } = response.data;
  
        console.log("🔍 Extracted fields:", { credits, usedCredits, planId, tier });
  
        // Optional: Match plan details
        const planDetails = pricingPlans.find((plan) => plan.id === planId);
  
        if (
          typeof credits === "number" &&
          typeof usedCredits === "number" &&
          typeof planId === "string" &&
          ["FREE", "STANDARD", "PREMIUM"].includes(tier)
        ) {
          setUserData({ credits, usedCredits, planId, tier, planDetails });
          console.log("✅ User data fetched successfully:", {
            credits,
            usedCredits,
            planId,
            tier,
            planDetails,
          });
        } else {
          console.error("❌ Invalid data format received:", {
            credits,
            usedCredits,
            planId,
            tier,
          });
          throw new Error("Invalid data format received");
        }
      } catch (error: any) {
        console.error("Error fetching user data:", error);
        setUserData(null);
      }
    } else {
      setUserData(null);
    }
  };
  
  // const fetchUserData = async () => {
  //   if (user) {
  //     try {
  //       const token = await getToken();
  //       const response = await axios.get("/api/user-data", {
  //         headers: { Authorization: `Bearer ${token}` },
  //       });

  //       const { credits, usedCredits, planId, tier } = response.data;

  //       // Optional: Match plan details
  //       const planDetails = pricingPlans.find((plan) => plan.id === planId);

  //       if (
  //         typeof credits === "number" &&
  //         typeof usedCredits === "number" &&
  //         typeof planId === "string" &&
  //         ["FREE", "STANDARD", "PREMIUM"].includes(tier)
  //       ) {
  //         setUserData({ credits, usedCredits, planId, tier, planDetails });
  //         console.log("🔄 User data fetched:", response.data);
  //       } else {
  //         throw new Error("Invalid data format received");
  //       }
  //     } catch (error: any) {
  //       console.error("Error fetching user data:", error);
  //       setUserData(null);
  //     }
  //   } else {
  //     setUserData(null);
  //   }
  // };

  // Fetch user data when the user is loaded and authenticated
  useEffect(() => {
    if (isLoaded && user && !hasFetched.current) {
      hasFetched.current = true;
      fetchUserData();
    }
  }, [user, isLoaded]);

  // Reset fetch guard and user data when the user logs out
  useEffect(() => {
    if (!user) {
      hasFetched.current = false;
      setUserData(null);
    }
  }, [user]);

  return (
    <UserContext.Provider
      value={{ userData, setUserData, refreshUserData: fetchUserData }}
    >
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use the UserContext
export const useUserData = () => useContext(UserContext);

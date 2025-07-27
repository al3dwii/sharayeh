
// context/UserContext.tsx

'use client';

import { createContext, useContext } from 'react';
import { UserData } from '../lib/getAllUserData';

const UserContext = createContext<UserData>(null);

export const useUserData = () => useContext(UserContext);
export const useUserPlan = () => {
  const data = useContext(UserContext);
  const tier = data?.userTier ?? "FREE";
  const map: Record<string, string> = { FREE: "Free", STANDARD: "Starter", PREMIUM: "Business" };
  return map[tier] ?? "Free";
};

export default UserContext;

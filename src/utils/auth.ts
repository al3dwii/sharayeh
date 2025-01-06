// /src/utils/auth.ts

import { currentUser as getClerkCurrentUser } from "@clerk/nextjs";

export const dynamic = 'force-dynamic';


export const getCurrentUser = async () => {
  try {
    const user = await getClerkCurrentUser();
    return user;
  } catch (error) {
    console.error("Error fetching current user:", error);
    return null;
  }
};

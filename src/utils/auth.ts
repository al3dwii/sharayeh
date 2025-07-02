// src/utils/auth.ts
import { currentUser as getClerkCurrentUser } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

export async function getCurrentUser() {
  try {
    /* currentUser() is already async and returns User | null */
    const user = await getClerkCurrentUser();
    return user;                          // null if unauthenticated
  } catch (error) {
    console.error("Error fetching current user:", error);
    return null;
  }
}


// // /src/utils/auth.ts

// import { currentUser as getClerkCurrentUser } from "@clerk/nextjs";

// export const dynamic = 'force-dynamic';


// export const getCurrentUser = async () => {
//   try {
//     const user = await getClerkCurrentUser();
//     return user;
//   } catch (error) {
//     console.error("Error fetching current user:", error);
//     return null;
//   }
// };

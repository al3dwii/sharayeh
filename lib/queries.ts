"use server";

// src/lib/queries.ts
import { db } from "@/lib/db";         // Prisma client
import { NextRequest } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { useUser } from "@clerk/nextjs";
// import { UserFile } from '@/types/UserFile';
// import { Subscription } from "@/types/Subscription";
// import { fetchUserFilesFromDB } from "@/lib/data";

/* ------------------------------------------------------------------
 *  Fetch all user files for a particular user
 * ----------------------------------------------------------------*/
export const getUserFiles = async (userId: string) => {
  if (!userId) throw new Error("Unauthorized");

  return db.file.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
};

/* ------------------------------------------------------------------
 *  Fetch user credits, initializing new users with 200 credits
 * ----------------------------------------------------------------*/
export const getUserCredits = async (userId: string) => {
  if (!userId) throw new Error("Unauthorized");

  let userCredits = await db.userCredits.findUnique({
    where: { userId },
    select: { credits: true, usedCredits: true },
  });

  if (!userCredits) {
    userCredits = await db.userCredits.create({
      data: { userId, credits: 200, usedCredits: 0 },
      select: { credits: true, usedCredits: true },
    });
  }

  return userCredits;
};

/* ------------------------------------------------------------------
 *  Get user with files & credits simultaneously
 * ----------------------------------------------------------------*/
export const getUserWithFiles = async (userId: string) => {
  try {
    if (!userId) throw new Error("Unauthorized");

    const [files, creditsData] = await Promise.all([
      getUserFiles(userId),
      getUserCredits(userId),
    ]);

    return { userId, files, ...creditsData };
  } catch (error) {
    console.error("Error fetching user with files:", error);
    throw new Error("Failed to fetch user with files");
  }
};

/* ------------------------------------------------------------------
 *  Admin-only: Fetch all users with optional pagination
 * ----------------------------------------------------------------*/
export const getAllUsers = async (req: NextRequest, page = 1, limit = 10) => {
  try {
    const { userId, redirectToSignIn } = await auth();        // auth() is async now :contentReference[oaicite:0]{index=0}
    if (!userId) throw new Error("Unauthorized");

    const clerk = await clerkClient();                        // clerkClient() is now a function :contentReference[oaicite:1]{index=1}

    // Verify admin privileges
    const currentUser = await clerk.users.getUser(userId);
    if (!currentUser.publicMetadata?.isAdmin) throw new Error("Forbidden");

    const offset = (page - 1) * limit;

    // getUserList now returns { data, totalCount }
    const { data: users } = await clerk.users.getUserList({
      limit,
      offset,
      orderBy: "-created_at",
    });                                                        // :contentReference[oaicite:2]{index=2}

    const userIds = users.map(u => u.id);

    const usersCredits = await db.userCredits.findMany({
      where: { userId: { in: userIds } },
      select: { userId: true, credits: true, usedCredits: true },
    });

    const creditMap = new Map(usersCredits.map(uc => [uc.userId, uc]));

    return users.map(u => ({
      ...u,
      ...(creditMap.get(u.id) ?? { credits: 0, usedCredits: 0 }),
    }));
  } catch (error) {
    console.error("Error fetching users:", error);
    throw new Error("Failed to fetch users");
  }
};

/* ------------------------------------------------------------------
 *  Simple: Get total users count (all-time)
 * ----------------------------------------------------------------*/
export const getUsersCount = async () => {
  try {
    const clerk = await clerkClient();
    const { totalCount } = await clerk.users.getUserList({ limit: 1 }); // totalCount is exposed in Core 2
    return totalCount;
  } catch (error) {
    console.error("Error counting users:", error);
    throw new Error("Failed to count users");
  }
};

/* ------------------------------------------------------------------
 *  Fetch both users (paginated) and total users count
 * ----------------------------------------------------------------*/
export const getAllUsersWithCount = async (page = 1, limit = 10) => {
  try {
    const clerk = await clerkClient();
    const offset = (page - 1) * limit;

    const { data: usersPage } = await clerk.users.getUserList({ limit, offset });
    const { totalCount }     = await clerk.users.getUserList({ limit: 1 });

    const formatted = usersPage.map(u => ({
      id: u.id,
      name: `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim(),
      email: u.emailAddresses?.[0]?.emailAddress ?? "",
      createdAt: u.createdAt,
    }));

    return { users: formatted, totalUsers: totalCount };
  } catch (error) {
    console.error("Error fetching users and count:", error);
    throw new Error("Failed to fetch users");
  }
};

/* ------------------------------------------------------------------
 *  Get how many users were created "today"
 * ----------------------------------------------------------------*/
export const getNewUsersTodayCount = async () => {
  try {
    const clerk = await clerkClient();
    const { data: allUsers } = await clerk.users.getUserList({ limit: 10_000 });

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    return allUsers.filter(u => new Date(u.createdAt) >= startOfDay).length;
  } catch (error) {
    console.error("Error counting users today:", error);
    throw new Error("Failed to count new users today");
  }
};

/* ------------------------------------------------------------------
 *  Fetch a user's subscription (if any)
 * ----------------------------------------------------------------*/
export const getUserSubscription = async (userId: string) => {
  try {
    return (
      (await db.userPackage.findFirst({ where: { userId } })) ??
      null
    );
  } catch (error) {
    console.error("Error fetching user subscription:", error);
    throw new Error("Failed to fetch user subscription");
  }
};

/* ------------------------------------------------------------------
 *  Clerk user hook: e.g. for client components
 * ----------------------------------------------------------------*/
export const useCurrentUser = () => {
  const { user } = useUser();
  return user;
};

// "use server";

// // src/lib/queries.ts

// import { db } from "@/lib/db"; // Your Prisma client instance
// import { NextRequest } from "next/server";
// import { auth, clerkClient } from '@clerk/nextjs/server';
// import { useUser } from "@clerk/nextjs";
// // import { UserFile } from '@/types/UserFile';
// import { Subscription } from "@/types/Subscription";
// import { fetchUserFilesFromDB } from "@/lib/data";

// /* ------------------------------------------------------------------
//  *  Fetch all user files for a particular user
//  * ----------------------------------------------------------------*/
// export const getUserFiles = async (userId: string) => {
//   if (!userId) {
//     throw new Error("Unauthorized");
//   }

//   // Fetch files for the authenticated user
//   const files = await db.file.findMany({
//     where: { userId },
//     orderBy: { createdAt: "desc" },
//   });

//   return files;
// };

// /* ------------------------------------------------------------------
//  *  Fetch user credits, initializing new users with 200 credits
//  * ----------------------------------------------------------------*/
// export const getUserCredits = async (userId: string) => {
//   if (!userId) {
//     throw new Error("Unauthorized");
//   }

//   // Fetch user credits
//   let userCredits = await db.userCredits.findUnique({
//     where: { userId },
//     select: { credits: true, usedCredits: true },
//   });

//   // If the userCredits record doesn't exist, create one with default values
//   if (!userCredits) {
//     userCredits = await db.userCredits.create({
//       data: {
//         userId,
//         credits: 200, // Initialize with 200 free credits
//         usedCredits: 0,
//       },
//       select: {
//         credits: true,
//         usedCredits: true,
//       },
//     });
//   }

//   return {
//     credits: userCredits.credits,
//     usedCredits: userCredits.usedCredits,
//   };
// };

// /* ------------------------------------------------------------------
//  *  Get user with files & credits simultaneously
//  * ----------------------------------------------------------------*/
// export const getUserWithFiles = async (userId: string) => {
//   try {
//     if (!userId) {
//       throw new Error("Unauthorized");
//     }

//     // Fetch files and credits concurrently
//     const [files, { credits, usedCredits }] = await Promise.all([
//       getUserFiles(userId),
//       getUserCredits(userId),
//     ]);

//     return {
//       userId,
//       files,
//       credits,
//       usedCredits,
//     };
//   } catch (error) {
//     console.error("Error fetching user with files:", error);
//     throw new Error("Failed to fetch user with files");
//   }
// };

// /* ------------------------------------------------------------------
//  *  Admin-only: Fetch all users with optional pagination
//  * ----------------------------------------------------------------*/
// export const getAllUsers = async (req: NextRequest, page = 1, limit = 10) => {
//   try {

//     const { userId, redirectToSignIn } = await auth();   // <-- await!

   
//     if (!userId) {
//       throw new Error("Unauthorized");
//     }

//     // Verify admin privileges
//     const currentUser = await clerkClient.users.getUser(userId);
//     if (!currentUser.publicMetadata.isAdmin) {
//       throw new Error("Forbidden");
//     }

//     const offset = (page - 1) * limit;

//     // Fetch users from Clerk
//     const users = await clerkClient.users.getUserList({
//       limit,
//       offset,
//       orderBy: "-created_at",
//     });

//     // Get user IDs
//     const userIds = users.map((user) => user.id);

//     // Fetch credits data for these users
//     const usersCredits = await db.userCredits.findMany({
//       where: { userId: { in: userIds } },
//       select: { userId: true, credits: true, usedCredits: true },
//     });

//     // Create a map of userId to credits data
//     const creditsMap = new Map(usersCredits.map((uc) => [uc.userId, uc]));

//     // Combine user data with credits data
//     const usersWithCredits = users.map((user) => {
//       const creditsData =
//         creditsMap.get(user.id) || { credits: 0, usedCredits: 0 };
//       return {
//         ...user,
//         credits: creditsData.credits,
//         usedCredits: creditsData.usedCredits,
//       };
//     });

//     return usersWithCredits;
//   } catch (error) {
//     console.error("Error fetching users:", error);
//     throw new Error("Failed to fetch users");
//   }
// };

// /* ------------------------------------------------------------------
//  *  Simple: Get total users count (all-time)
//  * ----------------------------------------------------------------*/
// export const getUsersCount = async () => {
//   try {
//     // Get all users from Clerk
//     const users = await clerkClient.users.getUserList({ limit: 10000 });
//     const totalUsers = users.length;
//     return totalUsers;
//   } catch (error) {
//     console.error("Error counting users:", error);
//     throw new Error("Failed to count users");
//   }
// };

// /* ------------------------------------------------------------------
//  *  Fetch both users (paginated) and total users count
//  * ----------------------------------------------------------------*/
// export const getAllUsersWithCount = async (page = 1, limit = 10) => {
//   try {
//     const skip = (page - 1) * limit;

//     // Fetch current batch of users with pagination
//     const users = await clerkClient.users.getUserList({
//       limit,
//       offset: skip,
//     });

//     // For total user count, fetch more users. (Naive approach for smaller bases)
//     const allUsers = await clerkClient.users.getUserList({ limit: 10000 });
//     const totalUsers = allUsers.length;

//     // Format the users to return only the fields you need
//     const formattedUsers = users.map((user) => ({
//       id: user.id,
//       // If user.firstName or lastName might be undefined, handle that
//       name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
//       email: user.emailAddresses?.[0]?.emailAddress ?? "",
//       createdAt: user.createdAt, // You can keep track if needed
//     }));

//     return { users: formattedUsers, totalUsers };
//   } catch (error) {
//     console.error("Error fetching users and count:", error);
//     throw new Error("Failed to fetch users");
//   }
// };

// /* ------------------------------------------------------------------
//  *  Get how many users were created "today"
//  *  (i.e., since midnight local time)
//  * ----------------------------------------------------------------*/
// export const getNewUsersTodayCount = async () => {
//   try {
//     // If you expect more than 10k users, either:
//     //   1) fetch multiple pages in a loop, or 
//     //   2) store creation data in your own DB & query directly
//     const allUsers = await clerkClient.users.getUserList({ limit: 10000 });

//     // Calculate start of day
//     const startOfDay = new Date();
//     startOfDay.setHours(0, 0, 0, 0);

//     // Filter users created after startOfDay
//     const newUsersToday = allUsers.filter((user) => {
//       const createdAt = new Date(user.createdAt);
//       return createdAt >= startOfDay;
//     }).length;

//     return newUsersToday;
//   } catch (error) {
//     console.error("Error counting users today:", error);
//     throw new Error("Failed to count new users today");
//   }
// };

// /* ------------------------------------------------------------------
//  *  Fetch a user's subscription (if any)
//  * ----------------------------------------------------------------*/
// export const getUserSubscription = async (userId: string) => {
//   try {
//     const subscription = await db.userPackage.findFirst({
//       where: { userId },
//     });

//     return subscription || null;
//   } catch (error) {
//     console.error("Error fetching user subscription:", error);
//     throw new Error("Failed to fetch user subscription");
//   }
// };

// /* ------------------------------------------------------------------
//  *  Clerk user hook: e.g. for client components
//  * ----------------------------------------------------------------*/
// export const useCurrentUser = () => {
//   const { user } = useUser();
//   return user;
// };

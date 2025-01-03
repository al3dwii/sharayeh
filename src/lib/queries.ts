'use server'
// src/lib/queries.ts

import { db } from '@/lib/db'; // Your Prisma client instance
import { NextRequest } from 'next/server';

import { auth } from '@clerk/nextjs';
import { clerkClient } from '@clerk/nextjs/server'; 

import { useUser } from '@clerk/nextjs';
// import { UserFile } from '@/types/UserFile';
import { Subscription } from '@/types/Subscription';


import { fetchUserFilesFromDB } from '@/lib/data';

// export const getUserFiles = async (userId: string)=> {
//   const files = await fetchUserFilesFromDB(userId);
//   return files;
// };




// Function to fetch user files
export const getUserFiles = async (userId: string) => {
  if (!userId) {
    throw new Error('Unauthorized');
  }

  // Fetch files for the authenticated user
  const files = await db.file.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  return files;
};

// Function to fetch user credits, initializing new users with 20 credits
export const getUserCredits = async (userId: string) => {
  if (!userId) {
    throw new Error('Unauthorized');
  }

  // Fetch user credits
  let userCredits = await db.userCredits.findUnique({
    where: { userId },
    select: { credits: true, usedCredits: true },
  });

  // If the userCredits record doesn't exist, create one with default values
  if (!userCredits) {
    userCredits = await db.userCredits.create({
      data: {
        userId,
        credits: 200, // Initialize with 20 free credits
        usedCredits: 0,
      },
      select: {
        credits: true,
        usedCredits: true,
      },
    });
  }

  return {
    credits: userCredits.credits,
    usedCredits: userCredits.usedCredits,
  };
};

// Function to get user with files and credits
export const getUserWithFiles = async (userId: string) => {
  try {
    if (!userId) {
      throw new Error('Unauthorized');
    }

    // Fetch files and credits concurrently
    const [files, { credits, usedCredits }] = await Promise.all([
      getUserFiles(userId),
      getUserCredits(userId),
    ]);

    return {
      userId,
      files,
      credits,
      usedCredits,
    };
  } catch (error) {
    console.error('Error fetching user with files:', error);
    throw new Error('Failed to fetch user with files');
  }
};




// export const getUserWithFiles = async (userId: string) => {
//   try {
//     if (!userId) {
//       throw new Error('Unauthorized');
//     }

//     // Fetch files for the authenticated user
//     const files = await db.file.findMany({
//       where: { userId },
//       orderBy: { createdAt: 'desc' },
//     });

//     // Fetch user credits
//     const userCredits = await db.userCredits.findUnique({
//       where: { userId },
//       select: { credits: true, usedCredits: true },
//     });

//     return {
//       userId,
//       files,
//       credits: userCredits?.credits || 0,
//       usedCredits: userCredits?.usedCredits || 0,
//     };
//   } catch (error) {
//     console.error('Error fetching user with files:', error);
//     throw new Error('Failed to fetch user with files');
//   }
// };


// Function to get all users (admin only)
export const getAllUsers = async (req: NextRequest, page = 1, limit = 10) => {
  try {
    const { userId } = auth();
    if (!userId) {
      throw new Error('Unauthorized');
    }

    // Verify admin privileges
    const currentUser = await clerkClient.users.getUser(userId);
    if (!currentUser.publicMetadata.isAdmin) {
      throw new Error('Forbidden');
    }

    const offset = (page - 1) * limit;

    // Fetch users from Clerk
    const users = await clerkClient.users.getUserList({
      limit,
      offset,
      orderBy: '-created_at',
    });

    // Get user IDs
    const userIds = users.map((user) => user.id);

    // Fetch credits data for these users
    const usersCredits = await db.userCredits.findMany({
      where: { userId: { in: userIds } },
      select: { userId: true, credits: true, usedCredits: true },
    });

    // Create a map of userId to credits data
    const creditsMap = new Map(usersCredits.map((uc) => [uc.userId, uc]));

    // Combine user data with credits data
    const usersWithCredits = users.map((user) => {
      const creditsData = creditsMap.get(user.id) || { credits: 0, usedCredits: 0 };
      return {
        ...user,
        credits: creditsData.credits,
        usedCredits: creditsData.usedCredits,
      };
    });

    return usersWithCredits;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw new Error('Failed to fetch users');
  }
};



export const getUsersCount = async () => {
  try {
    const users = await clerkClient.users.getUserList();
    const totalUsers = users.length;
    return totalUsers;
  } catch (error) {
    console.error('Error counting users:', error);
    throw new Error('Failed to count users');
  }
};


export const getAllUsersWithCount = async (page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;

    // Fetch users with pagination
    const users = await clerkClient.users.getUserList({
      limit,
      offset: skip,
    });

    // Clerk does not have an explicit count function for all users, so fetch all users and calculate count
    const totalUsers = (await clerkClient.users.getUserList()).length;

    // Format the users to return only the fields needed
    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.firstName + ' ' + user.lastName,
      email: user.emailAddresses[0]?.emailAddress,
    }));

    return { users: formattedUsers, totalUsers };
  } catch (error) {
    console.error('Error fetching users and count:', error);
    throw new Error('Failed to fetch users');
  }
};



export const getUserSubscription = async (userId: string) => {
  try {
    // Fetch the subscription directly using the userId
    const subscription = await db.userPackage.findFirst({
      where: { userId },
    });

    return subscription || null;
  } catch (error) {
    console.error('Error fetching user subscription:', error);
    throw new Error('Failed to fetch user subscription');
  }
};


export const useCurrentUser = () => {
  const { user } = useUser();
  return user;
};


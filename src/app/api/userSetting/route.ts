// /src/app/api/userSetting/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getAuth, clerkClient } from '@clerk/nextjs/server'; // Clerk for authentication and user management
import prismadb from '@/utils/prismadb';
import { z } from 'zod';

// Define the schema for updating user information
const UpdateUserSchema = z.object({
  name: z.string().min(1, "Name cannot be empty").optional(),
  email: z.string().email("Invalid email address").optional(),
  // Add other fields you wish to allow updating with appropriate validation
});

// Handle GET request to fetch user data
const handleGET = async (request: NextRequest) => {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
    }

    // Fetch user data from Clerk
    const user = await clerkClient.users.getUser(userId);

    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    // Fetch additional data from Prisma using userId
    const userCredits = await prismadb.userCredits.findUnique({
      where: { userId },
      select: {
        credits: true,
        usedCredits: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const userSubscription = await prismadb.userSubscription.findUnique({
      where: { userId },
      select: {
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        stripePriceId: true,
        stripeCurrentPeriodEnd: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const creditTransactions = await prismadb.creditTransaction.findMany({
      where: { userId },
      select: {
        type: true,
        amount: true,
        description: true,
        timestamp: true,
      },
      orderBy: { timestamp: 'desc' },
      take: 10, // Fetch the latest 10 transactions
    });

    const files = await prismadb.file.findMany({
      where: { userId },
      select: {
        id: true,
        fileName: true,
        fileUrl: true,
        type: true,
        status: true,
        createdAt: true,
      },
    });

    const subscriptions = await prismadb.subscription.findMany({
      where: { userId },
      include: {
        plan: true,
      },
    });

    // Combine Clerk user data with Prisma data
    const combinedUserData = {
      id: userId,
      name: user.firstName || user.fullName || '',
      email: user.emailAddresses[0]?.emailAddress || '',
      UserCredits: userCredits || null,
      UserSubscription: userSubscription || null,
      CreditTransactions: creditTransactions || [],
      Files: files || [],
      Subscriptions: subscriptions || [],
      // Include other fields or relations as necessary
    };

    return NextResponse.json(combinedUserData, { status: 200 });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Internal Server Error.' }, { status: 500 });
  }
};

// Handle PUT request to update user data
const handlePUT = async (request: NextRequest) => {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
    }

    const body = await request.json();
    const parsedData = UpdateUserSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json(
        { error: 'Invalid request data.', details: parsedData.error.errors },
        { status: 400 }
      );
    }

    const { name, email } = parsedData.data;

    // If email is being updated, ensure it's not already taken by another user
    if (email) {
      const existingUsers = await clerkClient.users.getUserList({
        emailAddress: email,
        limit: 1,
      });

      if (existingUsers.length > 0 && existingUsers[0].id !== userId) {
        return NextResponse.json({ error: 'Email is already in use.' }, { status: 400 });
      }
    }

    // Update user data in Clerk
    await clerkClient.users.updateUser(userId, {
      firstName: name,
      emailAddresses: email
        ? [
            {
              id: user.emailAddresses[0]?.id || '',
              emailAddress: email,
              verified: true, // Adjust based on your verification strategy
            },
          ]
        : undefined,
      // Add other fields as necessary
    });

    // Fetch the updated user data from Clerk
    const updatedUser = await clerkClient.users.getUser(userId);

    // Fetch additional data from Prisma using userId
    const userCredits = await prismadb.userCredits.findUnique({
      where: { userId },
      select: {
        credits: true,
        usedCredits: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const userSubscription = await prismadb.userSubscription.findUnique({
      where: { userId },
      select: {
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        stripePriceId: true,
        stripeCurrentPeriodEnd: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const creditTransactions = await prismadb.creditTransaction.findMany({
      where: { userId },
      select: {
        type: true,
        amount: true,
        description: true,
        timestamp: true,
      },
      orderBy: { timestamp: 'desc' },
      take: 10, // Fetch the latest 10 transactions
    });

    const files = await prismadb.file.findMany({
      where: { userId },
      select: {
        id: true,
        fileName: true,
        fileUrl: true,
        type: true,
        status: true,
        createdAt: true,
      },
    });

    const subscriptions = await prismadb.subscription.findMany({
      where: { userId },
      include: {
        plan: true,
      },
    });

    // Combine Clerk user data with Prisma data
    const combinedUserData = {
      id: userId,
      name: updatedUser.firstName || updatedUser.fullName || '',
      email: updatedUser.emailAddresses[0]?.emailAddress || '',
      UserCredits: userCredits || null,
      UserSubscription: userSubscription || null,
      CreditTransactions: creditTransactions || [],
      Files: files || [],
      Subscriptions: subscriptions || [],
      // Include other fields or relations as necessary
    };

    return NextResponse.json(combinedUserData, { status: 200 });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Internal Server Error.' }, { status: 500 });
  }
};

// Export the handler for GET and PUT methods
export async function GET(request: NextRequest) {
  return handleGET(request);
}

export async function PUT(request: NextRequest) {
  return handlePUT(request);
}

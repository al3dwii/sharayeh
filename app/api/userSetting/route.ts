// src/app/api/userSetting/route.ts

// src/app/api/userSetting/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAuth, clerkClient } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { z } from 'zod';

export const runtime  = 'nodejs';
export const dynamic  = 'force-dynamic';

/* ------------------- zod schema ------------------- */
const UpdateUserSchema = z.object({
  name:  z.string().min(1, 'Name cannot be empty').optional(),
  email: z.string().email('Invalid email address').optional(),
});

/* ===================================================
   GET  /api/userSetting
   =================================================== */
export async function GET(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
    }

    const clerk = await clerkClient();                     // ← NEW
    const user  = await clerk.users.getUser(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    /* ------------------------------------------------
       Fetch related data from Prisma
    -------------------------------------------------- */
    const [userCredits, creditTransactions, files] = await Promise.all([
      db.userCredits.findUnique({
        where: { userId },
        select: { credits: true, usedCredits: true, createdAt: true, updatedAt: true },
      }),
      db.creditTransaction.findMany({
        where: { userId },
        select: { type: true, amount: true, description: true, timestamp: true },
        orderBy: { timestamp: 'desc' },
        take: 10,
      }),
      db.file.findMany({
        where: { userId },
        select: { id: true, fileName: true, fileUrl: true, type: true, status: true, createdAt: true },
      }),
    ]);

    const combined = {
      id:   userId,
      name: user.firstName ?? '',
      email: user.emailAddresses[0]?.emailAddress ?? '',
      UserCredits:        userCredits ?? null,
      CreditTransactions: creditTransactions,
      Files:              files,
    };

    return NextResponse.json(combined, { status: 200 });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Internal Server Error.' }, { status: 500 });
  }
}

/* ===================================================
   PUT  /api/userSetting
   =================================================== */
export async function PUT(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
    }

    const body       = await request.json();
    const parse      = UpdateUserSchema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json(
        { error: 'Invalid request data.', details: parse},
        { status: 400 }
      );
    }
    const { name, email } = parse.data;

    const clerk = await clerkClient();                     // ← NEW
    const user  = await clerk.users.getUser(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    /* --- Email uniqueness check (optional) ---------- */
    if (email) {
      const { data: existing } = await clerk.users.getUserList({
        emailAddress: [email],
        limit: 1,
      });
      if (existing.length && existing[0].id !== userId) {
        return NextResponse.json({ error: 'Email is already in use.' }, { status: 400 });
      }
    }

    /* --- Updates ------------------------------------ */
    if (name) {
      await clerk.users.updateUser(userId, { firstName: name });
    }
    // Email update logic commented out as in your original code

    /* --- Re-fetch updated user + Prisma side data --- */
    const updatedUser = await clerk.users.getUser(userId);
    const [userCredits, creditTransactions, files] = await Promise.all([
      db.userCredits.findUnique({
        where: { userId },
        select: { credits: true, usedCredits: true, createdAt: true, updatedAt: true },
      }),
      db.creditTransaction.findMany({
        where: { userId },
        select: { type: true, amount: true, description: true, timestamp: true },
        orderBy: { timestamp: 'desc' },
        take: 10,
      }),
      db.file.findMany({
        where: { userId },
        select: { id: true, fileName: true, fileUrl: true, type: true, status: true, createdAt: true },
      }),
    ]);

    const combined = {
      id:   userId,
      name: updatedUser.firstName ?? '',
      email: updatedUser.emailAddresses[0]?.emailAddress ?? '',
      UserCredits:        userCredits ?? null,
      CreditTransactions: creditTransactions,
      Files:              files,
    };

    return NextResponse.json(combined, { status: 200 });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Internal Server Error.' }, { status: 500 });
  }
}


// import { NextRequest, NextResponse } from 'next/server';
// import { getAuth, clerkClient } from '@clerk/nextjs/server';
// import { db } from '@/lib/db'; // Use consistent Prisma client
// import { z } from 'zod';

// export const runtime = 'nodejs'; // Ensure Node.js runtime


// // Define the schema for updating user information
// const UpdateUserSchema = z.object({
//   name: z.string().min(1, "Name cannot be empty").optional(),
//   email: z.string().email("Invalid email address").optional(),
//   // Add other fields you wish to allow updating with appropriate validation
// });

// // Handler for GET requests
// const handleGET = async (request: NextRequest) => {
//   try {
//     const { userId } = getAuth(request);

//     if (!userId) {
//       return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
//     }

//     // Fetch user data from Clerk
//     const user = await clerkClient.users.getUser(userId);
//     if (!user) {
//       return NextResponse.json({ error: 'User not found.' }, { status: 404 });
//     }

//     // Fetch additional data from Prisma using userId
//     const userCredits = await db.userCredits.findUnique({
//       where: { userId },
//       select: {
//         credits: true,
//         usedCredits: true,
//         createdAt: true,
//         updatedAt: true,
//       },
//     });

//     const creditTransactions = await db.creditTransaction.findMany({
//       where: { userId },
//       select: {
//         type: true,
//         amount: true,
//         description: true,
//         timestamp: true,
//       },
//       orderBy: { timestamp: 'desc' },
//       take: 10, // Fetch the latest 10 transactions
//     });

//     const files = await db.file.findMany({
//       where: { userId },
//       select: {
//         id: true,
//         fileName: true,
//         fileUrl: true,
//         type: true,
//         status: true,
//         createdAt: true,
//       },
//     });

//     // Combine Clerk user data with Prisma data
//     const combinedUserData = {
//       id: userId,
//       name: user.firstName || '',
//       email: user.emailAddresses[0]?.emailAddress || '',
//       UserCredits: userCredits || null,
//       CreditTransactions: creditTransactions || [],
//       Files: files || [],
//     };

//     return NextResponse.json(combinedUserData, { status: 200 });
//   } catch (error) {
//     console.error('Error fetching user:', error);
//     return NextResponse.json({ error: 'Internal Server Error.' }, { status: 500 });
//   }
// };

// // Handler for PUT requests
// const handlePUT = async (request: NextRequest) => {
//   try {
//     const { userId } = getAuth(request);

//     if (!userId) {
//       return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
//     }

//     const body = await request.json();
//     const parsedData = UpdateUserSchema.safeParse(body);

//     if (parsedData.success === false) {
//       const { error: parseError } = parsedData;
//       return NextResponse.json(
//         { error: 'Invalid request data.', details: parseError.errors },
//         { status: 400 }
//       );
//     }

//     const { name, email } = parsedData.data;

//     const user = await clerkClient.users.getUser(userId);
//     if (!user) {
//       return NextResponse.json({ error: 'User not found.' }, { status: 404 });
//     }

//     // If email is being updated, ensure it's not already taken by another user
//     if (email) {
//       const existingUsers = await clerkClient.users.getUserList({
//         emailAddress: [email], // Make sure we pass an array
//         limit: 1,
//       });

//       if (existingUsers.length > 0 && existingUsers[0].id !== userId) {
//         return NextResponse.json({ error: 'Email is already in use.' }, { status: 400 });
//       }
//     }

//     // Update user's name (if provided)
//     if (name) {
//       await clerkClient.users.updateUser(userId, { firstName: name });
//     }

//     // If you'd like to handle updating the user's email, uncomment and adjust accordingly
//     // if (email) {
//     //   const primaryEmail = user.emailAddresses[0];
//     //   if (primaryEmail) {
//     //     await clerkClient.users.updateEmailAddress(primaryEmail.id, { emailAddress: email });
//     //   } else {
//     //     await clerkClient.users.createEmailAddress({ userId, emailAddress: email });
//     //   }
//     // }

//     const updatedUser = await clerkClient.users.getUser(userId);

//     const userCredits = await db.userCredits.findUnique({
//       where: { userId },
//       select: {
//         credits: true,
//         usedCredits: true,
//         createdAt: true,
//         updatedAt: true,
//       },
//     });

//     const creditTransactions = await db.creditTransaction.findMany({
//       where: { userId },
//       select: {
//         type: true,
//         amount: true,
//         description: true,
//         timestamp: true,
//       },
//       orderBy: { timestamp: 'desc' },
//       take: 10,
//     });

//     const files = await db.file.findMany({
//       where: { userId },
//       select: {
//         id: true,
//         fileName: true,
//         fileUrl: true,
//         type: true,
//         status: true,
//         createdAt: true,
//       },
//     });

//     const combinedUserData = {
//       id: userId,
//       name: updatedUser.firstName || '',
//       email: updatedUser.emailAddresses[0]?.emailAddress || '',
//       UserCredits: userCredits || null,
//       CreditTransactions: creditTransactions || [],
//       Files: files || [],
//     };

//     return NextResponse.json(combinedUserData, { status: 200 });
//   } catch (error) {
//     console.error('Error updating user:', error);
//     return NextResponse.json({ error: 'Internal Server Error.' }, { status: 500 });
//   }
// };

// export async function GET(request: NextRequest) {
//   return handleGET(request);
// }

// export async function PUT(request: NextRequest) {
//   return handlePUT(request);
// }

// src/app/api/user-data/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db'; // Prisma client
import { getAuth } from '@clerk/nextjs/server'; // Clerk server-side auth

export const dynamic = 'force-dynamic'; // Ensure dynamic content is fetched at runtime

// Handle GET requests to /api/user-data
export async function GET(req: NextRequest) {
  try {
    console.log('🔍 Incoming GET request to /api/user-data');

    const { userId } = getAuth(req); // Extract userId from auth context
    console.log('👤 Authenticated User ID:', userId);

    if (!userId) {
      console.log("Response: Unauthorized - Missing userId");
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use upsert to fetch or create the userCredits record
    const userCredits = await db.userCredits.upsert({
      where: { userId },
      update: {}, // No fields to update; just fetch the existing record
      create: {
        userId,
        credits: 10, // Default credits
        usedCredits: 0, // Default usedCredits
      },
      select: {
        credits: true,
        usedCredits: true,
      },
    });

    console.log('📊 Retrieved User Credits:', userCredits);

    // Return the user credits data
    return NextResponse.json({ 
      credits: userCredits.credits, 
      usedCredits: userCredits.usedCredits 
    }, { status: 200 });
    
  } catch (error) {
    console.error('🛑 Error fetching user data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


// // src/app/api/user-data/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { db } from '@/lib/db'; // Prisma client
// import { getAuth } from '@clerk/nextjs/server'; // Clerk server-side auth

// export const dynamic = 'force-dynamic'; // Ensure dynamic content is fetched at runtime

// // Handle GET requests to /api/user-data
// export async function GET(req: NextRequest) {
//   try {
//     const { userId } = getAuth(req); // Extract userId from auth context

//     if (!userId) {
//       console.log("Response: Unauthorized - Missing userId");
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     // Fetch the credits and usedCredits for the user from the UserCredits table
//     let userCredits = await db.userCredits.findUnique({
//       where: {
//         userId,
//       },
//       select: {
//         credits: true,
//         usedCredits: true,
//       },
//     });

//         // If the userCredits record doesn't exist, create one with default values
//     if (!userCredits) {
//       userCredits = await db.userCredits.create({
//         data: {
//           userId,
//           credits: 10,
//           usedCredits: 0,
//         },
//         select: {
//           credits: true,
//           usedCredits: true,
//         },
//       });
//     }

//     // Return the user credits data
//     return NextResponse.json({ 
//       credits: userCredits.credits, 
//       usedCredits: userCredits.usedCredits 
//     }, { status: 200 });
    
//   } catch (error) {
//     console.error('Error fetching user data:', error);
//     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
//   }
// }





// // src/app/api/user-data/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { db } from '@/lib/db'; // Prisma client
// import { getAuth } from '@clerk/nextjs/server'; // Clerk server-side auth

// export const dynamic = 'force-dynamic'; // Ensure dynamic content is fetched at runtime

// // Handle GET requests to /api/user-data
// export async function GET(req: NextRequest) {
//   try {
//     const { userId } = getAuth(req); // Extract userId from auth context

//     if (!userId) {
//       console.log("Response: Unauthorized - Missing userId");
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     // Fetch the credits and usedCredits for the user from the UserCredits table
//     let userCredits = await db.userCredits.findUnique({
//       where: {
//         userId,
//       },
//       select: {
//         credits: true,
//         usedCredits: true,
//       },
//     });

//     // If the userCredits record doesn't exist, create one with default values
//     if (!userCredits) {
//       userCredits = await db.userCredits.create({
//         data: {
//           userId,
//           credits: 20,
//           usedCredits: 0,
//         },
//         select: {
//           credits: true,
//           usedCredits: true,
//         },
//       });
//     }

//     // Return the user credits data
//     return NextResponse.json({ 
//       credits: userCredits.credits, 
//       usedCredits: userCredits.usedCredits 
//     }, { status: 200 });
    
//   } catch (error) {
//     console.error('Error fetching user data:', error);
//     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
//   }
// }




// // // /Users/omair/arocr/apps/nextjs/src/app/api/user-data/route.ts

// import { NextRequest, NextResponse } from 'next/server';
// import { db } from '@/lib/db'; // Prisma client

// export const dynamic = 'force-dynamic'; // Ensure dynamic content is fetched at runtime

// // Handle GET requests to /api/user-data
// export async function GET(req: NextRequest) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const userId = searchParams.get('userId');

//     if (!userId) {
//       console.log("Response: Missing userId");
//       return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
//     }

//     // Fetch the credits and usedCredits for the user from the UserCredits table
//     let userCredits = await db.userCredits.findUnique({
//       where: {
//         userId,
//       },
//       select: {
//         credits: true,
//         usedCredits: true,
//       },
//     });

//     // If the userCredits record doesn't exist, create one with default values
//     if (!userCredits) {
//       userCredits = await db.userCredits.create({
//         data: {
//           userId,
//           credits: 200,
//           usedCredits: 0,
//         },
//         select: {
//           credits: true,
//           usedCredits: true,
//         },
//       });
//     }

//     // Return the user credits data
//     return NextResponse.json({ 
//       credits: userCredits.credits, 
//       usedCredits: userCredits.usedCredits 
//     }, { status: 200 });
    
//   } catch (error) {
//     console.error('Error fetching user data:', error);
//     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
//   }
// }


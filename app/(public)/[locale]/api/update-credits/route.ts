// // app/api/update-credits/route.ts


import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuth } from '@clerk/nextjs/server'; // Import Clerk's getAuth

export const runtime = 'nodejs'; // Ensure Node.js runtime


export async function PATCH(req: NextRequest) {
  try {
    const { userId } = getAuth(req); // Retrieve userId from Clerk's authentication
    console.log('🔑 Authenticated User ID:', userId);
    
    if (!userId) {
      console.log('⚠️ Unauthorized: No userId found.');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { pointsUsed } = await req.json();
    console.log('📥 Points Used:', pointsUsed);

    if (typeof pointsUsed !== 'number' || pointsUsed <= 0) {
      console.log('⚠️ Invalid pointsUsed:', pointsUsed);
      return NextResponse.json({ error: 'Invalid pointsUsed' }, { status: 400 });
    }

    // Fetch user's current credits
    const userCredits = await db.userCredits.findUnique({
      where: { userId },
    });
    console.log('📊 Retrieved User Credits:', userCredits);

    if (!userCredits) {
      console.log('⚠️ UserCredits not found for userId:', userId);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if credits are null
    if (userCredits.credits === null) {
      console.log('⚠️ Credits are null. Initializing to default value.');
      await db.userCredits.update({
        where: { userId },
        data: { credits: 100 }, // Set to default value
      });
      // Re-fetch userCredits after update
      const updatedUserCredits = await db.userCredits.findUnique({
        where: { userId },
      });
      console.log('✅ Updated User Credits:', updatedUserCredits);

      if (updatedUserCredits!.credits < pointsUsed) {
        console.log('⚠️ Insufficient credits after initialization:', updatedUserCredits!.credits);
        return NextResponse.json({ error: 'Insufficient credits' }, { status: 400 });
      }
    }

    // Re-fetch userCredits after potential update
    const finalUserCredits = await db.userCredits.findUnique({
      where: { userId },
    });
    console.log('📈 Final User Credits:', finalUserCredits);

    // Check if user has enough credits
    if (finalUserCredits!.credits < pointsUsed) {
      console.log('⚠️ Insufficient credits:', finalUserCredits!.credits);
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 400 });
    }

    // Update credits and usedCredits atomically
    const updatedCredits = await db.userCredits.update({
      where: { userId },
      data: {
        credits: { decrement: pointsUsed },
        usedCredits: { increment: pointsUsed },
      },
    });
    console.log('✅ Updated User Credits After Deduction:', updatedCredits);

    // Log the credit transaction
    const creditTransaction = await db.creditTransaction.create({
      data: {
        userId,
        type: 'DEDUCTION', // Use the enum value directly
        amount: pointsUsed,
        description: 'Create Presentation',
      },
    });
    console.log('📝 Credit Transaction Logged:', creditTransaction);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('❌ Error updating credits:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


// app/api/update-credits/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuth } from '@clerk/nextjs/server'; // Import Clerk's getAuth

export async function PATCH(req: NextRequest) {
  try {
    const { userId } = getAuth(req); // Retrieve userId from Clerk's authentication
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { pointsUsed } = await req.json();

    if (typeof pointsUsed !== 'number' || pointsUsed <= 0) {
      return NextResponse.json({ error: 'Invalid pointsUsed' }, { status: 400 });
    }

    // Fetch user's current credits
    const userCredits = await db.userCredits.findUnique({
      where: { userId },
    });

    if (!userCredits) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has enough credits
    if (userCredits.credits < pointsUsed) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 400 });
    }

    // Update credits and usedCredits atomically
    await db.userCredits.update({
      where: { userId },
      data: {
        credits: { decrement: pointsUsed },
        usedCredits: { increment: pointsUsed },
      },
    });

    // Log the credit transaction
    await db.creditTransaction.create({
      data: {
        userId,
        type: 'DEDUCTION', // Use the enum value directly
        amount: pointsUsed,
        description: 'Create Presentation',
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error updating credits:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

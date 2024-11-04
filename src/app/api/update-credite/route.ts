// /api/update-credits/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PATCH(req: NextRequest) {
  try {
    const { userId, pointsUsed } = await req.json();

    if (!userId || !pointsUsed) {
      return NextResponse.json({ error: 'Missing userId or pointsUsed' }, { status: 400 });
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

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error updating credits:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

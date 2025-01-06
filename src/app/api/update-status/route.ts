
// /api/update-status/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs'; // Ensure Node.js runtime


export async function PATCH(req: NextRequest) {
  try {
    const { userId, pagesUsed } = await req.json();

    if (!userId || !pagesUsed) {
      return NextResponse.json({ error: 'Missing userId or pagesUsed' }, { status: 400 });
    }

    // Fetch user's current credits
    const userCredits = await db.userCredits.findUnique({
      where: { userId },
    });

    if (!userCredits) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has enough credits
    if (userCredits.credits < pagesUsed) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 400 });
    }

    // Update credits and usedCredits atomically
    await db.userCredits.update({
      where: { userId },
      data: {
        credits: { decrement: pagesUsed },
        usedCredits: { increment: pagesUsed },
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error updating credits:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


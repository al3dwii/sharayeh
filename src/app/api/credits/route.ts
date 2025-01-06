// app/api/credits/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuth } from '@clerk/nextjs/server'; // Import Clerk's getAuth

export const runtime = 'nodejs'; // Ensure Node.js runtime

export const dynamic = 'force-dynamic';


export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req); // Retrieve userId from Clerk's authentication
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch credits from the database
    const userCredits = await db.userCredits.findUnique({
      where: { userId },
      select: { credits: true },
    });

    if (!userCredits) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ credits: userCredits.credits }, { status: 200 });
  } catch (error) {
    console.error('Error fetching credits:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

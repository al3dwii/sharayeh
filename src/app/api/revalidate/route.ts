// app/api/revalidate-dashboard/route.ts
import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

// API route to revalidate the dashboard page
export async function POST() {
  // Revalidate the dashboard path
  revalidatePath('/dashboard');
  return NextResponse.json({ revalidated: true });
}

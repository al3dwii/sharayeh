"use client";

import { useAuth } from "@clerk/nextjs";

/**
 * Get a JWT for the backend API (Clerk template).
 */
export function useApiToken() {
  const { getToken, isSignedIn } = useAuth();

  async function fetchToken(): Promise<string | null> {
    if (!isSignedIn) return null;
    try {
      // template must match CLERK_JWT_TEMPLATE in backend (.env)
      return await getToken({ template: process.env.NEXT_PUBLIC_CLERK_JWT_TEMPLATE ?? "doc2deck-api" });
    } catch {
      return null;
    }
  }

  return fetchToken;
}

"use client";

// import posthog from "posthog-js";
import { useAuth } from "@clerk/nextjs";

const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

if (key) {
  // posthog.init(key, { api_host: host });
}

async function sendBatch(events: {event:string;props:any}[], token: string | null) {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";
  await fetch(`${apiBase}/api/v1/events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ events }),
  });
}

export function useAnalytics() {
  const { getToken, isSignedIn, userId } = useAuth();

  async function capture(name: string, props: any = {}) {
    if (key) {
      // posthog.capture(name, props);
      // if (userId) posthog.identify(userId);
    }
    const token = await getToken({ template: process.env.NEXT_PUBLIC_CLERK_JWT_TEMPLATE ?? "doc2deck-api" }).catch(() => null);
    sendBatch([{ event: name, props }], token);
  }

  return { capture };
}

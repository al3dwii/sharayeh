// src/middleware.ts
import { NextResponse, type NextRequest, type NextFetchEvent } from 'next/server';
import { clerkMiddleware } from '@clerk/nextjs/server';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

// 1) Next-intl middleware
const intlMiddleware = createIntlMiddleware(routing);

export default function middleware(req: NextRequest, ev: NextFetchEvent) {
  // run i18n first
  const i18nResponse = intlMiddleware(req);

  // then run Clerk
  return clerkMiddleware(() => i18nResponse)(req, ev);
}

export const config = {
  // apply to all page routes (skip API, _next, etc.)
  matcher: ['/((?!api|trpc|_next|_vercel|.*\\..*).*)']
};

// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest, NextFetchEvent } from "next/server";
import { clerkMiddleware } from "@clerk/nextjs/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

export default function middleware(req: NextRequest, ev: NextFetchEvent) {
  // if this is an API call, just run Clerk and skip i18n
  if (req.nextUrl.pathname.startsWith("/api")) {
    return clerkMiddleware()(req, ev);
  }

  // otherwise, first do i18n, then Clerk
  const i18nResponse = intlMiddleware(req);
  return clerkMiddleware(() => i18nResponse)(req, ev);
}

export const config = {

    // all your pages (everything except _next, static assets, etc)
    matcher: ['/((?!api|trpc|_next|_vercel|.*\\..*).*)',

    // and all API routes, so Clerk still protects them
    "/api/:path*",
  ],
};


// // src/middleware.ts
// import { NextResponse, type NextRequest, type NextFetchEvent } from 'next/server';
// import { clerkMiddleware } from '@clerk/nextjs/server';
// import createIntlMiddleware from 'next-intl/middleware';
// import { routing } from './i18n/routing';

// // 1) Next-intl middleware
// const intlMiddleware = createIntlMiddleware(routing);

// export default function middleware(req: NextRequest, ev: NextFetchEvent) {
//   // run i18n first
//   const i18nResponse = intlMiddleware(req);

//   // then run Clerk
//   return clerkMiddleware(() => i18nResponse)(req, ev);
// }



// export const config = {
//   // apply to all page routes (skip API, _next, etc.)
//   matcher: ['/((?!api|trpc|_next|_vercel|.*\\..*).*)',
  
//   "/api/:path*" ]

// };

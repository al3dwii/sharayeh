// middleware.ts (at project root)
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import createIntlMiddleware from "next-intl/middleware";

const intlMiddleware = createIntlMiddleware({
  locales: ["en", "ar"],
  defaultLocale: "ar",
});

// these paths should remain public (no redirect to sign‑in)
const isPublicRoute = createRouteMatcher([
  "/",               // home
  "/pricing",        // bare pricing
  "/(en|ar)",        // /en or /ar
  "/(en|ar)/pricing" ,// /en/pricing or /ar/pricing
  "/:locale(en|ar)/:path*" 
]);

export default clerkMiddleware(async (auth, req) => {
  // 1) protect everything except our public routes
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
  // 2) then run your i18n middleware
  return intlMiddleware(req);
});

export const config = {
  matcher: ['/', '/pricing', '/(en|ar)/:path*', '/api/:path*']

  // make sure middleware runs on /pricing, /en/*, /ar/*, etc.
 
};


// // middleware.ts (at project root)
// import { clerkMiddleware } from "@clerk/nextjs/server";
// import createIntlMiddleware from "next-intl/middleware";

// const intlMiddleware = createIntlMiddleware({
//   locales: ["en", "ar"],
//   defaultLocale: "ar",
// });

// export default clerkMiddleware((auth, req) => {
//   // run i18n after Clerk has attached auth context
//   return intlMiddleware(req);
// });

// export const config = {
//   matcher: ["/", "/:locale(en|ar)", "/:locale(en|ar)/:path*"],
// };


// // middleware.ts
// import createIntlMiddleware from 'next-intl/middleware';

// export default createIntlMiddleware({
//   locales: ['ar','en'],
//   defaultLocale: 'ar'
// });

// export const config = {
//   matcher: [
//     '/((?!_next|api|favicon\\.ico|robots\\.txt|sitemap\\.xml).*)'
//   ]
// };

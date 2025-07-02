// src/middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

/**
 * Routes that should stay PUBLIC (no auth required)
 */
const PUBLIC_ROUTES = [
  '/',                          // home
  '/pricing',
  '/blog/:path*',               // all blog pages
  '/sign-in',
  '/sign-up',
  '/terms-of-service',
  '/privacy-policy',
  '/api/save-file',
  '/api/webhook',
  '/api(.*)',                   // any other open API routes
];

/**
 * Helper returns true when the request *matches* a public route.
 * Any request that does **not** match will be protected.
 */
const isPublicRoute = createRouteMatcher(PUBLIC_ROUTES);

export default clerkMiddleware(async (auth, req) => {
  // Protect every route that is NOT in PUBLIC_ROUTES
  if (!isPublicRoute(req)) {
    await auth.protect();       // 401 → sign-in, 404 if you prefer (`{ unauthorized: '/404' }`)
  }
  // If you have other middleware (intl, i18n, etc) you can call them here.
});

/**
 * Tell Next.js which routes should invoke this middleware.
 * (Same pattern you already had, just copied over.)
 */
export const config = {
  matcher: [
    // Skip Next.js internals & static files
    '/((?!.*\\..*|_next).*)',
  ],
};

// import { authMiddleware } from "@clerk/nextjs";

// export default authMiddleware({
//   // publicRoutes: ["/api/uploadthing","((?!^/admin/).*)"],
//   publicRoutes: ["/", "/pricing", "/blog", "/api(.*)", "/api/save-file", "/api/webhook"],




  
// });

// export const config = {
//   matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
// };



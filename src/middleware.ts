// src/middleware.ts
import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";

// 1) Define routes that do NOT require auth:
const PUBLIC_ROUTES = [
  "/",
  "/pricing",
  "/blog",
  "/sign-in",
  "/sign-up",
  "/api/save-file",
  "/api/webhook",
  "/blog/:path*",    
  "/terms-of-service",
  "/privacy-policy",
  "/api(.*)", 

  // Add other public routes as needed
];

// 2) Export your Clerk middleware:
export default authMiddleware({
  publicRoutes: PUBLIC_ROUTES,
  // Optional: you can define afterAuth or beforeAuth if needed
  // afterAuth(auth, req) {
  //   return NextResponse.next();
  // },
});

// 3) Configure which routes run the middleware:
export const config = {
  matcher: [
    // Match all routes except:
    //  - _next (Next.js internals)
    //  - static files (any dot extension like .png, .js, .css, etc.)
    "/((?!.*\\..*|_next).*)",
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



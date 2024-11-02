
import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  // publicRoutes: ["/api/uploadthing","((?!^/admin/).*)"],
  publicRoutes: ["/", "/pricing", "/blog", "/api(.*)", "/api/save-file", "/api/webhook"],




  
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};



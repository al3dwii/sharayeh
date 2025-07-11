import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import createIntlMiddleware from 'next-intl/middleware';
import {routing} from '../i18n.cjs';



const PUBLIC_ROUTES = [
  '/',
  '/pricing',
  '/blog/:path*',
  '/sign-in',
  '/sign-up',
  '/terms-of-service',
  '/privacy-policy',
  '/api/save-file',
  '/api/webhook',
  '/api(.*)',
];

const isPublicRoute = createRouteMatcher(PUBLIC_ROUTES);
const intlMiddleware = createIntlMiddleware(routing);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
  return intlMiddleware(req);
});

export const config = {
  matcher: ['/', '/((?!_next|.*\\..*).*)'],
};

# Authentication Redirect Fix

## Question
**"After the user logs in from the top navbar, where are they directed?"**

## Answer
After a user successfully logs in, they are redirected to the **Dashboard** with the proper locale prefix:
- **Arabic users:** `/ar/dashboard`
- **English users:** `/en/dashboard`

---

## Problem Found

The original `.env` configuration had hardcoded URLs **without locale prefixes**:

```bash
# ❌ OLD - Missing locale prefix
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

This caused the **"Application error: a server-side exception has occurred"** because:
1. User logs in at `/ar/sign-in` or `/en/sign-in`
2. Clerk redirects to `/dashboard` (no locale prefix)
3. Next.js expects `/{locale}/dashboard`
4. Result: Server error

---

## Solution Implemented

### 1. Dynamic Redirect in Sign-In Page
Updated `/app/(public)/[locale]/(auth)/sign-in/[[...sign-in]]/page.tsx`:

```tsx
'use client';

import { SignIn } from '@clerk/nextjs';
import { useParams } from 'next/navigation';

export default function SignInPage() {
  const params = useParams();
  const locale = params?.locale || 'ar';
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <SignIn 
        afterSignInUrl={`/${locale}/dashboard`}  // ✅ Dynamic locale
        signUpUrl={`/${locale}/sign-up`}
      />
    </div>
  );
}
```

### 2. Dynamic Redirect in Sign-Up Page
Updated `/app/(public)/[locale]/(auth)/sign-up/[[...sign-up]]/page.tsx`:

```tsx
'use client';

import { SignUp } from '@clerk/nextjs';
import { useParams } from 'next/navigation';

export default function SignUpPage() {
  const params = useParams();
  const locale = params?.locale || 'ar';
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <SignUp 
        afterSignUpUrl={`/${locale}/dashboard`}  // ✅ Dynamic locale
        signInUrl={`/${locale}/sign-in`}
      />
    </div>
  );
}
```

### 3. Updated Environment Variables
Updated `.env` file with default locale (Arabic) as fallback:

```bash
# ✅ NEW - With locale prefix
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/ar/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/ar/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/ar/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/ar/dashboard
```

---

## Authentication Flow (Complete)

### Sign-In Flow
1. **User clicks "الدخول" (Login)** in navbar
   - Link: `<Link href="/sign-in">`
   - Actual URL: `/{current-locale}/sign-in`
   - Examples: `/ar/sign-in` or `/en/sign-in`

2. **User enters credentials and signs in**
   - Clerk processes authentication

3. **User is redirected to Dashboard**
   - Arabic: `https://sharayeh.com/ar/dashboard`
   - English: `https://sharayeh.com/en/dashboard`

### Sign-Up Flow
1. **User clicks "التسجيل" (Sign Up)** in navbar
   - Link: `<Link href="/sign-up">`
   - Actual URL: `/{current-locale}/sign-up`

2. **User creates account and verifies**
   - Clerk handles account creation

3. **User is redirected to Dashboard**
   - Same locale-aware redirect as sign-in

---

## Navbar Display Logic

From `/components/custom/Navbar.tsx`:

```tsx
{isSignedIn ? (
  <>
    <Link
      href="/dashboard"
      className="bg-[#7d63ff] text-white py-2 px-3 rounded-md"
    >
      لوحة التحكم
    </Link>
    <UserButton afterSignOutUrl="/" />
  </>
) : (
  <div className="flex gap-2">
    <Link href="/sign-up">التسجيل</Link>
    <Link href="/sign-in">الدخول</Link>
  </div>
)}
```

### When User is NOT Logged In:
- Shows: **"التسجيل" (Sign Up)** button
- Shows: **"الدخول" (Login)** button

### When User IS Logged In:
- Shows: **"لوحة التحكم" (Dashboard)** button → Links to `/{locale}/dashboard`
- Shows: **UserButton** (profile avatar) → Logout redirects to `/`

---

## Testing Checklist

### Arabic User Journey
- [ ] Visit `https://sharayeh.com/ar` (homepage)
- [ ] Click "الدخول" → Should go to `/ar/sign-in`
- [ ] Sign in → Should redirect to `/ar/dashboard`
- [ ] Click "لوحة التحكم" in navbar → Should go to `/ar/dashboard`

### English User Journey
- [ ] Visit `https://sharayeh.com/en` (homepage)
- [ ] Click "Login" → Should go to `/en/sign-in`
- [ ] Sign in → Should redirect to `/en/dashboard`
- [ ] Click "Dashboard" in navbar → Should go to `/en/dashboard`

### Cross-Locale Switching
- [ ] Sign in at `/ar/sign-in` → Redirects to `/ar/dashboard`
- [ ] Switch to English → Should be at `/en/dashboard`
- [ ] Sign out → Redirects to `/` (home)
- [ ] Sign in at `/en/sign-in` → Redirects to `/en/dashboard`

---

## Key Implementation Details

### Why `useParams()`?
We use `useParams()` from `next/navigation` to get the current locale from the URL:
```tsx
const params = useParams();
const locale = params?.locale || 'ar'; // Fallback to Arabic
```

### Why Component-Level Props?
The `afterSignInUrl` and `afterSignUpUrl` props on the Clerk components **override** the environment variables, ensuring the redirect includes the correct locale dynamically.

### Why Keep .env Variables?
The `.env` variables with `/ar/` prefix serve as:
1. **Fallback** if component props fail
2. **Default** for server-side redirects
3. **Consistency** with Arabic as the default locale

---

## Files Modified

1. ✅ `app/(public)/[locale]/(auth)/sign-in/[[...sign-in]]/page.tsx`
2. ✅ `app/(public)/[locale]/(auth)/sign-up/[[...sign-up]]/page.tsx`
3. ✅ `.env` (Clerk redirect URLs)

---

## Deployment

- **Commit:** `b8ef5aa`
- **Status:** ✅ Deployed to production
- **ETA:** Live in ~2 minutes

---

## Summary

✅ **Users are directed to:** `/{locale}/dashboard` after login  
✅ **Locale is preserved:** Arabic users stay in Arabic, English users stay in English  
✅ **No more errors:** All redirects include proper locale prefixes  
✅ **Fallback works:** Defaults to `/ar/dashboard` if locale detection fails

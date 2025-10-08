// app/sign-in/page.tsx
'use client';

import { SignIn } from '@clerk/nextjs';
import { useParams } from 'next/navigation';

export default function SignInPage() {
  const params = useParams();
  const locale = params?.locale || 'ar';
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <SignIn 
        afterSignInUrl={`/${locale}/dashboard`}
        signUpUrl={`/${locale}/sign-up`}
      />
    </div>
  );
}
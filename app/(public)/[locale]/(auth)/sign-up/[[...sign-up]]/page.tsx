// app/sign-up/page.tsx
'use client';

import { SignUp } from '@clerk/nextjs';
import { useParams } from 'next/navigation';

export default function SignUpPage() {
  const params = useParams();
  const locale = params?.locale || 'ar';
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <SignUp 
        afterSignUpUrl={`/${locale}/dashboard`}
        signInUrl={`/${locale}/sign-in`}
      />
    </div>
  );
}

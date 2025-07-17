// app/sign-up/page.tsx
'use client';

import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <SignIn />
    </div>
  );
}


// import { SignIn } from '@clerk/nextjs'
// import React from 'react'

// const Page = () => {
//   return <SignIn />
// }

// export default Page

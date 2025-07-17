// app/sign-up/page.tsx
'use client';

import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <SignUp />
    </div>
  );
}

// import { SignUp } from '@clerk/nextjs'
// import React from 'react'


// const Page = () => {
//   return <SignUp />
// }

// export default Page

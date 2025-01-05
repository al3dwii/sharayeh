// app/layout.tsx

import './globals.css';
import { Metadata } from 'next';
import { Tajawal } from "next/font/google"; 
import { cn } from "@/components/ui/cn";
import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import Providers from '@/components/Providers'; // Import the client Providers component
import { getAllUserData, UserData } from '../lib/getAllUserData';
import { auth } from '@clerk/nextjs';
import { arSA } from '@clerk/localizations';
import { ReactNode } from 'react';
import { db } from "@/lib/db";

const tajawal = Tajawal({
  subsets: ["latin", "arabic"], 
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: 'sharayeh',
  description: 'Powerpoint by Ai in minutes',
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const { userId } = auth();

  let userData: UserData = null;

  if (userId) {

    // 1) Ensure userCredits exist
    await db.userCredits.upsert({
      where: { userId },
      create: { userId, credits: 150, usedCredits: 0 },
      update: {},
    });

    userData = await getAllUserData(userId);
  }

  return (
    <ClerkProvider localization={arSA} appearance={{ baseTheme: dark }}>
      <html dir="rtl" lang="ar" suppressHydrationWarning>
        <body className={cn("min-h-screen font-sans antialiased", tajawal.className)}>
          <Providers userData={userData}>
            {children}
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}



// import type { Metadata } from 'next'
// import { Tajawal } from "next/font/google"; 
// import { cn } from "@/components/ui/cn";

// import './globals.css'
// import { ClerkProvider } from '@clerk/nextjs'
// import { dark } from '@clerk/themes'
// import { ThemeProvider } from '@/providers/theme-provider'
// import { ModalProvider } from '@/components/modal-provider'
// import { Toaster } from '@/components/ui/toaster'
// import { Toaster as SonnarToaster } from '@/components/ui/sonner'
// import { CrispProvider } from '@/components/custom/crisp-provider';
// import { ToasterProvider } from '@/components/toaster-provider';
// import { arSA } from '@clerk/localizations'
// import { CreditProvider } from '@/contexts/CreditContext';
// import { UserProvider } from "@/contexts/UserContext"; 
// import ProModal from '@/components/ProModal'; // Ensure correct casing and path
// import Navbar from '@/components/custom/Navbar'
// import { Footer } from "@/components/gadawel/footer";

// import React, { Suspense } from 'react';
// import { getAllUserData, UserData } from '../lib/getAllUserData';
// import UserContext from '../context/UserContext';
// import { auth } from '@clerk/nextjs';
// import { ReactNode } from 'react';




// const tajawal = Tajawal({
//   subsets: ["latin", "arabic"], 
//   weight: ["400", "500", "700"],
// });

// export const metadata: Metadata = {
//   title: 'sharayeh',
//   description: 'Powerpoint by Ai in minutes',
// }
// export default async function RootLayout({ children }: { children: ReactNode }) {

//   const { userId } = auth();

//   let userData: UserData = null;

//   if (userId) {
//     userData = await getAllUserData(userId);
//   }

//   return (

//     <ClerkProvider localization={arSA}  appearance={{ baseTheme: dark }}>
//           <UserProvider>
//             <CreditProvider>

//             <CrispProvider />
            
//     <html
//       dir="rtl" lang="ar"
//       suppressHydrationWarning
//     >
//       <body  className={cn(
//           "min-h-screen font-sans antialiased",
//           tajawal.className,
          
//         )}>
//         <ThemeProvider
//           attribute="class"
//           defaultTheme="light"
//           enableSystem
//           disableTransitionOnChange
//         >
//           <ModalProvider />
//           <Navbar />
//           <Suspense fallback={<div>Loading...</div>}>

//           <UserContext.Provider value={userData}>

//           {children}
//           </UserContext.Provider>

//           </Suspense>

//           <Footer />

//           <ProModal />

//             <ToasterProvider />
//             <SonnarToaster position="bottom-left" />
//         </ThemeProvider>
//       </body>

//     </html>
//     </CreditProvider>
//     </UserProvider>

//     </ClerkProvider>
//   )
// }

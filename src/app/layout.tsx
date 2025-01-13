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

import Script from 'next/script'; // Ensure Script is imported


export const runtime = 'nodejs'

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
      create: { userId, credits: 200, usedCredits: 0 },
      update: {},
    });

    userData = await getAllUserData(userId);
  }

  return (
    <ClerkProvider localization={arSA} appearance={{ baseTheme: dark }}>
      <html dir="rtl" lang="ar" suppressHydrationWarning>
        <head>
          {/* Google Tag Manager (gtag.js) - External Script */}
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=AW-10933947515"
            strategy="afterInteractive"
          />

          {/* Google Tag Manager (gtag.js) - Initialization Script */}
          <Script id="gtag-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());

              gtag('config', 'AW-10933947515');
            `}
          </Script>

          <meta name="google-site-verification" content="eOKcdBbRZYfmlspMg_bdwClFZW6v9uZ9ni5P9psl0Mc" />

          {/* You can include other head elements here if necessary */}
        </head>
        <body className={cn("min-h-screen font-sans antialiased", tajawal.className)}>
          <Providers userData={userData}>
            {children}
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}


// // app/layout.tsx

// import './globals.css';
// import { Metadata } from 'next';
// import { Tajawal } from "next/font/google"; 
// import { cn } from "@/components/ui/cn";
// import { ClerkProvider } from '@clerk/nextjs';
// import { dark } from '@clerk/themes';
// import Providers from '@/components/Providers'; // Import the client Providers component
// import { getAllUserData, UserData } from '../lib/getAllUserData';
// import { auth } from '@clerk/nextjs';
// import { arSA } from '@clerk/localizations';
// import { ReactNode } from 'react';
// import { db } from "@/lib/db";

// import Script from 'next/script';


// export const runtime = 'nodejs'

// const tajawal = Tajawal({
//   subsets: ["latin", "arabic"], 
//   weight: ["400", "500", "700"],
// });

// export const metadata: Metadata = {
//   title: 'sharayeh',
//   description: 'Powerpoint by Ai in minutes',
// };

// export default async function RootLayout({ children }: { children: ReactNode }) {
//   const { userId } = auth();

//   let userData: UserData = null;

//   if (userId) {

//     // 1) Ensure userCredits exist
//     await db.userCredits.upsert({
//       where: { userId },
//       create: { userId, credits: 200, usedCredits: 0 },
//       update: {},
//     });

//     userData = await getAllUserData(userId);
//   }

//   return (
//     <ClerkProvider localization={arSA} appearance={{ baseTheme: dark }}>
//       <html dir="rtl" lang="ar" suppressHydrationWarning>
//         <body className={cn("min-h-screen font-sans antialiased", tajawal.className)}>
//           <Providers userData={userData}>
//             {children}
//           </Providers>
//         </body>
//       </html>
//     </ClerkProvider>
//   );
// }


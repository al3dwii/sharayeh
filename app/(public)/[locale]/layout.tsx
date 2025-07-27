
// app/(public)/[locale]/layout.tsx
import '../../globals.css';

import { NextIntlClientProvider } from 'next-intl';
import Providers from '@/components/Providers';
import PlanWrapper from '@/components/PlanWrapper';

import { auth } from '@clerk/nextjs/server';
import { getAllUserData, UserData } from '@/lib/getAllUserData';
import { db } from '@/lib/db';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://sharayeh.com'),   // ← production origin
  // …any other site‑wide metadata
};

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // 1. Authenticate & ensure the user has a credits record
  const { userId } = await auth();
  let userData: UserData | null = null;
  if (userId) {
    await db.userCredits.upsert({
      where:  { userId },
      create: { userId, credits: 500, usedCredits: 0 },
      update: {},
    });
    userData = await getAllUserData(userId);
  }

  // 2. Dynamically load your locale messages
  //    (three levels up from app/(public)/[locale]/layout.tsx to reach /messages)
  const messages = (await import(`../../../messages/${locale}.json`)).default;
    // Determine RTL vs LTR; add other RTL languages if needed
  const isRTL = locale === 'ar';

  return (
    <html lang={locale} dir={isRTL ? 'rtl' : 'ltr'}>
      <body>
     
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers userData={userData}>
            <PlanWrapper>{children}</PlanWrapper>
          </Providers>
        </NextIntlClientProvider>
     
     </body>
    </html>
  );
}


// // app/[locale]/layout.tsx
// import "../../globals.css";

// import {NextIntlClientProvider} from 'next-intl';
// import {getMessages} from 'next-intl/server';   
// import { auth } from '@clerk/nextjs/server';
// import Providers from '@/components/Providers';
// import {getAllUserData, UserData} from '@/lib/getAllUserData';
// import {db} from '@/lib/db';
// import { WatermarkRibbon } from '@/components/WatermarkRibbon';
// import { useUserPlan } from '@/context/UserContext';

// function PlanWrapper({ children }: { children: React.ReactNode }) {
//   const plan = useUserPlan();
//   return (
//     <>
//       {plan === "Free" && <WatermarkRibbon />}
//       {children}
//     </>
//   );
// }


// export default async function LocaleLayout({
//   children,
//   params: {locale},
// }: {
//   children: React.ReactNode;
//   params: {locale: string}; 
// }) {

//   const {userId} = await auth();
//   let userData: UserData | null = null;
//   if (userId) {
//     await db.userCredits.upsert({
//       where:    {userId},
//       create:   {userId, credits: 500, usedCredits: 0},
//       update:   {},
//     });
//     userData = await getAllUserData(userId);
//   }
//   // const messages = getMessages();  
//   const messages = (await import(`../../../messages/${locale}.json`)).default;


//   return (
//     <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
//       <body>
//         <NextIntlClientProvider locale={locale} messages={messages}>
//             <Providers userData={userData}>
//               <PlanWrapper>{children}</PlanWrapper>
//             </Providers>
//         </NextIntlClientProvider>
//       </body>
//     </html>
//   );
// }

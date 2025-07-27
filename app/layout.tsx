// app/layout.tsx
import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import { siteUrl, siteName, defaultDescription, ogImage } from '@/utils/seo';
import { getAllTools } from '@/lib/tools';
import StructuredData from '@/components/StructuredData';

export default async function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Determine whether the current locale uses right‑to‑left text direction
  const isArabic = locale === 'ar';

  return (
    <ClerkProvider>
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1,maximum-scale=5"
        />
        {/* new default description */}
        <meta name="description" content={defaultDescription} />
        <link rel="canonical" href={`${siteUrl}/${locale}/`} />
        <link rel="icon" href="/favicon.ico" />

        {/* Global WebSite JSON-LD: include all tools */}
        <StructuredData
          type="WebSite"                         // ✅ add this line
          data={{
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: siteName,
            url: siteUrl,
            description: defaultDescription,
            inLanguage: ['en', 'ar'],
            potentialAction: {
              '@type': 'SearchAction',
              target: `${siteUrl}/search?q={search_term_string}`,
              'query-input': 'required name=search_term_string',
            },
            hasPart: {
              '@type': 'ItemList',
              name: 'Available Automation Tools',
              itemListElement: (await getAllTools()).map((tool, i) => ({
                '@type': 'SoftwareApplication',
                position: i + 1,
                name: tool.label_en,
                applicationCategory: tool.dir.replace('→', ' to '),
                url: `${siteUrl}/tools/${tool.slug_en}`,
              })),
            },
          }}
        />
      </head>
      <body>{children}</body>
    </ClerkProvider>
  );
}


// // app/layout.tsx
// import './globals.css';
// import { ClerkProvider } from '@clerk/nextjs'; // App‑Router entrypoint


// export default function RootLayout({
//   children,
//   params: { locale },
// }: {
//   children: React.ReactNode;
//   params: { locale: string };
// }) {
//   return (
//     <ClerkProvider>
//     <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
//       <head />
//       <body>{children}</body>
//     </html>
//      </ClerkProvider>
//   );
// }


// import { ClerkProvider } from '@clerk/nextjs';
// import {ReactNode} from 'react';

// export default function RootLayout({  children
// }: {
//   children: ReactNode;
// }) {
//   return <ClerkProvider>{children}</ClerkProvider>;
// }


// // src/app/ar/layout.tsx
// import './globals.css';
// import {ReactNode} from 'react';
// import {Tajawal} from 'next/font/google';
// import {cn} from '@/components/ui/cn';
// import {ClerkProvider} from '@clerk/nextjs';
// import {neobrutalism} from '@clerk/themes';
// import Providers from '@/components/Providers';
// import {getAllUserData, UserData} from '@/lib/getAllUserData';
// import {auth} from '@clerk/nextjs/server';
// import {arSA} from '@clerk/localizations';
// import {db} from '@/lib/db';
// import Script from 'next/script';

// export const revalidate = 600;
// export const runtime   = 'nodejs';

// const tajawal = Tajawal({
//   subsets: ['latin', 'arabic'],
//   weight: ['400', '500', '700'],
// });

// export default async function ArLayout({
//   children
// }: {
//   children: ReactNode;
// }) {
//   // auth + data (unchanged)
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

//   // static locale for this folder
//   const locale = 'ar';
//   // const messages = (await import(`../../messages/${locale}.json`)).default;

//   return (
//     <ClerkProvider localization={arSA} appearance={{ baseTheme: neobrutalism }}>
//       <html lang="ar" dir="rtl" suppressHydrationWarning>
//         <head>
//           <Script
//             src="https://www.googletagmanager.com/gtag/js?id=AW-10933947515"
//             strategy="afterInteractive"
//           />
//           <Script id="gtag-init" strategy="afterInteractive">
//             {`
//               window.dataLayer = window.dataLayer || [];
//               function gtag(){dataLayer.push(arguments);}
//               gtag('js', new Date());
//               gtag('config', 'AW-10933947515');
//             `}
//           </Script>
//           <meta
//             name="google-site-verification"
//             content="eOKcdBbRZYfmlspMg_bdwClFZW6v9uZ9ni5P9psl0Mc"
//           />
//           <meta
//             name="trustpilot-one-time-domain-verification-id"
//             content="7db7259e-0557-45de-b6d9-7b74f682e516"
//           />
//         </head>
//         <body
//           className={cn(
//             'min-h-screen font-sans antialiased',
//             tajawal.className
//           )}
//         >
//             <Providers userData={userData}>{children}</Providers>
//         </body>
//       </html>
//     </ClerkProvider>
//   );
// }


// // import '../globals.css';
// // // import {NextIntlClientProvider, useMessages} from 'next-intl';
// // // import {routing} from '../../../i18n.cjs';


// // import '../globals.css';
// // import {NextIntlClientProvider} from 'next-intl';
// // import { routing } from '../../i18n/routing';   // ← ADD THIS LINE

// // import {ReactNode} from 'react';
// // import {Tajawal} from 'next/font/google';
// // import {cn} from '@/components/ui/cn';
// // import {ClerkProvider} from '@clerk/nextjs';
// // import {neobrutalism} from '@clerk/themes';
// // import Providers from '@/components/Providers';
// // import {getAllUserData, UserData} from '@/lib/getAllUserData';
// // import {auth} from '@clerk/nextjs/server';
// // import {arSA} from '@clerk/localizations';
// // import {db} from '@/lib/db';
// // import Script from 'next/script';

// // export const dynamicParams = false;
// // export function generateStaticParams() {
// //   return routing.locales.map((locale) => ({locale}));
// // }
// // export const revalidate = 600;
// // export const runtime = 'nodejs';

// // const tajawal = Tajawal({
// //   subsets: ['latin', 'arabic'],
// //   weight: ['400', '500', '700'],
// // });

// // export default async function RootLayout(
// //   {children, params: {locale}}: {children: ReactNode; params: {locale: string}}
// // ) {
// //   const {userId} = await auth();
// //   let userData: UserData | null = null;

// //   if (userId) {
// //     await db.userCredits.upsert({
// //       where: {userId},
// //       create: {userId, credits: 500, usedCredits: 0},
// //       update: {},
// //     });
// //     userData = await getAllUserData(userId);
// //   }

// //   const messages = (await import(`../../messages/${locale}.json`)).default;

// //   return (
// //     <ClerkProvider localization={arSA} appearance={{baseTheme: neobrutalism}}>
// //       <html
// //         lang={locale}
// //         dir={locale === 'ar' ? 'rtl' : 'ltr'}
// //         suppressHydrationWarning
// //       >
// //         <head>
// //           <Script
// //             src="https://www.googletagmanager.com/gtag/js?id=AW-10933947515"
// //             strategy="afterInteractive"
// //           />
// //           <Script id="gtag-init" strategy="afterInteractive">
// //             {`
// //               window.dataLayer = window.dataLayer || [];
// //               function gtag(){dataLayer.push(arguments);}
// //               gtag('js', new Date());
// //               gtag('config', 'AW-10933947515');
// //             `}
// //           </Script>
// //           <meta name="google-site-verification" content="eOKcdBbRZYfmlspMg_bdwClFZW6v9uZ9ni5P9psl0Mc" />
// //           <meta name="trustpilot-one-time-domain-verification-id" content="7db7259e-0557-45de-b6d9-7b74f682e516" />
// //         </head>
// //         <body className={cn('min-h-screen font-sans antialiased', tajawal.className)}>
// //           <NextIntlClientProvider locale={locale} messages={messages}>
// //             <Providers userData={userData}>{children}</Providers>
// //           </NextIntlClientProvider>
// //         </body>
// //       </html>
// //     </ClerkProvider>
// //   );
// // }

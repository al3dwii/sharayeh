import '../globals.css';
import {NextIntlClientProvider, useMessages} from 'next-intl';
import {routing} from '../../../i18n.cjs';
import {ReactNode} from 'react';
import {Tajawal} from 'next/font/google';
import {cn} from '@/components/ui/cn';
import {ClerkProvider} from '@clerk/nextjs';
import {neobrutalism} from '@clerk/themes';
import Providers from '@/components/Providers';
import {getAllUserData, UserData} from '@/lib/getAllUserData';
import {auth} from '@clerk/nextjs/server';
import {arSA} from '@clerk/localizations';
import {db} from '@/lib/db';
import Script from 'next/script';

export const dynamicParams = false;
export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}
export const revalidate = 600;
export const runtime = 'nodejs';

const tajawal = Tajawal({
  subsets: ['latin', 'arabic'],
  weight: ['400', '500', '700'],
});

export default async function RootLayout(
  {children, params: {locale}}: {children: ReactNode; params: {locale: string}}
) {
  const {userId} = await auth();
  let userData: UserData | null = null;

  if (userId) {
    await db.userCredits.upsert({
      where: {userId},
      create: {userId, credits: 500, usedCredits: 0},
      update: {},
    });
    userData = await getAllUserData(userId);
  }

  const messages = useMessages();
  return (
    <ClerkProvider localization={arSA} appearance={{baseTheme: neobrutalism}}>
      <html
        lang={locale}
        dir={locale === 'ar' ? 'rtl' : 'ltr'}
        suppressHydrationWarning
      >
        <head>
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=AW-10933947515"
            strategy="afterInteractive"
          />
          <Script id="gtag-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'AW-10933947515');
            `}
          </Script>
          <meta name="google-site-verification" content="eOKcdBbRZYfmlspMg_bdwClFZW6v9uZ9ni5P9psl0Mc" />
          <meta name="trustpilot-one-time-domain-verification-id" content="7db7259e-0557-45de-b6d9-7b74f682e516" />
        </head>
        <body className={cn('min-h-screen font-sans antialiased', tajawal.className)}>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <Providers userData={userData}>{children}</Providers>
          </NextIntlClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

import {NextIntlClientProvider} from 'next-intl';
import en from '@/messages/en.json';
import {ReactNode} from 'react';
import './globals.css';

export const revalidate = 600;
export const runtime   = 'nodejs';

export default function RootLayout({children}:{children:ReactNode}) {
  return (
    <html lang="en">
      <body>
        <NextIntlClientProvider locale="en" messages={en}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

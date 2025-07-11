// src/components/LocaleLink.tsx
'use client';

import Link, { LinkProps } from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { defaultLocale, locales } from '@/i18n/routing';

export interface LocaleLinkProps
  extends Omit<LinkProps, 'href'>,
    React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: ReactNode;
}

export function LocaleLink({ href, children, ...props }: LocaleLinkProps) {
  const pathname = usePathname() || '';
  const firstSeg = pathname.split('/')[1];
  const currentLocale = locales.includes(firstSeg) ? firstSeg : defaultLocale;
  const prefix = currentLocale === defaultLocale ? '' : `/${currentLocale}`;
  const to = `${prefix}${href}`;

  return (
    <Link href={to} {...props}>
      {children}
    </Link>
  );
}


// // src/components/LocaleLink.tsx
// 'use client';

// import Link, { LinkProps } from 'next/link';
// import { usePathname } from 'next/navigation';
// import { ReactNode } from 'react';
// import { defaultLocale, locales } from '@/i18n/routing';

// export interface LocaleLinkProps extends Omit<LinkProps, 'href'> {
//   href: string;
//   children: ReactNode;
// }

// export function LocaleLink({ href, children, ...props }: LocaleLinkProps) {
//   const pathname = usePathname() || '';
//   // extract first segment (could be 'ar', 'fr', or your default)
//   const firstSeg = pathname.split('/')[1];
//   const currentLocale = locales.includes(firstSeg) ? firstSeg : defaultLocale;
//   const prefix = currentLocale === defaultLocale ? '' : `/${currentLocale}`;

//   return (
//     <Link href={`${prefix}${href}`} {...props}>
//       {children}
//     </Link>
//   );
// }

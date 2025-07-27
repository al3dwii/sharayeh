'use client';
/**
 * LocaleToggle
 * ----------------------------------------------------------------------------
 * • Works inside the App‑Router (`/app/(public)/[locale]/…`)
 * • Detects the current locale from the URL
 * • Builds the same path with the opposite locale and pushes it
 * • No hard‑coded routes; keeps query string & hash intact
 * ----------------------------------------------------------------------------
 */

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { LOCALES } from '@/utils/i18n';
import { Globe2 } from 'lucide-react';          // icon is optional

export default function LocaleToggle() {
  const router       = useRouter();
  const pathname     = usePathname();           // e.g. "/en/tools/word-to-powerpoint"
  const searchParams = useSearchParams();       // keep ?foo=1
  const [ , currentLocale, ...rest ] = pathname.split('/'); // ["", "en", "tools", …]

  const nextLocale: (typeof LOCALES)[number] =
    currentLocale === 'ar' ? 'en' : 'ar';

  /** Build the target path */
  const targetPath =
    `/${nextLocale}/${rest.join('/')}` +
    (searchParams.size ? `?${searchParams.toString()}` : '');

  /** Navigate when clicked */
  const toggle = () => router.push(targetPath);

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1 rounded-md px-6 py-3
                 text-m font-medium bg-muted hover:bg-muted/50"
      aria-label={
        currentLocale === 'ar'
          ? 'التبديل إلى الإنجليزية'
          : 'Switch to Arabic'
      }
    >
      <Globe2 className="h-4 w-4" aria-hidden />
      {currentLocale === 'ar' ? 'English' : 'العربية'}
    </button>
  );
}

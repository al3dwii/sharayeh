// src/components/LocaleToggle.tsx
'use client';

import { usePathname, useRouter } from 'next/navigation';
import { defaultLocale, locales } from '@/i18n/routing';
import { cn } from '@/components/ui/cn';

export function LocaleToggle() {
  const pathname = usePathname() || '/';
  const router = useRouter();

  function switchLocale(lng: string) {
    const newPath = pathname.replace(/^\/(en|ar|fr)/, '');
    const prefix = lng === defaultLocale ? '' : `/${lng}`;
    router.push(`${prefix}${newPath}`);
  }

  return (
    <div className="flex items-center space-x-2">
      {locales.map((lng) => {
        const isActive = lng === defaultLocale
          ? !pathname.startsWith(`/${lng}`)
          : pathname.startsWith(`/${lng}`);
        return (
          <button
            key={lng}
            onClick={() => switchLocale(lng)}
            className={cn(
              'py-1 px-4  rounded text-white text-sm',
              isActive
                ? 'text-white font-semibold'
                : ' text-white '
            )}
          >
            {lng.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}

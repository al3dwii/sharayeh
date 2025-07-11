'use client';
import {usePathname, useRouter} from 'next/navigation';
import { routing } from '../i18n/routing';   // ← ADD THIS LINE

export default function LocaleToggle() {
  const pathname = usePathname();
  const router = useRouter();

  function switchLocale(lng: string) {
    const url = lng === routing.defaultLocale
      ? pathname.replace(/^\/(en|ar)/, '')
      : `/${lng}${pathname}`;
    router.push(url);
  }

  return (
    <button onClick={() => switchLocale('ar')}>العربية</button>
  );
}

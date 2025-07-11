import {defineRouting} from 'next-intl/routing';

export const locales       = ['en', 'ar'];   // add 'es', 'fr', … later
export const defaultLocale = 'en';

// Optional extras you already use
export const localePrefix     = 'as-needed';
export const localeDetection  = true;

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix,
  localeDetection
});

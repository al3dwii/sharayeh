// next-intl.config.js  ✨ MUST use ESM, not require()
import {defineRouting} from 'next-intl/routing';

export const locales       = ['en', 'ar'];   // add 'fr' when ready
export const defaultLocale = 'en';
export const localePrefix  = 'as-needed';
export const localeDetection = false;

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix,
  localeDetection
});

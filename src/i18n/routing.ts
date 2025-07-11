// src/i18n/routing.ts
import {defineRouting} from 'next-intl/routing';

export const locales       = ['en', 'ar', 'fr'];
export const defaultLocale = 'en';

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix:  'as-needed',
  localeDetection: false
});

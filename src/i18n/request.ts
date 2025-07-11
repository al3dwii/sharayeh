// i18n/request.ts  (project root alongside next.config.js)
import {getRequestConfig} from 'next-intl/server';
import {hasLocale} from 'next-intl';
import { routing }          from './routing';    // ← up one level


export default getRequestConfig(async ({requestLocale}) => {
  const localeCandidate = await requestLocale;
  const locale = hasLocale(routing.locales, localeCandidate)
    ? localeCandidate
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});

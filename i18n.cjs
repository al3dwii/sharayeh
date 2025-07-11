// i18n.cjs  – Node can require() this
const {defineRouting} = require('next-intl/routing');

const locales       = ['en', 'ar'];
const defaultLocale = 'en';
const localePrefix  = 'as-needed';
const localeDetection = false;

const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix,
  localeDetection
});

module.exports = {locales, defaultLocale, routing};

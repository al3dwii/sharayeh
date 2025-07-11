const {defineRouting} = require('next-intl/routing');

const locales       = ['en', 'ar'];   // add 'es', 'fr', … later
const defaultLocale = 'en';

// Optional extras you already use
const localePrefix    = 'as-needed';
const localeDetection = true;

const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix,
  localeDetection
});

module.exports = {
  locales,
  defaultLocale,
  localePrefix,
  localeDetection,
  routing
};

const {locales, defaultLocale, routing} = require('./i18n.cjs');


 /** @type {import('next').NextConfig} */
 const nextConfig = {
   reactStrictMode: false,
   // ✅ pass ONLY the keys Next understands
   i18n: {
     locales: routing.locales,
     defaultLocale: routing.defaultLocale
     // leave localeDetection undefined (default=true)
   }
 };

module.exports = nextConfig;

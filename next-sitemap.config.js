/** @type {import('next-sitemap').IConfig} */

const LOCALES = ['en', 'ar'];            // keep in sync with i18n.js / next.config.js
const siteUrl = 'https://sharayeh.com';

module.exports = {
  siteUrl,
  generateRobotsTxt: true,
  generateIndexSitemap: true,            // <sitemapindex> if > 1 file
  sitemapSize: 7000,                     // split if larger

  /* --------------------------------------------------------- *
   * 1  Exclude non‑public routes
   * --------------------------------------------------------- */
  exclude: [
    '/404', '/500', '/_error',
    '/api/*',
  ],

  /* --------------------------------------------------------- *
   * 2  Per‑URL transform
   * --------------------------------------------------------- */
  transform: async (config, url) => {
    /* ---------- Skip any known 404 like /markdown‑to‑powerpoint ---------- */
    if (url.includes('markdown-to-powerpoint')) return null;

    const path = url.replace(config.siteUrl, '');   // '/en/tools/...'
    const isHome = /^\/(en|ar)?$/.test(path);

    /* ---------- Priority tweaks ---------- */
    let priority = 0.7;
    if (isHome) priority = 1;
    else if (/^\/(en|ar)\/tools\//.test(path)) priority = 0.8;

    /* ---------- Build hreflang set ---------- */
    const [ , locale ] = path.match(/^\/(en|ar)/) || [];
    const otherLocale = locale && LOCALES.find((l) => l !== locale);

    const alternateRefs = [];

    if (locale) {
      // Self
      alternateRefs.push({ href: url, hreflang: locale });
      // Other locale
      if (otherLocale) {
        alternateRefs.push({
          href: url.replace(`/${locale}`, `/${otherLocale}`),
          hreflang: otherLocale,
        });
      }
      // x‑default points to same path without locale prefix
      alternateRefs.push({
        href: url.replace(`/${locale}`, ''),
        hreflang: 'x-default',
      });
    }

    /* ---------- Return final <url> object ---------- */
    return {
      loc: url,                         // absolute URL
      lastmod: new Date().toISOString(),
      changefreq: 'weekly',
      priority,
      alternateRefs,
    };
  },
};

// /** @type {import('next-sitemap').IConfig} */
// module.exports = {
//   siteUrl: 'https://sharayeh.com',
//   generateRobotsTxt: true,
//   alternateRefs: [
//     { href: 'https://sharayeh.com/en', hreflang: 'en' },
//     { href: 'https://sharayeh.com/ar', hreflang: 'ar' },
//   ],
//   transform: async (config, url) => {
//     // Append locale versions for blog posts and tools here if needed
//     return {
//       loc: url,
//       changefreq: 'weekly',
//       priority: 0.7,
//     };
//   },
// };

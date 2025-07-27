// next.config.mjs
import createNextIntlPlugin from 'next-intl/plugin';

/* ------------------------------------------------------------------ *
 *  Base Next.js config
 * ------------------------------------------------------------------ */
const nextConfig = {
  reactStrictMode: true,
  swcMinify:       true,

  eslint: {
    /** turn all ESLint errors into warnings at build time */
    ignoreDuringBuilds: true
  }

  // add any other Next.js options here
};

/* ------------------------------------------------------------------ *
 *  Wrap with next‑intl
 * ------------------------------------------------------------------ */
const withNextIntl = createNextIntlPlugin({
  locales:       ['ar', 'en'],
  defaultLocale: 'ar',
  // localeDetection: false,
  // localePrefix: 'always',
  // requestConfig:   './src/i18n/request.ts'
});

export default withNextIntl(nextConfig);


// // next.config.mjs
// import createNextIntlPlugin from 'next-intl/plugin';

// const nextConfig = {
//   // your existing Next.js config...
//   // e.g. reactStrictMode, swcMinify, etc.
// };

// export default createNextIntlPlugin({
//   locales: ['ar','en'],
//   defaultLocale: 'ar',
//   // optional:
//   // localeDetection: false,
//   // localePrefix: 'always'
// })(nextConfig);

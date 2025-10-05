// next.config.mjs
import createNextIntlPlugin from 'next-intl/plugin';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  eslint: {
    ignoreDuringBuilds: true,
  },

  images: {
    // If you're on Next 13.1+ use remotePatterns (recommended)
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      // add any others you use:
      { protocol: 'https', hostname: 'drive.google.com' }, // if you ever embed direct links
    ],
    // For older projects: domains: ['lh3.googleusercontent.com', 'drive.google.com'],
  },

  // 1) Redirect any un‑prefixed /blog or /tools requests into /ar/…
  //    (since defaultLocale is 'ar' and we're always prefixing)
  async redirects() {
    return [
      {
        source: '/blog/:path*',           // matches /blog, /blog/foo, /blog/foo/bar…
        destination: '/ar/blog/:path*',
        permanent: true,                  // 308 by default; add statusCode:301 if you need 301
      },
      {
        source: '/tools/:path*',
        destination: '/ar/tools/:path*',
        permanent: true,
      },
    ];
  },

  // Webpack configuration to handle Node.js modules
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't resolve 'fs', 'path', etc. on client-side
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        stream: false,
        buffer: false,
      };
    }
    return config;
  },
};




const withNextIntl = createNextIntlPlugin({
  locales: ['ar', 'en'],
  defaultLocale: 'ar',
  localeDetection: true,    // set to false if you don’t want automatic redirects based on Accept‑Language
  localePrefix: 'always',   // force `/ar/...` even for the default locale
});

export default withNextIntl(nextConfig);

// // next.config.mjs
// import createNextIntlPlugin from 'next-intl/plugin';

// /* ------------------------------------------------------------------ *
//  *  Base Next.js config
//  * ------------------------------------------------------------------ */
// const nextConfig = {
//   reactStrictMode: true,
//   swcMinify:       true,

//   eslint: {
//     /** turn all ESLint errors into warnings at build time */
//     ignoreDuringBuilds: true
//   }

//   // add any other Next.js options here
// };

// /* ------------------------------------------------------------------ *
//  *  Wrap with next‑intl
//  * ------------------------------------------------------------------ */
// const withNextIntl = createNextIntlPlugin({
//   locales:       ['ar', 'en'],
//   defaultLocale: 'ar',
//   // localeDetection: false,
//   // localePrefix: 'always',
//   // requestConfig:   './src/i18n/request.ts'
// });

// export default withNextIntl(nextConfig);


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

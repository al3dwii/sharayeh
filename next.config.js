// next.config.js
const path = require("path");
const createNextIntlPlugin = require("next-intl/plugin");
const withNextIntl = createNextIntlPlugin(); // ← auto-discovers your intl config

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,

  images: {
    // whitelist Google User Content via a remotePattern
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
    ],
  },

  webpack(config) {
    config.resolve.alias["@"] = path.resolve(__dirname, "src");
    return config;
  },

  // you can keep any other Next.js settings you already had…
};

module.exports = withNextIntl(nextConfig);

// // next.config.js
// const createNextIntlPlugin = require('next-intl/plugin');
// // ① Tell the plugin where to find your request config
// const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   reactStrictMode: false,
//   // …keep your existing options here (images, webpack aliases, env, etc.)
// };

// // ② Wrap & export
// module.exports = withNextIntl(nextConfig);






// const createNextIntlPlugin = require('next-intl/plugin');
// const withNextIntl = createNextIntlPlugin();   // ← add this

// const {locales, defaultLocale} = require('./i18n.cjs');


//  /** @type {import('next').NextConfig} */
//  const nextConfig = {
//    reactStrictMode: false,
//    // ✅ pass ONLY the keys Next understands
//    i18n: {
//      locales,
//      defaultLocale
//      // leave localeDetection undefined (default=true)
//    }
//  };

// module.exports = withNextIntl(nextConfig);

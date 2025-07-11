const {routing} = require('./src/i18n.config');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    
      
    domains: [
      'uploadthing.com',
      'utfs.io',
      'img.clerk.com',
      'subdomain',
      'files.stripe.com',
      'lh3.googleusercontent.com'
    ],
  },
  reactStrictMode: false,
  i18n: routing,
};

module.exports = nextConfig;

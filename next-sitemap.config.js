/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://sharayeh.com',
  generateRobotsTxt: true,
  alternateRefs: [
    { href: 'https://sharayeh.com/en', hreflang: 'en' },
    { href: 'https://sharayeh.com/ar', hreflang: 'ar' },
  ],
  transform: async (config, url) => {
    // Append locale versions for blog posts and tools here if needed
    return {
      loc: url,
      changefreq: 'weekly',
      priority: 0.7,
    };
  },
};

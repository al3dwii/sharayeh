/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://sharayeh.com',
  generateRobotsTxt: true,
  changefreq: 'weekly',
  alternateRefs: [
    {href: 'https://sharayeh.com', hreflang: 'en'},
    {href: 'https://sharayeh.com/ar', hreflang: 'ar'},
  ],
};

const { getRoutes } = require('./dist/lib/routes');

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://sharayeh.com',
  transform: async (config, path) => {
    if (!path.startsWith('/ar/')) return null;
    return { loc: `https://sharayeh.com${path}`, changefreq: 'weekly', priority: 0.8 };
  },
  additionalPaths: async () => {
    const rows = getRoutes();
    return rows.map(r => ({ loc: `/ar/${r.slug_en}`, changefreq: 'weekly', priority: 0.9 }));
  },
};

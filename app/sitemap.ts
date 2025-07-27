import { MetadataRoute } from 'next';
import { getConversions } from '@/utils/content';
import { LOCALES } from '@/utils/i18n';
import { siteUrl } from '@/utils/seo';

/**
 * Build a locale‑aware XML/robots sitemap.
 * `MetadataRoute.Sitemap` is **already an array type**, so declare `urls`
 * with that type (not `MetadataRoute.Sitemap[]`).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const urls: MetadataRoute.Sitemap = [];
  const conversions = getConversions();
  const now = new Date().toISOString();

  LOCALES.forEach((locale) => {
    /* Home page */
    urls.push({
      url: `${siteUrl}/${locale}`,
      priority: 1,
      changeFrequency: 'weekly',
      lastModified: now,
    });

    /* Tool pages */
    conversions.forEach((c) => {
      const slug = locale === 'en' ? c.slug_en : c.slug_ar;
      urls.push({
        url: `${siteUrl}/${locale}/tools/${slug}`,
        priority: 0.8,
        changeFrequency: 'monthly',
        lastModified: now,
      });
    });
  });

  return urls;
}

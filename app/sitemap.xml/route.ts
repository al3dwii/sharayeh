import { SitemapStream, streamToPromise } from 'sitemap';
import { Readable } from 'stream';
import { NextResponse } from 'next/server';
import { getConverters } from '@/lib/server/converters';
import { getPillars } from '@/lib/server/pillars';
import { getLearnArticles } from '@/lib/server/learn';
import { getBlogPosts } from '@/lib/server/blog';
import { siteUrl } from '@/utils/seo';

export const runtime = 'nodejs';
export const revalidate = 21600;

export async function GET() {
  const sm = new SitemapStream({ hostname: siteUrl });

  sm.write({ url: '/en', changefreq: 'weekly', priority: 1.0 });
  sm.write({ url: '/ar', changefreq: 'weekly', priority: 1.0 });

  const converters = getConverters();
  for (const converter of converters) {
    sm.write({ url: `/en/tools/${converter.slug_en}`, changefreq: 'monthly', priority: 0.8 });
    sm.write({ url: `/ar/tools/${converter.slug_ar}`, changefreq: 'monthly', priority: 0.8 });
  }

  sm.end();
  const xml = await streamToPromise(Readable.from(sm));

  return new NextResponse(xml.toString(), {
    headers: { 
      'Content-Type': 'application/xml; charset=utf-8'
    },
  });
}

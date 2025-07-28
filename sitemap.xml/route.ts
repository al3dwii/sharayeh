// app/sitemap.xml/route.ts
import { SitemapStream, streamToPromise } from 'sitemap';
import { Readable } from 'stream';
import { NextResponse } from 'next/server';

import { getConverters } from '@/lib/server/converters';
import { siteUrl } from '@/utils/seo';

export const runtime = 'nodejs';        // allow fs under the hood
export const revalidate = 60 * 60 * 6;  // 6 h

export async function GET() {
  /* 1  Fetch slug list — AWAIT this! */
  const converters = await getConverters();   // ← fixed

  /* 2  Build a flat array of <url> entries */
  const links = [
    { url: '/en', changefreq: 'weekly', priority: 1 },
    { url: '/ar', changefreq: 'weekly', priority: 1 },
    ...converters.flatMap(({ slug_en, slug_ar }) => [
      { url: `/en/tools/${slug_en}`, changefreq: 'weekly', priority: 0.8 },
      { url: `/ar/tools/${slug_ar}`, changefreq: 'weekly', priority: 0.8 },
    ]),
  ];

  /* 3  Stream → XML */
  const stream = new SitemapStream({ hostname: siteUrl });
  const xml = await streamToPromise(Readable.from(links).pipe(stream));

  return new NextResponse(xml, {
    headers: { 'Content-Type': 'application/xml' },
  });
}

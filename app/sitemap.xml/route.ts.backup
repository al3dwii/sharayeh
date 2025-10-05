// app/sitemap.xml/route.ts
import { SitemapStream, streamToPromise } from 'sitemap';
import { Readable } from 'stream';
import { NextResponse } from 'next/server';

// ⭐ Adjust these helpers (or keep inline FS readers shown below)
import { getConverters }      from '@/lib/server/converters';   // tools
import { getPillars }         from '@/lib/server/pillars';      // solutions
import { getLearnArticles }   from '@/lib/server/learn';        // learn
import { getBlogPosts }       from '@/lib/server/blog';         // blog

import { siteUrl } from '@/utils/seo';                          // “https://sharayeh.com”

export const runtime   = 'nodejs';           // FS access OK
export const revalidate = 60 * 60 * 6;       // 6 h

/* ---------- Helpers if you don’t have them yet ---------- */
// Remove if you already expose typed loaders elsewhere.
import fs from 'fs';
import path from 'path';

function readSlugs(dir: string): string[] {
  const full = path.join(process.cwd(), dir);
  return fs
    .readdirSync(full, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
}

/* -------------------------------------------------------- */

export async function GET() {
  /* 1 ─ Create a writable sitemap stream */
  const sm = new SitemapStream({ hostname: siteUrl });

  /* 2 ─ Root pages (en + ar) */
  sm.write({ url: '/en', changefreq: 'weekly', priority: 1.0 });
  sm.write({ url: '/ar', changefreq: 'weekly', priority: 1.0 });

  /* 3 ─ Tools */
  for (const { slug_en, slug_ar } of getConverters()) {
    sm.write({ url: `/en/tools/${slug_en}`, changefreq: 'monthly', priority: 0.7 });
    sm.write({ url: `/ar/tools/${slug_en}`, changefreq: 'monthly', priority: 0.7 });
  }

  /* 4 ─ Solutions (index + each pillar) */
  ['en', 'ar'].forEach((locale) => {
    sm.write({ url: `/${locale}/solutions`, changefreq: 'weekly', priority: 0.8 });
    for (const pillar of getPillars())
      sm.write({ url: `/${locale}/solutions/${pillar}`, changefreq: 'monthly', priority: 0.6 });
  });

  /* 5 ─ Learn hub + individual guides */
  ['en', 'ar'].forEach((locale) => {
    sm.write({ url: `/${locale}/learn`, changefreq: 'weekly', priority: 0.8 });
    for (const slug of getLearnArticles())
      sm.write({ url: `/${locale}/learn/${slug}`, changefreq: 'monthly', priority: 0.6 });
  });

  /* 6 ─ Blog index + posts */
  ['en', 'ar'].forEach((locale) => {
    sm.write({ url: `/${locale}/blog`, changefreq: 'weekly', priority: 0.8 });
    for (const slug of getBlogPosts())
      sm.write({ url: `/${locale}/blog/${slug}`, changefreq: 'monthly', priority: 0.6 });
  });

  /* 7 ─ Close, stream → string, return */
  sm.end();
  const xml = await streamToPromise(Readable.from(sm)).then((d) => d.toString());

  return new NextResponse(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}

// // app/sitemap.xml/route.ts
// import { SitemapStream, streamToPromise } from 'sitemap';
// import { Readable } from 'stream';
// import { NextResponse } from 'next/server';

// import { getConverters } from '@/lib/server/converters';
// import { siteUrl } from '@/utils/seo';

// export const runtime = 'nodejs';        // allow fs under the hood
// export const revalidate = 60 * 60 * 6;  // 6 h

// export async function GET() {
//   /* 1  Fetch slug list — AWAIT this! */
//   const converters = await getConverters();   // ← fixed

//   /* 2  Build a flat array of <url> entries */
//   const links = [
//     { url: '/en', changefreq: 'weekly', priority: 1 },
//     { url: '/ar', changefreq: 'weekly', priority: 1 },
//     ...converters.flatMap(({ slug_en, slug_ar }) => [
//       { url: `/en/tools/${slug_en}`, changefreq: 'weekly', priority: 0.8 },
//       { url: `/ar/tools/${slug_ar}`, changefreq: 'weekly', priority: 0.8 },
//     ]),
//   ];

//   /* 3  Stream → XML */
//   const stream = new SitemapStream({ hostname: siteUrl });
//   const xml = await streamToPromise(Readable.from(links).pipe(stream));

//   return new NextResponse(xml, {
//     headers: { 'Content-Type': 'application/xml' },
//   });
// }

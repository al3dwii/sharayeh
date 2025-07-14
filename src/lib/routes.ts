/* src/lib/routes.ts
   ------------------------------------------------------------------ */

import fs from "fs";
import path from "path";
import type { Metadata } from "next";
import { hreflang } from "@/lib/metadata";

/** Next 14 no longer exports AlternateURLs — derive it. */
type AlternateURLs = NonNullable<Metadata["alternates"]>;

/* ───────────── Types ───────────── */

export interface RouteRow {
  slug_en: string;
  slug_ar: string;
  dir: string;
  label_en: string;
  label_ar: string;
  search_vol: string;
}

/* ───────────── CSV → rows ───────────── */

function parseCSV(text: string): RouteRow[] {
  const [headerLine, ...dataLines] = text.trim().split(/\r?\n/).filter(Boolean);

  /* ensure headers align with RouteRow keys */
  const headers = headerLine
    .split(",")
    .map((h) => h.trim()) as (keyof RouteRow)[];

  return dataLines.map((line) => {
    /* split while respecting quoted commas => "foo,bar" */
    const cells =
      line
        .match(/("([^"]|"")*"|[^,]+)(?=,|\s*$)/g)
        ?.map((cell) => cell.replace(/^"|"$/g, "").trim()) ?? [];

    /* build strongly‑typed record */
    const record = {} as Record<keyof RouteRow, string>;
    headers.forEach((h, i) => {
      record[h] = cells[i] ?? "";
    });

    return record as RouteRow;
  });
}

const csvPath = path.join(process.cwd(), "content/conversions.csv");
const rows: RouteRow[] = parseCSV(fs.readFileSync(csvPath, "utf8"));

/* ───────────── Public helpers ───────────── */

export const getRoutes = (): RouteRow[] => rows;

/**
 * Build <head> metadata for a converter landing page.
 * @param slug   English slug in the URL (e.g. "pdf-to-powerpoint")
 * @param locale "en" | "ar"
 */
export function routeMeta(slug: string, locale: "en" | "ar"): Metadata {
  const row = rows.find((r) => r.slug_en === slug);
  if (!row) throw new Error(`Unknown slug "${slug}"`);

  const title = locale === "ar" ? row.label_ar : row.label_en;
  const description =
    locale === "ar"
      ? `أداة اونلاين مجّانية لـ${row.label_ar}. لا يتطلب تنزيل برنامج.`
      : `Online ${row.label_en} – fast, secure & free.`;

  /* hreflang(locale, slug) → AlternateURLs */
  const alternates = hreflang(
    locale,
    locale === "ar" ? row.slug_ar : slug
  ) as AlternateURLs;

  return {
    title,
    description,
    alternates,
    openGraph: { title, description },
  };
}


// import fs from 'fs';
// import path from 'path';
// import { Metadata } from 'next';
// import { hreflang } from '@/lib/metadata';

// import type { AlternateURLs } from "next";   // ⬅ NEW


// interface RouteRow {
//   slug_en: string;
//   slug_ar: string;
//   dir: string;
//   label_en: string;
//   label_ar: string;
//   search_vol: string;
// }

// function parseCSV(text: string): RouteRow[] {
//   const lines = text.trim().split(/\r?\n/).filter(Boolean);
//   const headers = lines.shift()!.split(',');
//   return lines.map(line => {
//     const parts = line.split(',');
//     const obj: any = {};
//     headers.forEach((h, i) => {
//       obj[h] = parts[i];
//     });
//     return obj as RouteRow;
//   });
// }

// const csvPath = path.join(process.cwd(), 'content/conversions.csv');
// const csvText = fs.readFileSync(csvPath, 'utf8');
// const rows: RouteRow[] = parseCSV(csvText);

// export function getRoutes() { return rows; }

// export function routeMeta(slug: string, locale: 'ar' | 'en'): Metadata {
//   const row = rows.find(r => r.slug_en === slug);
//   if (!row) throw new Error(`Unknown slug ${slug}`);

//   const title = locale === 'ar' ? row.label_ar : row.label_en;
//   const description = locale === 'ar'
//     ? `أداة اونلاين مجّانية لـ${row.label_ar}. لا يتطلب تنزيل برنامج.`
//     : `Online ${row.label_en} – fast, secure & free.`;

//   return {
//     title,
//     description,
//     alternates: hreflang(locale, slug, row.slug_ar),
//     openGraph: { title, description },
//   };
// }

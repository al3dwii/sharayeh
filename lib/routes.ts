/* ------------------------------------------------------------------ *
   src/lib/routes.ts
   Centralised routing + metadata helpers for every converter page.
 * ------------------------------------------------------------------ */

import fs from 'fs';
import path from 'path';
import type { Metadata } from "next";
import { hreflang } from "@/lib/metadata";

/* ───────────── Types ───────────── */

export interface CsvRow {
  slug_en: string;
  slug_ar: string;
  dir: string;
  label_en: string;
  label_ar: string;
  search_vol: string; // keep as string to avoid Number() pitfalls
  icon: string;
  avg_time_iso: string;
  steps_id: string;
}

export interface Steps {
  ar: string[];
  en: string[];
}

/** Final object returned by helpers */
export interface Converter extends CsvRow {
  steps: Steps;
}

/* ───────────── File paths ───────────── */

const CSV_PATH = path.join(process.cwd(), "content/conversions.csv");
const EXTRA_JSON_PATH = path.join(
  process.cwd(),
  "content/conversion-extra.json"
);

/* ───────────── Load + cache CSV / JSON ───────────── */

/**
 * Parse a RFC‑4180‑style CSV line, honouring quoted commas.
 */
function parseCsvLine(line: string): string[] {
  return (
    line
      .match(/("([^"]|"")*"|[^,]+)(?=,|\s*$)/gu)   // add "u" flag for Unicode
      ?.map((cell) => cell.replace(/^"|"$/g, "").trim()) ?? []
  );
}

/**
 * Load conversions.csv → array of CsvRow objects.
 */
function loadCsv(): CsvRow[] {
  const [headerLine, ...dataLines] = fs
    .readFileSync(CSV_PATH, "utf8")
    .trim()
    .split(/\r?\n/)
    .filter(Boolean);

  const headers = parseCsvLine(headerLine) as (keyof CsvRow)[];
  return dataLines.map((line) => {
    const cells = parseCsvLine(line);
    const row = {} as Record<keyof CsvRow, string>;
    headers.forEach((h, i) => {
      row[h] = cells[i] ?? "";
    });
    return row as CsvRow;
  });
}

/**
 * Load extra JSON with step arrays.
 * `{ "word_to_ppt": { ar: [...], en: [...] }, ... }`
 */
function loadExtra(): Record<string, Steps> {
  return JSON.parse(fs.readFileSync(EXTRA_JSON_PATH, "utf8"));
}

/* resolve once at startup; Next 14 edge loaders cache between calls */
const CSV_ROWS = loadCsv();
const EXTRA = loadExtra();

/* ───────────── Public helpers ───────────── */

/** All converters merged with their steps */
export const getConverters = (): Converter[] =>
  CSV_ROWS.map((r) => ({
    ...r,
    steps: EXTRA[r.steps_id] ?? { ar: [], en: [] },
  }));

/** Find a single converter by English slug (used in dynamic route) */
export const getConverter = (slug_en: string): Converter | undefined =>
  getConverters().find((c) => c.slug_en === slug_en);

export function getRelatedConverters(slug_en: string, limit = 4): Converter[] {
  const all = getConverters();
  const current = all.find((c) => c.slug_en === slug_en);
  if (!current) return [];

  const [fromExt, toExt] = current.dir.split('→');
  const others = all.filter(
    (c) =>
      c.slug_en !== slug_en &&
      (c.dir.includes(fromExt) || c.dir.includes(toExt))
  );

  others.sort((a, b) => Number(b.search_vol) - Number(a.search_vol));
  return others.slice(0, limit);
}

/**
 * Build <head> metadata for a converter landing page.
 * @param locale  "en" | "ar"
 * @param slug_en English slug in the URL (e.g. "pdf-to-powerpoint")
 */
export function routeMeta(
  locale: "en" | "ar",
  slug_en: string
): Metadata | never {
  const converter = getConverter(slug_en);
  if (!converter) throw new Error(`Unknown slug "${slug_en}"`);

  const { label_en, label_ar, slug_ar } = converter;

  const title = locale === "ar" ? label_ar : label_en;
  const description =
    locale === "ar"
      ? `أداة مجانية سريعة لـ${label_ar}. تعمل في المتصفح بلا تثبيت برنامج.`
      : `Fast & secure ${label_en} — browser‑based, no install.`;

  /* hreflang(locale, slug) -> AlternateURLs */
  const alternates = hreflang(
    locale,
    locale === "ar" ? slug_ar : slug_en
  ) as NonNullable<Metadata["alternates"]>;

  return { title, description, alternates, openGraph: { title, description } };
}


// /* src/lib/routes.ts
//    ------------------------------------------------------------------ */

// import fs from "fs";
// import path from "path";
// import type { Metadata } from "next";
// import { hreflang } from "@/lib/metadata";

// /** Next 14 no longer exports AlternateURLs — derive it. */
// type AlternateURLs = NonNullable<Metadata["alternates"]>;

// /* ───────────── Types ───────────── */

// export interface RouteRow {
//   slug_en: string;
//   slug_ar: string;
//   dir: string;
//   label_en: string;
//   label_ar: string;
//   search_vol: string;
// }

// /* ───────────── CSV → rows ───────────── */

// function parseCSV(text: string): RouteRow[] {
//   const [headerLine, ...dataLines] = text.trim().split(/\r?\n/).filter(Boolean);

//   /* ensure headers align with RouteRow keys */
//   const headers = headerLine
//     .split(",")
//     .map((h) => h.trim()) as (keyof RouteRow)[];

//   return dataLines.map((line) => {
//     /* split while respecting quoted commas => "foo,bar" */
//     const cells =
//       line
//         .match(/("([^"]|"")*"|[^,]+)(?=,|\s*$)/g)
//         ?.map((cell) => cell.replace(/^"|"$/g, "").trim()) ?? [];

//     /* build strongly‑typed record */
//     const record = {} as Record<keyof RouteRow, string>;
//     headers.forEach((h, i) => {
//       record[h] = cells[i] ?? "";
//     });

//     return record as RouteRow;
//   });
// }

// const csvPath = path.join(process.cwd(), "content/conversions.csv");
// const rows: RouteRow[] = parseCSV(fs.readFileSync(csvPath, "utf8"));

// /* ───────────── Public helpers ───────────── */

// export const getRoutes = (): RouteRow[] => rows;

// /**
//  * Build <head> metadata for a converter landing page.
//  * @param slug   English slug in the URL (e.g. "pdf-to-powerpoint")
//  * @param locale "en" | "ar"
//  */
// export function routeMeta(slug: string, locale: "en" | "ar"): Metadata {
//   const row = rows.find((r) => r.slug_en === slug);
//   if (!row) throw new Error(`Unknown slug "${slug}"`);

//   const title = locale === "ar" ? row.label_ar : row.label_en;
//   const description =
//     locale === "ar"
//       ? `أداة اونلاين مجّانية لـ${row.label_ar}. لا يتطلب تنزيل برنامج.`
//       : `Online ${row.label_en} – fast, secure & free.`;

//   /* hreflang(locale, slug) → AlternateURLs */
//   const alternates = hreflang(
//     locale,
//     locale === "ar" ? row.slug_ar : slug
//   ) as AlternateURLs;

//   return {
//     title,
//     description,
//     alternates,
//     openGraph: { title, description },
//   };
// }


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

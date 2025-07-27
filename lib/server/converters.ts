// lib/server/converters.ts

import fs from 'fs';
import path from 'path';
import { CsvRow, Steps, Converter } from '@/lib/types';  // ← shared types


/* ───────────── Types ───────────── */

// export interface CsvRow {
//   slug_en: string;
//   slug_ar: string;
//   dir: string;        // e.g. "DOCX→PPT"
//   label_en: string;   // e.g. "Convert Word to PowerPoint"
//   label_ar: string;   // e.g. "تحويل ملف وورد إلى بوربوينت"
//   search_vol: string; // string to avoid Number() pitfalls
//   icon: string;
//   avg_time_iso: string;
//   steps_id: string;
// }

// export interface Steps {
//   ar: string[];
//   en: string[];
// }

// export interface Converter extends CsvRow {
//   steps: Steps;
// }

/* ───────────── Load & cache CSV / JSON ───────────── */

const CSV_PATH = path.join(process.cwd(), 'content/conversions.csv');
const EXTRA_JSON_PATH = path.join(process.cwd(), 'content/conversion-extra.json');

/** Parse a CSV line while honouring quoted commas. */
function parseCsvLine(line: string): string[] {
  return (
    line
      .match(/("([^"]|"")*"|[^,]+)(?=,|\s*$)/gu)
      ?.map((cell) => cell.replace(/^"|"$/g, '').trim()) ?? []
  );
}

/** Load conversions.csv → array of CsvRow objects. */
function loadCsv(): CsvRow[] {
  const [headerLine, ...dataLines] = fs
    .readFileSync(CSV_PATH, 'utf8')
    .trim()
    .split(/\r?\n/)
    .filter(Boolean);

  const headers = parseCsvLine(headerLine) as (keyof CsvRow)[];
  return dataLines.map((line) => {
    const cells = parseCsvLine(line);
    const row = {} as Record<keyof CsvRow, string>;
    headers.forEach((h, i) => {
      row[h] = cells[i] ?? '';
    });
    return row as CsvRow;
  });
}

/** Load extra JSON with step arrays: { "word_to_ppt": { ar: [...], en: [...] }, ... } */
function loadExtra(): Record<string, Steps> {
  return JSON.parse(fs.readFileSync(EXTRA_JSON_PATH, 'utf8'));
}

/* Resolve once at startup; Next 14 caches edge loaders between calls. */
const CSV_ROWS = loadCsv();
const EXTRA = loadExtra();

/* ───────────── Public helpers ───────────── */

/** All converters merged with their steps. */
export const getConverters = (): Converter[] =>
  CSV_ROWS.map((r) => ({
    ...r,
    steps: EXTRA[r.steps_id] ?? { ar: [], en: [] },
  }));

/** Find a single converter by its English slug (used in dynamic routes). */
export const getConverter = (slug_en: string): Converter | undefined =>
  getConverters().find((c) => c.slug_en === slug_en);

/**
 * Find up to `limit` converters related to the given slug.
 * A converter is considered related if it shares either the "from" or "to" file extension.
 */
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

  // Sort by descending search volume
  others.sort((a, b) => Number(b.search_vol) - Number(a.search_vol));
  return others.slice(0, limit);
}

export type { CsvRow, Steps, Converter };               // optional re‑export

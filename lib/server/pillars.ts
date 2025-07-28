import fs   from 'fs';
import path from 'path';

/* ---------- Types ---------- */
export interface PillarRow {
  slug_en: string;
  slug_ar: string;
  title_en: string;
  title_ar: string;
  description_en?: string;
  description_ar?: string;
}

/* ---------- Config ---------- */
const CSV_PATH = path.join(process.cwd(), 'content/pillars.csv');

/* ---------- CSV helper (same regex you use in converters) ---------- */
function parseCsvLine(line: string): string[] {
  return (
    line
      .match(/("([^"]|"")*"|[^,]+)(?=,|\s*$)/gu)
      ?.map((cell) => cell.replace(/^"|"$/g, '').trim()) ?? []
  );
}

/* ---------- Load & cache ---------- */
const PILLAR_ROWS: PillarRow[] = (() => {
  if (!fs.existsSync(CSV_PATH)) return [];

  const [header, ...lines] = fs.readFileSync(CSV_PATH, 'utf8').trim().split(/\r?\n/);
  const headers = parseCsvLine(header) as (keyof PillarRow)[];
  return lines.map((l) => {
    const cells = parseCsvLine(l);
    const row = {} as Record<keyof PillarRow, string>;
    headers.forEach((h, i) => (row[h] = cells[i] ?? ''));
    return row as PillarRow;
  });
})();

/* ---------- Public API ---------- */
export const getPillars = (): PillarRow[] => PILLAR_ROWS;

/** Convenience helper for sitemap: → [{ slug_en, slug_ar }] */
export const getPillarSlugs = () =>
  PILLAR_ROWS.map(({ slug_en, slug_ar }) => ({ slug_en, slug_ar }));

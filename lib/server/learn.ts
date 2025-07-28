import fs   from 'fs';
import path from 'path';

/* ---------- Types ---------- */
export interface LearnRow {
  slug_en: string;
  slug_ar: string;
  title_en: string;
  title_ar: string;
  // add extra columns as you need…
}

/* ---------- Config ---------- */
const CSV_PATH = path.join(process.cwd(), 'content/learn.csv');

/* ---------- CSV helper ---------- */
function parseCsvLine(line: string): string[] {
  return (
    line
      .match(/("([^"]|"")*"|[^,]+)(?=,|\s*$)/gu)
      ?.map((cell) => cell.replace(/^"|"$/g, '').trim()) ?? []
  );
}

/* ---------- Load & cache ---------- */
const LEARN_ROWS: LearnRow[] = (() => {
  if (!fs.existsSync(CSV_PATH)) return [];

  const [header, ...lines] = fs.readFileSync(CSV_PATH, 'utf8').trim().split(/\r?\n/);
  const headers = parseCsvLine(header) as (keyof LearnRow)[];
  return lines.map((l) => {
    const cells = parseCsvLine(l);
    const row = {} as Record<keyof LearnRow, string>;
    headers.forEach((h, i) => (row[h] = cells[i] ?? ''));
    return row as LearnRow;
  });
})();

/* ---------- Public API ---------- */
export const getLearnArticles = (): LearnRow[] => LEARN_ROWS;

export const getLearnSlugs = () =>
  LEARN_ROWS.map(({ slug_en, slug_ar }) => ({ slug_en, slug_ar }));

import fs   from 'fs';
import path from 'path';

/* ---------- Types ---------- */
export interface BlogRow {
  slug_en: string;
  slug_ar: string;
  title_en: string;
  title_ar: string;
  date: string;             // YYYY‑MM‑DD
  excerpt_en?: string;
  excerpt_ar?: string;
}

/* ---------- Config ---------- */
const CSV_PATH = path.join(process.cwd(), 'content/blog.csv');

/* ---------- CSV helper ---------- */
function parseCsvLine(line: string): string[] {
  return (
    line
      .match(/("([^"]|"")*"|[^,]+)(?=,|\s*$)/gu)
      ?.map((cell) => cell.replace(/^"|"$/g, '').trim()) ?? []
  );
}

/* ---------- Load & cache ---------- */
const BLOG_ROWS: BlogRow[] = (() => {
  if (!fs.existsSync(CSV_PATH)) return [];

  const [header, ...lines] = fs.readFileSync(CSV_PATH, 'utf8').trim().split(/\r?\n/);
  const headers = parseCsvLine(header) as (keyof BlogRow)[];
  return lines.map((l) => {
    const cells = parseCsvLine(l);
    const row = {} as Record<keyof BlogRow, string>;
    headers.forEach((h, i) => (row[h] = cells[i] ?? ''));
    return row as BlogRow;
  });
})();

/* ---------- Public API ---------- */
export const getBlogPosts = (): BlogRow[] => BLOG_ROWS;

export const getBlogSlugs = () =>
  BLOG_ROWS.map(({ slug_en, slug_ar }) => ({ slug_en, slug_ar }));

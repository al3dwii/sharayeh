import fs from 'fs';
import path from 'path';
import { Metadata } from 'next';
import { hreflang } from '@/lib/metadata';

interface RouteRow {
  slug_en: string;
  slug_ar: string;
  dir: string;
  label_en: string;
  label_ar: string;
  search_vol: string;
}

function parseCSV(text: string): RouteRow[] {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  const headers = lines.shift()!.split(',');
  return lines.map(line => {
    const parts = line.split(',');
    const obj: any = {};
    headers.forEach((h, i) => {
      obj[h] = parts[i];
    });
    return obj as RouteRow;
  });
}

const csvPath = path.join(process.cwd(), 'content/conversions.csv');
const csvText = fs.readFileSync(csvPath, 'utf8');
const rows: RouteRow[] = parseCSV(csvText);

export function getRoutes() { return rows; }

export function routeMeta(slug: string, locale: 'ar' | 'en'): Metadata {
  const row = rows.find(r => r.slug_en === slug);
  if (!row) throw new Error(`Unknown slug ${slug}`);

  const title = locale === 'ar' ? row.label_ar : row.label_en;
  const description = locale === 'ar'
    ? `أداة اونلاين مجّانية لـ${row.label_ar}. لا يتطلب تنزيل برنامج.`
    : `Online ${row.label_en} – fast, secure & free.`;

  return {
    title,
    description,
    alternates: hreflang(locale, slug, row.slug_ar),
    openGraph: { title, description },
  };
}

import Papa from "papaparse";
import fs from "fs";
import path from "path";

export type PhraseRow = {
  slug_en: string;
  slug_ar: string;
  label_en: string;
  label_ar: string;
  search_vol: string;
  module_hint: string;
  plan_gate: string;
};

export function getPhrases(): PhraseRow[] {
  const csvPath = path.join(process.cwd(), "data", "doc2deck_keywords_top20.csv");
  const csv = fs.readFileSync(csvPath, "utf-8");
  const parsed = Papa.parse<PhraseRow>(csv, { header: true, skipEmptyLines: true });
  return parsed.data;
}

// For Next.js static params
export function getLocales() {
  return ["en", "ar"] as const;
}

export function getStaticParams() {
  const rows = getPhrases();
  const params: { locale: string; slug: string }[] = [];
  for (const r of rows) {
    params.push({ locale: "en", slug: r.slug_en });
    params.push({ locale: "ar", slug: r.slug_en }); // using en slug in URL; could localize slugs later
  }
  return params;
}

export function findPhrase(slug: string): PhraseRow | undefined {
  const rows = getPhrases();
  return rows.find((r) => r.slug_en === slug);
}

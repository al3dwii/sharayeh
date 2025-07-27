// lib/types.ts
export interface CsvRow {
  slug_en: string;
  slug_ar: string;
  dir: string;
  label_en: string;
  label_ar: string;
  search_vol: string;
  icon: string;
  avg_time_iso: string;
  steps_id: string;
}

export interface Steps {
  ar: string[];
  en: string[];
}

export interface Converter extends CsvRow {
  steps: Steps;
}

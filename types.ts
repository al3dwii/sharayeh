export type FAQItem = { q: string; a: string };

export type LandingPageRecord = {
  id: string;
  slug: string;
  phrase_ar: string;
  phrase_en: string;
  module: string;
  plan_min: string;
  search_vol?: number;
  short_hint_ar: string;
  short_hint_en: string;
  faq_ar: FAQItem[];
  faq_en: FAQItem[];
};

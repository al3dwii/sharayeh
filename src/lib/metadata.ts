// src/lib/metadata.ts
//-----------------------------------------------------
// FINAL state after the 10-day sprint
//-----------------------------------------------------

/**
 * Helper that returns a Next.js-compatible `alternates` object
 * with canonical + hreflang links for Arabic and English.
 *
 * Usage:
 *   return {
 *     title: "...",
 *     description: "...",
 *     ...hreflang(locale as "ar" | "en", slug)
 *   }
 *
 * @param locale  Either "ar" | "en"
 * @param slug    Path segment *without* leading slash, e.g.
 *                "تحويل-وورد-بوربوينت"  or "word-to-powerpoint-converter"
 */
export function hreflang(
  locale: "ar" | "en",
  slug = ""
): {
  alternates: {
    canonical: string;
    languages: { ar: string; en: string };
  };
} {
  // Ensure leading slash & no trailing slash
  const norm = (path: string) =>
    "/" + path.replace(/^\/+/, "").replace(/\/+$/, "");

  const ar = norm(`/ar/${slug}`);
  const en = norm(`/en/${slug}`);

  return {
    alternates: {
      canonical: locale === "ar" ? ar : en,
      languages: { ar, en }
    }
  };
}

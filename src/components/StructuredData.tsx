/* ------------------------------------------------------------------ *
   Inject Schema.org JSON‑LD (HowTo + SoftwareApplication)
   for every converter landing page.
 * ------------------------------------------------------------------ */

import Script from "next/script";
import type { Converter } from "@/lib/routes";

interface StructuredDataProps {
  locale: "en" | "ar";
  row: Converter;
}

export default function StructuredData({ locale, row }: StructuredDataProps) {
  const isAr = locale === "ar";
  const name = isAr ? row.label_ar : row.label_en;

  /* ---------- HowTo markup ---------- */
  const howTo = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    inLanguage: locale,
    totalTime: row.avg_time_iso, // e.g. "PT30S"
    tool: "Sharayeh Converter",
    step: (row.steps[locale] ?? []).map((text, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      text,
    })),
  };

  /* ---------- SoftwareApplication markup ---------- */
  const softwareApp = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: `Sharayeh — ${name}`,
    applicationCategory: "DocumentConversion",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    url: `https://sharayeh.com/${locale}/${row.slug_en}`,
  };

  return (
    <>
      <Script
        id="ld-howto"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howTo) }}
      />
      <Script
        id="ld-app"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApp) }}
      />
    </>
  );
}

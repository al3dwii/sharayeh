/**
 * Universal landing-page layout for every converter.
 */
import StructuredData from "@/components/StructuredData";
import Converter from "@/components/Converter";
import FeatureSectionAr from "@/components/landing/FeatureSectionAr";
import LandingCopyAr from "@/components/landing/LandingCopyAr";
import FaqAr from "@/components/landing/FaqAr";
import type { Converter as ConverterRow } from "@/lib/routes";

interface LandingTemplateProps {
  locale: "en" | "ar";
  row: ConverterRow;
}



/** Utility: human readable “DOCX → PPT” string localized */
function dirLabel(row: ConverterRow, isAr: boolean): string {
  // row.dir already looks like "DOCX→PPT"; just space it + localize arrow if needed
  const spaced = row.dir.replace("→", " → ");
  if (!isAr) return spaced;
  // Arabic UI: keep Latin extensions; prepend verb
  return `(${spaced})`;
}

export default function LandingTemplate({ locale, row }: LandingTemplateProps) {
  const isAr = locale === "ar";

  return (
    <main className="container mx-auto py-12 space-y-12">
      <header className="text-center space-y-3">
        <h1 className="text-3xl font-bold">
          {isAr ? row.label_ar : row.label_en}
        </h1>
        <p className="text-sm text-muted-foreground">{dirLabel(row, isAr)}</p>
      </header>

      {/* Converter takes no props in current codebase */}
      <Converter />

      {isAr && (
        <>
          <FeatureSectionAr />
          <LandingCopyAr />
          <FaqAr />
        </>
      )}

      <StructuredData row={row} locale={locale} />
    </main>
  );
}

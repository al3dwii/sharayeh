// src/app/(site)/[locale]/convert-word-to-ppt/page.tsx
//-----------------------------------------------------
// FINAL state after the full 10-day sprint
//-----------------------------------------------------
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";

import { availableLocales } from "@/lib/i18n";
import { hreflang } from "@/lib/metadata";

import FeatureSectionAr   from "@/components/landing/FeatureSectionAr";
import LandingCopyAr      from "@/components/landing/LandingCopyAr";
import FaqAr              from "@/components/landing/FaqAr";
import StructuredDataAr   from "@/components/seo/StructuredDataAr";

/* ---------------- Lazy uploader ------------------ */
// const Converter = dynamic(() => import("@/components/Converter"), {
//   ssr: false,
//   loading: () => (
//     <p className="text-center py-12" dir="rtl">
//       …جارٍ تحميل المحول
//     </p>
//   )
// });

/* ---------- Static-site generation hints --------- */
// export const dynamic   = "error";          // no fallback to runtime
export const revalidate = 60 * 60 * 24;    // 24 h ISR

export async function generateStaticParams() {
  return availableLocales.map(locale => ({ locale }));
}

/* -------------------- Metadata ------------------- */
export async function generateMetadata(
  { params }: { params: { locale: string } }
): Promise<Metadata> {
  const { locale } = params;

  const titles: Record<string, string> = {
    ar: "تحويل ملف وورد إلى بوربوينت – Sharayeh",
    en: "Convert Word to PowerPoint – Sharayeh"
  };

  const descriptions: Record<string, string> = {
    ar: "حوّل مستندات Word إلى شرائح PowerPoint في ثوانٍ عبر الذكاء الاصطناعي. بدون برامج، مجانًا.",
    en: "Turn Word documents into PowerPoint slides in seconds using AI. No software install, free."
  };

  if (!(locale in titles)) return notFound();

  const slug =
    locale === "ar"
      ? "تحويل-وورد-بوربوينت"
      : "word-to-powerpoint-converter";

  return {
    title:       titles[locale],
    description: descriptions[locale],
    ...hreflang(locale as "ar" | "en", slug)
  };
}

/* ------------------- Page UI --------------------- */
export default function ConvertWordToPptPage(
  { params }: { params: { locale: string } }
) {
  const isAr = params.locale === "ar";

  return (
    <main className="container mx-auto py-12 space-y-12">
      <h1 className="text-3xl font-bold text-center">
        {isAr
          ? "تحويل ملف وورد إلى بوربوينت"
          : "Convert Word to PowerPoint"}
      </h1>

      {/* Main uploader */}
      {/* <Converter /> */}

      {/* Trust / benefit cards */}
      {isAr && <FeatureSectionAr />}

      {/* SEO-rich copy & FAQ */}
      {isAr && <LandingCopyAr />}
      {isAr && <FaqAr />}

      {/* Structured data for rich-results (Arabic only) */}
      {isAr && <StructuredDataAr />}
    </main>
  );
}

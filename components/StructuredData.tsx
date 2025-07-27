import React from "react";
import type { ConverterRow } from "@/lib/tools";

/* -------------------------------------------------------------------------- */
/*  Helper: buildHowToSchema                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Build a Schema.org HowTo object for the current converter page.
 * @param row    The tool record (en+ar labels & slugs)
 * @param locale "en" | "ar"
 */
export function buildHowToSchema(
  row: ConverterRow,
  locale: "en" | "ar"
): Record<string, unknown> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    "https://example.com"; /* fallback during dev */

  const pageUrl =
    locale === "ar"
      ? `${baseUrl}/ar/tools/${row.slug_ar}`
      : `${baseUrl}/en/tools/${row.slug_en}`;

  const name = locale === "ar" ? row.label_ar : row.label_en;
  const direction = locale === "ar"
    ? row.dir.replace("→", " إلى ")
    : row.dir.replace("→", " to ");

  if (locale === 'ar' && row.slug_en === 'word-to-powerpoint') {
    return {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: 'تحويل ملف وورد إلى بوربوينت',
      description: 'دليل خطوة بخطوة لتحويل ملف وورد إلى بوربوينت بدون برامج.',
      totalTime: 'PT30S',
      supply: [],
      tool: [],
      step: [
        { '@type':'HowToStep', position:1, name:'رفع ملف DOCX', url:`${pageUrl}#step1`, text:'اضغط زر رفع الملف واختر المستند.' },
        { '@type':'HowToStep', position:2, name:'التحويل التلقائي', url:`${pageUrl}#step2`, text:'تبدأ الخدمة تحويل وورد إلى بوربوينت تلقائياً.' },
        { '@type':'HowToStep', position:3, name:'تنزيل العرض', url:`${pageUrl}#step3`, text:'نزّل ملف بوربوينت الجاهز.' },
      ],
    };
  }

  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    description:
      locale === "ar"
        ? `دليل خطوة بخطوة لـ ${name} (${direction}).`
        : `Step‑by‑step guide to ${name} (${direction}).`,
    totalTime: "PT30S",
    supply: [],
    tool: [],
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: locale === "ar" ? "رفع الملف" : "Upload file",
        url: `${pageUrl}#step1`,
        text:
          locale === "ar"
            ? "اضغط زر رفع الملف واختر المستند من جهازك."
            : "Click the upload button and choose your document."
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: locale === "ar" ? "التحويل التلقائي" : "Automatic convert",
        url: `${pageUrl}#step2`,
        text:
          locale === "ar"
            ? "تبدأ الأداة التحويل تلقائيًا في غضون ثوانٍ."
            : "The converter starts automatically within seconds."
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: locale === "ar" ? "تنزيل الملف" : "Download result",
        url: `${pageUrl}#step3`,
        text:
          locale === "ar"
            ? "نزّل العرض التقديمي أو المستند المحول فورًا."
            : "Download your converted presentation or document."
      }
    ]
  };
}

/* -------------------------------------------------------------------------- */
/*  Component: inject JSON‑LD into <head>                                     */
/* -------------------------------------------------------------------------- */

interface StructuredDataProps {
  /** Schema.org type, e.g. HowTo, FAQPage, Product */
  type: string;
  /** Pre‑built JSON‑LD object */
  data: Record<string, unknown>;
}

export default function StructuredData({ data }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data, null, 0)
      }}
    />
  );
}

// interface Props {
//   data: Record<string, any>;
// }

// export default function StructuredData({ data }: Props) {
//   return (
//     <script
//       type="application/ld+json"
//       // stringify *after* prop validation to avoid XSS
//       dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
//     />
//   );
// }


// // components/StructuredData.tsx
// 'use client';

// import React from 'react';
// import Head from 'next/head';

// type Json = Record<string, unknown>;

// interface StructuredDataProps {
//   /** Schema‑org type, e.g. "HowTo" | "FAQPage" | "Article" */
//   type: string;
//   /** Raw JS object that will be stringified into JSON‑LD */
//   data: Json;
// }

// /**
//  * Injects <script type="application/ld+json"> into <head>.
//  * Call it once per page.
//  */
// export default function StructuredData({ type, data }: StructuredDataProps) {
//   const full: Json = {
//     '@context': 'https://schema.org',
//     '@type': type,
//     ...data,
//   };

//   return (
//     <Head>
//       <script
//         type="application/ld+json"
//         // stringify with no indentation to keep payload tiny
//         dangerouslySetInnerHTML={{ __html: JSON.stringify(full) }}
//       />
//     </Head>
//   );
// }

// /* ---------- Helper for LandingTemplate ---------- */
// export function buildHowToSchema(row: any, locale: 'en' | 'ar') {
//   // CSV columns are howItWorks_en / howItWorks_ar with semicolon‑separated steps
//   const stepsRaw =
//     row[`howItWorks_${locale}` as const] ??
//     row[`howItWorks_${locale === 'en' ? 'ar' : 'en'}` as const] ??
//     '';
//   const steps = stepsRaw
//     .split(';')
//     .map((t: string) => t.trim())
//     .filter(Boolean);

//   return {
//     name: locale === 'ar' ? row.title_ar : row.title_en,
//     description:
//       locale === 'ar' ? row.description_ar : row.description_en,
//     totalTime: row.avg_time_iso, // e.g. "PT45S"
//     tool: 'Sharayeh Converter',
//     step: steps.map((text: string, i: number) => ({
//       '@type': 'HowToStep',
//       position: i + 1,
//       text,
//     })),
//   };
// }


// /* ------------------------------------------------------------------ *
//    Inject Schema.org JSON‑LD (HowTo + SoftwareApplication)
//    for every converter landing page.
//  * ------------------------------------------------------------------ */

// import Script from "next/script";
// import type { Converter } from "@/lib/routes";

// interface StructuredDataProps {
//   locale: "en" | "ar";
//   row: Converter;
//   faqs?: { question: string; answer: string }[];
// }

// export default function StructuredData({ locale, row, faqs }: StructuredDataProps) {
//   const isAr = locale === "ar";
//   const name = isAr ? row.label_ar : row.label_en;

//   /* ---------- HowTo markup ---------- */
//   const howTo = {
//     "@context": "https://schema.org",
//     "@type": "HowTo",
//     name,
//     inLanguage: locale,
//     totalTime: row.avg_time_iso, // e.g. "PT30S"
//     tool: "Sharayeh Converter",
//     step: (row.steps[locale] ?? []).map((text, i) => ({
//       "@type": "HowToStep",
//       position: i + 1,
//       text,
//     })),
//   };

//   /* ---------- SoftwareApplication markup ---------- */
//   const softwareApp = {
//     "@context": "https://schema.org",
//     "@type": "SoftwareApplication",
//     name: `Sharayeh — ${name}`,
//     applicationCategory: "DocumentConversion",
//     operatingSystem: "Web",
//     offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
//     url: `https://sharayeh.com/${locale}/${row.slug_en}`,
//   };

//   const faqLd = faqs && {
//     "@context": "https://schema.org",
//     "@type": "FAQPage",
//     mainEntity: faqs.map((f) => ({
//       "@type": "Question",
//       name: f.question,
//       acceptedAnswer: { "@type": "Answer", text: f.answer },
//     })),
//   };

//   return (
//     <>
//       <Script
//         id="ld-howto"
//         type="application/ld+json"
//         strategy="afterInteractive"
//         dangerouslySetInnerHTML={{ __html: JSON.stringify(howTo) }}
//       />
//       <Script
//         id="ld-app"
//         type="application/ld+json"
//         strategy="afterInteractive"
//         dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApp) }}
//       />
//       {faqLd && (
//         <Script
//           id="ld-faq"
//           type="application/ld+json"
//           strategy="afterInteractive"
//           dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
//         />
//       )}
//     </>
//   );
// }

// src/app/(site)/[locale]/[category]/page.tsx
import { notFound } from "next/navigation";
import { createTranslator } from "next-intl";
import { Metadata } from "next";
import Converter from "@/components/Converter";
import Script from "next/script";


import FeatureSectionAr from "@/components/landing/FeatureSectionAr";
import LandingCopyAr    from "@/components/landing/LandingCopyAr";
import FaqAr            from "@/components/landing/FaqAr";


export const MAP = {
  "pdf-to-powerpoint": {
    h1: {
      en: "Convert PDF to PowerPoint",
      ar: "حوّل PDF إلى بوربوينت"
    },
    proxy: "/api/proxy/pdf-to-deck",
    description: {
      en: "Turn any PDF into an editable, on‑brand deck in seconds.",
      ar: "حوِّل أي ملف PDF إلى عرض شرائح متوافق مع هويتك خلال ثوانٍ."
    }
  },

  "word-to-powerpoint": {
    h1: {
      en: "Convert Word to PowerPoint",
      ar: "حوّل وورد إلى بوربوينت"
    },
    proxy: "/api/proxy/docx-to-deck",
    description: {
      en: "Instantly transform DOCX files into polished PowerPoint slides.",
      ar: "حوِّل ملفات ‎DOCX‎ إلى شرائح بوربوينت مصقولة فوراً."
    }
  },

  "markdown-to-powerpoint": {
    h1: {
      en: "Convert Markdown to PowerPoint",
      ar: "حوّل ماركداون إلى بوربوينت"
    },
    proxy: "/api/proxy/md-to-deck",
    description: {
      en: "Paste Markdown and receive a beautifully formatted deck.",
      ar: "انسخ نص ماركداون لتحصل على عرض بوربوينت منسّق بأناقة."
    }
  },

  "text-to-powerpoint": {
    h1: {
      en: "Convert Text to PowerPoint",
      ar: "حوّل النص إلى بوربوينت"
    },
    proxy: "/api/proxy/text-to-deck",
    description: {
      en: "Convert raw text into structured slides with headings and bullets.",
      ar: "حوِّل النص الخام إلى شرائح منظمة بعناوين ونقاط بسرعة."
    }
  },

  "transcript-to-powerpoint": {
    h1: {
      en: "Convert Transcript to PowerPoint",
      ar: "حوّل التفريغ إلى بوربوينت"
    },
    proxy: "/api/proxy/transcript-to-deck",
    description: {
      en: "Summarise meeting transcripts into concise presentation slides.",
      ar: "لخّص تفريغات الاجتماعات إلى شرائح عرض مختصرة."
    }
  },

  "powerpoint-to-video": {
    h1: {
      en: "Convert PowerPoint to Video",
      ar: "حوّل بوربوينت إلى فيديو"
    },
    proxy: "/api/proxy/ppt-to-video",
    description: {
      en: "Export your slides to HD MP4 with optional AI voice‑over.",
      ar: "صدّر شرائحك إلى فيديو ‎MP4‎ بجودة عالية مع تعليق صوتي بالذكاء الاصطناعي."
    }
  },

  "powerpoint-to-html": {
    h1: {
      en: "Convert PowerPoint to HTML / SCORM",
      ar: "حوّل بوربوينت إلى ‎HTML‎"
    },
    proxy: "/api/proxy/ppt-to-html",
    description: {
      en: "Publish decks as responsive HTML pages or SCORM packages.",
      ar: "انشر عروضك كصفحات ‎HTML‎ متجاوبة أو حزم ‎SCORM‎ تعليمية."
    }
  },

  "powerpoint-to-word": {
    h1: {
      en: "Convert PowerPoint to Word",
      ar: "حوّل بوربوينت إلى وورد"
    },
    proxy: "/api/proxy/ppt-to-docx",
    description: {
      en: "Extract slide content into a clean Word hand‑out in one click.",
      ar: "استخرج محتوى الشرائح إلى ملف ‎Word‎ أنيق بضغطة زر."
    }
  },

  "data-to-powerpoint": {
    h1: {
      en: "Convert CSV / JSON to PowerPoint",
      ar: "حوّل بيانات CSV / JSON إلى بوربوينت"
    },
    proxy: "/api/proxy/csv-json-to-deck",
    description: {
      en: "Generate data‑driven dashboards from CSV or JSON in minutes.",
      ar: "أنشئ شرائح لوحات بيانات من ملفات ‎CSV‎ أو ‎JSON‎ خلال دقائق."
    }
  },

  "image-to-powerpoint": {
    h1: {
      en: "Convert Image to PowerPoint",
      ar: "حوّل الصورة إلى بوربوينت"
    },
    proxy: "/api/proxy/image-set-to-deck",
    description: {
      en: "OCR your images and place the text into neat slide layouts.",
      ar: "حوّل النص الموجود في الصور (OCR) إلى شرائح مرتبة بسهولة."
    }
  }
} as const;

type Params = { locale: "en" | "ar"; category: keyof typeof MAP };

export function generateMetadata({ params }: { params: Params }): Metadata {
  const cfg = MAP[params.category];
  if (!cfg) return {};
  const desc = cfg.description[params.locale];
  return {
    title: cfg.h1[params.locale],
    description: desc,
    alternates: {
      languages: { ar: `/ar/${params.category}`, en: `/en/${params.category}` }
    },
    openGraph: { title: cfg.h1[params.locale], description: desc }
  };
}

export default async function CategoryPage({ params }: { params: Params }) {
  const cfg = MAP[params.category];
  if (!cfg) notFound();

  const t = createTranslator({ locale: params.locale, messages: {} });

  return (
    <main className="mx-auto max-w-3xl py-16 px-4">
      <Script
  id="ld-json"
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: cfg.h1[params.locale],
      applicationCategory: "BusinessApplication",
      offers: { "@type": "Offer", price: "0.0", priceCurrency: "USD" }
    })
  }}
/>
      <h1 className="text-3xl font-bold mb-6 text-center">
        {cfg.h1[params.locale]}
      </h1>

      {/* Dropzone + template picker + progress bar */}
      <Converter
        locale={params.locale}
        proxyPath={cfg.proxy}
        templateGalleryPath="/templates"
      />

      <FeatureSectionAr />
           <LandingCopyAr />
        <FaqAr />

      {/* Optional marketing copy */}
      <section className="mt-12 prose prose-slate dark:prose-invert">
        <p>{cfg.description[params.locale]}</p>
        {/* add <h2>Features</h2> bullets etc. */}
      </section>
    </main>
  );
}

/* Enable static generation for each locale/category pair */
export async function generateStaticParams() {
  return Object.keys(MAP).flatMap((category) => [
    { locale: "en", category },
    { locale: "ar", category }
  ]);
}



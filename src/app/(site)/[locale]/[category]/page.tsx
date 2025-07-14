// src/app/(site)/[locale]/[category]/page.tsx
import { notFound } from "next/navigation";
import { createTranslator } from "next-intl";
import { Metadata } from "next";
import Converter from "@/components/Converter";
import Script from "next/script";




const MAP = {
  "pdf-to-powerpoint": {
    h1: { en: "Convert PDF to PowerPoint", ar: "حوّل PDF إلى بوربوينت" },
    proxy: "/api/proxy/pdf-to-deck",
    description: {
      en: "Turn any PDF into an editable, on-brand deck in seconds.",
      ar: "حوّل أي ملف PDF إلى عرض شرائح متوافق مع هويتك خلال ثوانٍ."
    }
  },
  // …repeat for the other 9 categories
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



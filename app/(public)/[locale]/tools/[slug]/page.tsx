// app/(public)/[locale]/tools/[slug]/page.tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import Breadcrumbs from '@/components/Breadcrumbs';
import StructuredData from '@/components/StructuredData';
import LandingTemplate from '@/components/landing/LandingTemplate';

import { LOCALES } from '@/utils/i18n';
import { siteUrl } from '@/utils/seo';
import {
  getConverters,
  getConverter,
  getRelatedConverters,
  type Converter as ConverterRow,
} from '@/lib/server/converters';

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */
type PageParams = { locale: 'en' | 'ar'; slug: string };

/* ------------------------------------------------------------------ */
/* Rendering strategy                                                  */
/* ------------------------------------------------------------------ */
export const dynamic = 'auto'; // Static if listed by generateStaticParams()

/* ------------------------------------------------------------------ */
/* Static params                                                       */
/* ------------------------------------------------------------------ */
const converters = getConverters(); // one CSV/JSON read at build time

export async function generateStaticParams() {
  return LOCALES.flatMap((locale) =>
    converters.map((c) => ({ locale, slug: c.slug_en }))
  );
}

/* ------------------------------------------------------------------ */
/* Metadata                                                            */
/* ------------------------------------------------------------------ */
export async function generateMetadata({
  params,
}: {
  params: PageParams;
}): Promise<Metadata> {
  const { locale, slug } = params;
  const row = getConverter(slug);
  if (!row) notFound();

  const isAr = locale === 'ar';
  const [fromExt, toExt] = row.dir.split('→');

  const title = isAr ? `${row.label_ar} | Sharayeh` : `${row.label_en} | Sharayeh`;

  const description = isAr
    ? `أداة سحابية مجانية وسهلة ${row.label_ar} – حوّل ملفات ${fromExt} إلى ${toExt} في ثوانٍ مع الحفاظ على التنسيق والصور والخطوط.`
    : `Free online tool for ${row.label_en}. Convert ${fromExt} to ${toExt} in seconds and keep fonts, images and formatting intact.`;

  const canonical = `${siteUrl}/${locale}/tools/${row.slug_en}`;

  const keywords = isAr
    ? [
        `${fromExt} إلى ${toExt}`,
        `تحويل ${fromExt} إلى ${toExt} أونلاين`,
        `أداة ${row.label_ar}`,
        row.label_ar,
      ]
    : [
        `${fromExt} to ${toExt}`,
        `${fromExt}-to-${toExt} online converter`,
        `free ${row.label_en} tool`,
        row.label_en,
      ];

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical,
      languages: {
        en: `${siteUrl}/en/tools/${row.slug_en}`,
        ar: `${siteUrl}/ar/tools/${row.slug_ar}`,
      },
    },
    openGraph: {
      type: 'website',
      url: canonical,
      title,
      description,
      images: [{ url: `${siteUrl}/api/og/tool/${row.slug_en}`, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${siteUrl}/api/og/tool/${row.slug_en}`],
    },
    robots: {
      index: true,
      follow: true,
    },
    viewport: 'width=device-width,initial-scale=1',
  };
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */
export default async function Page({ params }: { params: PageParams }) {
  const row = getConverter(params.slug);
  if (!row) return notFound();

  // Show related for both languages — not only Arabic
  const related: ConverterRow[] = getRelatedConverters(params.slug);

  // SoftwareApplication schema (per tool)
  const softwareJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: row.label_en,
    alternateName: row.label_ar,
    applicationCategory: 'FileConversionTool',
    operatingSystem: 'All',
    url: `${siteUrl}/${params.locale}/tools/${row.slug_en}`,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    inLanguage: params.locale,
  };

  // BreadcrumbList schema for richer SERP crumbs
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: params.locale === 'ar' ? 'الرئيسية' : 'Home',
        item: `${siteUrl}/${params.locale}`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: params.locale === 'ar' ? 'الأدوات' : 'Tools',
        item: `${siteUrl}/${params.locale}/tools`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: params.locale === 'ar' ? row.label_ar : row.label_en,
        item: `${siteUrl}/${params.locale}/tools/${row.slug_en}`,
      },
    ],
  };

  return (
    <>
      <StructuredData data={softwareJsonLd} />
      <StructuredData data={breadcrumbJsonLd} />
      <Breadcrumbs locale={params.locale} slug={params.slug} />

      <LandingTemplate locale={params.locale} row={row} related={related} />
    </>
  );
}



// // app/(public)/[locale]/tools/[slug]/page.tsx
// import type { Metadata } from 'next';
// import { notFound } from 'next/navigation';

// import Breadcrumbs from '@/components/Breadcrumbs';
// import LandingTemplate from '@/components/landing/LandingTemplate';
// import StructuredData from '@/components/StructuredData';

// import { LOCALES } from '@/utils/i18n';
// import { siteUrl } from '@/utils/seo';
// import {
//   getConverters,
//   getConverter,
//   getRelatedConverters,
// } from '@/lib/server/converters';

// /* ------------------------------------------------------------------ */
// /* Types                                                               */
// /* ------------------------------------------------------------------ */
// type PageParams = { locale: 'en' | 'ar'; slug: string };

// /* ------------------------------------------------------------------ */
// /* Rendering strategy                                                  */
// /* ------------------------------------------------------------------ */
// export const dynamic = 'auto'; // Static if in generateStaticParams()

// /* ------------------------------------------------------------------ */
// /* Static params                                                       */
// /* ------------------------------------------------------------------ */
// const converters = getConverters(); // one CSV read at build time

// export async function generateStaticParams() {
//   return LOCALES.flatMap((locale) =>
//     converters.map((c) => ({ locale, slug: c.slug_en }))
//   );
// }

// /* ------------------------------------------------------------------ */
// /* Metadata                                                            */
// /* ------------------------------------------------------------------ */
// export async function generateMetadata({
//   params,
// }: {
//   params: PageParams;
// }): Promise<Metadata> {
//   const { locale, slug } = params;
//   const converter = getConverter(slug);
//   if (!converter) notFound();

//   const [fromExt, toExt] = converter.dir.split('→');
//   const isAr = locale === 'ar';

//   const title = isAr
//     ? `${converter.label_ar} | Sharayeh`
//     : `${converter.label_en} | Sharayeh`;

//   const description = isAr
//     ? `أداة سحابية مجانية وسهلة ${converter.label_ar} – حول ملفات ${fromExt} إلى ${toExt} في ثوانٍ مع الحفاظ على التنسيق والصور.`
//     : `Free online tool for ${converter.label_en}. Convert ${fromExt} to ${toExt} quickly and keep fonts, images and formatting intact.`;

//   const canonical = `${siteUrl}/${locale}/tools/${converter.slug_en}`;

//   const keywords = isAr
//     ? [`${fromExt} إلى ${toExt}`, `تحويل ${fromExt} إلى ${toExt}`]
//     : [`${fromExt} to ${toExt}`, `${fromExt}‑to‑${toExt} converter`];

//   return {
//     title,
//     description,
//     ...(keywords.length ? { keywords } : {}),
//     alternates: {
//       canonical,
//       languages: {
//         en: `${siteUrl}/en/tools/${converter.slug_en}`,
//         ar: `${siteUrl}/ar/tools/${converter.slug_ar}`,
//       },
//     },
//     openGraph: {
//       type: 'website', // tool landing page
//       url: canonical,
//       title,
//       description,
//       images: [
//         {
//           url: `${siteUrl}/og/${converter.slug_en}.png`,
//           alt: title,
//         },
//       ],
//     },
//     twitter: {
//       card: 'summary_large_image',
//       title,
//       description,
//       images: [`${siteUrl}/og/${converter.slug_en}.png`],
//     },
//   };
// }

// /* ------------------------------------------------------------------ */
// /* Page component                                                      */
// /* ------------------------------------------------------------------ */
// export default async function Page({ params }: { params: PageParams }) {
//   const row = getConverter(params.slug);
//   if (!row) return notFound();

//   const related =
//     params.locale === 'ar' ? getRelatedConverters(params.slug) : [];

//   const jsonLd = {
//     '@context': 'https://schema.org',
//     '@type': 'SoftwareApplication',
//     name: row.label_en,
//     alternateName: row.label_ar,
//     applicationCategory: 'FileConversionTool',
//     operatingSystem: 'All',
//     url: `${siteUrl}/${params.locale}/tools/${row.slug_en}`,
//     offers: {
//       '@type': 'Offer',
//       price: '0',
//       priceCurrency: 'USD',
//     },
//     inLanguage: params.locale,
//   };

//   return (
//     <>
//       {/* Per‑tool structured data */}
//       <StructuredData data={jsonLd} />

//       <Breadcrumbs locale={params.locale} slug={params.slug} />

//       <LandingTemplate
//         locale={params.locale}
//         row={row}
//         related={related}
//       />
//     </>
//   );
// }



// // app/(public)/[locale]/tools/[slug]/page.tsx

// import { notFound } from 'next/navigation';
// import type { Metadata } from 'next';
// import Breadcrumbs from '@/components/Breadcrumbs';
// import LandingTemplate from '@/components/landing/LandingTemplate';
// import { LOCALES } from '@/utils/i18n';
// import { siteUrl } from '@/utils/seo';
// import { getConverters, getConverter, getRelatedConverters } from '@/lib/server/converters';


// type PageParams = {
//   locale: 'en' | 'ar';
//   slug: string; // always the English slug
// };

// /* ---------- Static params ---------- */
// export async function generateStaticParams() {
//   return LOCALES.flatMap((locale) =>
//     getConverters().map((c) => ({
//       locale,
//       slug: c.slug_en,
//     }))
//   );
// }

// /* ---------- Metadata ---------- */
// export async function generateMetadata(
//   { params }: { params: PageParams }
// ): Promise<Metadata> {
//   const { locale, slug } = params;
//   const converter = getConverter(slug);
//   if (!converter) return {};

//   const isAr = locale === 'ar';
//   const [fromExt, toExt] = converter.dir.split('→');

//   // Dynamic title
//   const title = isAr
//     ? `${converter.label_ar} | Sharayeh`
//     : `${converter.label_en} | Sharayeh`;

//   // Dynamic description
//   const description = isAr
//     ? `أداة سحابية مجانية وسهلة ${converter.label_ar} – حول ملفات ${fromExt} إلى ${toExt} في ثوانٍ مع الحفاظ على التنسيق والصور.`
//     : `Free online tool for ${converter.label_en}. Convert ${fromExt} to ${toExt} quickly and keep fonts, images and formatting intact.`;

//   // Dynamic keywords
//   const keywords = isAr
//     ? [
//         converter.label_ar,
//         `${fromExt} إلى ${toExt}`,
//         `تحويل ${fromExt} إلى ${toExt}`,
//         `تحويل ملف ${fromExt} إلى ${toExt}`,
//       ]
//     : [
//         converter.label_en,
//         `${fromExt} to ${toExt}`,
//         `${fromExt} to ${toExt} converter`,
//       ];

//   const canonical = `${siteUrl}/${locale}/tools/${converter.slug_en}`;

//   return {
//     title,
//     description,
//     keywords,
//     alternates: {
//       canonical,
//       languages: {
//         en: `${siteUrl}/en/tools/${converter.slug_en}`,
//         ar: `${siteUrl}/ar/tools/${converter.slug_ar}`,
//       },
//     },
//     openGraph: {
//       title,
//       description,
//       url: canonical,
//       type: 'article',
//       images: [
//         {
//           url: `${siteUrl}/og/${converter.slug_en}.png`,
//           alt: title,
//         },
//       ],
//     },
//     twitter: {
//       card: 'summary_large_image',
//       title,
//       description,
//       images: [`${siteUrl}/og/${converter.slug_en}.png`],
//     },
//   };
// }

// /* ---------- Page ---------- */
// export default async function Page({ params }: { params: PageParams }) {
//   const row = getConverter(params.slug);
//   if (!row) return notFound();

//   // Compute related converters on the server; pass as prop
//   const related =
//     params.locale === 'ar' ? getRelatedConverters(params.slug) : [];

//   return (
//     <>
//       <Breadcrumbs locale={params.locale} slug={params.slug} />
//       <LandingTemplate locale={params.locale} row={row} related={related} />
//     </>
//   );
// }

// // app/(public)/[locale]/tools/[slug]/page.tsx
// import { notFound } from 'next/navigation';
// import type { Metadata } from 'next';
// import LandingTemplate from '@/components/landing/LandingTemplate';
// import { getConversions } from '@/utils/content';
// import { getConverter } from '@/lib/routes';
// import { LOCALES } from '@/utils/i18n';
// import { siteUrl } from '@/utils/seo';
// import Breadcrumbs from '@/components/Breadcrumbs';

// type PageParams = {
//   locale: 'en' | 'ar';
//   slug: string;        // always the English slug
// };

// /* ---------- Static params ---------- */
// export async function generateStaticParams() {
//   return LOCALES.flatMap((locale) =>
//     getConversions().map((c) => ({
//       locale,
//       slug: c.slug_en,              // English slug for every locale
//     })),
//   );
// }

// /* ---------- Metadata ---------- */
// export async function generateMetadata(
//   { params }: { params: PageParams }
// ): Promise<Metadata> {
//   const { locale, slug } = params;
//   const converter = getConverter(slug);
//   if (!converter) return {};

//   const isAr = locale === 'ar';
//   const [fromExt, toExt] = converter.dir.split('→');

//   const title = isAr
//     ? `${converter.label_ar} | Sharayeh`
//     : `${converter.label_en} | Sharayeh`;

//   const description = isAr
//     ? `أداة سحابية مجانية وسهلة ${converter.label_ar} – حول ملفات ${fromExt} إلى ${toExt} في ثوانٍ مع الحفاظ على التنسيق والصور.`
//     : `Free online tool for ${converter.label_en}. Convert ${fromExt} to ${toExt} quickly and keep fonts, images and formatting intact.`;

//   const keywords = isAr
//     ? [
//         converter.label_ar,
//         `${fromExt} إلى ${toExt}`,
//         `تحويل ${fromExt} إلى ${toExt}`,
//         `تحويل ملف ${fromExt} إلى ${toExt}`,
//       ]
//     : [
//         converter.label_en,
//         `${fromExt} to ${toExt}`,
//         `${fromExt} to ${toExt} converter`,
//       ];

//   const canonical = `${siteUrl}/${locale}/tools/${converter.slug_en}`;

//   return {
//     title,
//     description,
//     keywords,
//     alternates: {
//       canonical,
//       languages: {
//         en: `${siteUrl}/en/tools/${converter.slug_en}`,
//         ar: `${siteUrl}/ar/tools/${converter.slug_ar}`,
//       },
//     },
//     openGraph: {
//       title,
//       description,
//       url: canonical,
//       type: 'article',
//       images: [
//         {
//           url: `${siteUrl}/og/${converter.slug_en}.png`,
//           alt: title,
//         },
//       ],
//     },
//     twitter: {
//       card: 'summary_large_image',
//       title,
//       description,
//       images: [`${siteUrl}/og/${converter.slug_en}.png`],
//     },
//   };
// }

// /* ---------- Page ---------- */
// export default function Page({ params }: { params: PageParams }) {
//   const row = getConverter(params.slug);   // same fix here
//   if (!row) return notFound();

//   return (
//     <>
//       <Breadcrumbs locale={params.locale} slug={params.slug} />
//       <LandingTemplate locale={params.locale} row={row} />
//     </>
//   );
// }


// import { notFound } from 'next/navigation';
// import LandingTemplate from '@/components/landing/LandingTemplate';
// import { getConversions, getConversionBySlug } from '@/utils/content';
// import { LOCALES } from '@/utils/i18n';
// import { siteUrl } from '@/utils/seo';

// type PageParams = {
//   locale: 'en' | 'ar';
//   slug: string;
// };


// // app/(public)/[locale]/tools/[slug]/page.tsx
// export async function generateStaticParams() {
//   return LOCALES.flatMap((locale) =>
//     getConversions().map((c) => ({
//       locale,
//       slug: c.slug_en,    // always use the English slug
//     })),
//   );
// }

// /* ---------- Metadata ---------- */
// export async function generateMetadata({ params }) {
//   const { locale, slug } = params as PageParams;
//   const row = getConversionBySlug(locale, slug);
//   if (!row) return {};

//   const title = locale === 'ar' ? row.label_ar : row.label_en;
//   const description = locale === 'ar' ? row.label_ar : row.label_en;
//   const canonical = `${siteUrl}/${locale}/tools/${slug}`;

//   return {
//     title,
//     description,
//     alternates: {
//       canonical,
//       languages: {
//         en: `${siteUrl}/en/tools/${row.slug_en}`,
//         ar: `${siteUrl}/ar/tools/${row.slug_ar}`,
//       },
//     },
//     openGraph: {
//       title,
//       description,
//       url: canonical,
//       type: 'article',
//       images: [{ url: `${siteUrl}/og/${row.slug_en}.png` }],
//     },
//   };
// }

// /* ---------- Page ---------- */
// export default function Page({ params }: { params: PageParams }) {
//   const row = getConversionBySlug(params.locale, params.slug);
//   if (!row) return notFound();

//   return <LandingTemplate locale={params.locale} row={row} />;
// }

// import { notFound } from "next/navigation";
// import { getConverters } from "@/lib/routes";
// import LandingTemplate from "@/components/landing/LandingTemplate";

// /* ---------- Types ---------- */

// type PageParams = {
//   locale: "en" | "ar";
//   slug_en: string;
// };

// /* ---------- ISR ---------- */

// export const revalidate = 86_400;

// /* ---------- Static params ---------- */

// export async function generateStaticParams(): Promise<PageParams[]> {
//   return getConverters().flatMap((c) =>
//     (["ar", "en"] as const).map((locale) => ({
//       locale,
//       slug_en: c.slug_en,
//     }))
//   );
// }

// /* ---------- Metadata ---------- */

// export async function generateMetadata({
//   params,
// }: {
//   params: PageParams;
// }) {
//   const row = getConverters().find((r) => r.slug_en === params.slug_en);
//   if (!row) return {};

//   const isAr = params.locale === "ar";
//   const title = isAr ? row.label_ar : row.label_en;
//   const description = isAr
//     ? `أداة سريعة لـ${row.label_ar}. بدون برامج.`
//     : `Fast, secure ${row.label_en} – no software needed.`;

//   return {
//     title,
//     description,
//     alternates: {
//       canonical: `https://sharayeh.com/${params.locale}/${row.slug_en}`,
//       languages: {
//         ar: `https://sharayeh.com/ar/${row.slug_en}`,
//         en: `https://sharayeh.com/en/${row.slug_en}`,
//       },
//     },
//     openGraph: { title, description },
//   };
// }

// /* ---------- Page ---------- */

// export default function Page({ params }: { params: PageParams }) {
//   const row = getConverters().find((r) => r.slug_en === params.slug_en);
//   if (!row) return notFound();

//   return <LandingTemplate locale={params.locale} row={row} />;
// }

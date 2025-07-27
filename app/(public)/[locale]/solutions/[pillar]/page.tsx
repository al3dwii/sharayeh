// app/(public)/[locale]/solutions/[pillar]/page.tsx
import { dataSource } from '@/lib/data';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PillarTemplate from '@/components/PillarTemplate';
import { siteUrl } from '@/utils/seo';


export async function generateStaticParams() {
  const slugs = await dataSource.getAllPillars();
  return [
    ...slugs.map((slug) => ({ locale: 'ar', pillar: slug })),
    ...slugs.map((slug) => ({ locale: 'en', pillar: slug })),
  ];
}

export async function generateMetadata({ params }: { params: { locale: 'en' | 'ar'; pillar: string } }): Promise<Metadata> {
  const { locale, pillar: slug } = params;
  const item = await dataSource.findPillar(slug, locale);
  if (!item) throw notFound();

  const title = `${item.title} – Doc2Deck`;
  const description = item.description;
  const canonical = `${siteUrl}/${locale}/solutions/${slug}`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ar: `${siteUrl}/ar/solutions/${slug}`,
        en: `${siteUrl}/en/solutions/${slug}`,
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'Doc2Deck',
      locale,
    },
  };
}


export default async function PillarPage({
  params,
}: {
  params: { locale: 'en' | 'ar'; pillar: string };
}) {
  const item = await dataSource.findPillar(params.pillar, params.locale);
  if (!item) throw notFound();

  return <PillarTemplate locale={params.locale} pillar={item} />;
}


// // app/(public)/[locale]/solutions/[pillar]/page.tsx

// import { dataSource } from '@/lib/data'   // wherever you fetch your pillar data
// import { Metadata } from 'next'
// import { notFound } from 'next/navigation'
// import PillarTemplate from '@/components/PillarTemplate'

// /**
//  * 1. Tell Next.js which pages to pre‑build
//  */
// export async function generateStaticParams() {
//   const pillars = await dataSource.getAllPillars()
//   return [
//     // Arabic
//     ...pillars.map(slug => ({ locale: 'ar', pillar: slug })),
//     // English
//     ...pillars.map(slug => ({ locale: 'en', pillar: slug }))
//   ]
// }

// /**
//  * 2. Generate per‑page <head> metadata (title, OG, hreflang)
//  */
// export async function generateMetadata(
// { params }: { params: { locale: string; pillar: string } }
// ): Promise<Metadata> {
//   const item = await dataSource.findPillar(params.pillar)
//   if (!item) throw notFound()

//   const title = `${item.title} – Sharayeh`
//   const description = item.description

//   return {
//     title,
//     description,
//     alternates: {
//       canonical: `https://sharayeh.com/${params.locale}/solutions/${params.pillar}`,
//       languages: {
//         ar: `https://sharayeh.com/ar/solutions/${params.pillar}`,
//         en: `https://sharayeh.com/en/solutions/${params.pillar}`
//       }
//     },
//     openGraph: {
//       title,
//       description,
//       url: `https://sharayeh.com/${params.locale}/solutions/${params.pillar}`,
//       siteName: 'Sharayeh',
//       locale: params.locale
//     }
//   }
// }

// /**
//  * 3. (Optional) ISR: re‑generate this page every 24 h
//  */
// export const revalidate = 86400

// /**
//  * 4. The actual page component
//  */
// export default async function PillarPage({ params }: { params: { locale: string; pillar: string } }) {
//   const item = await dataSource.findPillar(params.pillar)
//   if (!item) throw notFound()

//   return (
//     <PillarTemplate
//       locale={params.locale}
//       pillar={item}
//     />
//   )
// }

// app/(public)/[locale]/solutions/page.tsx
import Link from 'next/link';
import type { Metadata } from 'next';
import { dataSource } from '@/lib/data';
import type { Locale } from '@/utils/i18n';
import { LOCALES } from '@/utils/i18n';
import { siteUrl } from '@/utils/seo';

import SolutionsGrid from './SolutionsGrid';


export default async function SolutionsPage({
  params: { locale },
}: {
  params: { locale: Locale };
}) {
  const slugs   = await dataSource.getAllPillars();
  const pillars = (
    await Promise.all(slugs.map((s) => dataSource.findPillar(s, locale)))
  ).filter(Boolean);           // strip nulls

  return (
    <main className="container mt-16 pt-16 min-h-screen mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">
        {locale === 'ar' ? 'الحلول' : 'Solutions'}
      </h1>

      {/* now rendered purely on the client */}
      <SolutionsGrid locale={locale} pillars={pillars as any[]} />
    </main>
  );
}


// import FeatureCard from '@/components/landing/FeatureCard';
// import {
//   FileText,
//   FileCode,
//   FileType2,
//   FileUp,
//   Presentation,
// } from 'lucide-react';
// import type { LucideIcon } from 'lucide-react';

// /* --- Static params: pre‑render this page for every locale --- */
// export async function generateStaticParams() {
//   return LOCALES.map((locale) => ({ locale }));
// }

// /* --- Metadata --- */
// export function generateMetadata(
//   { params }: { params: { locale: Locale } },
// ): Metadata {
//   const { locale } = params;
//   const title = locale === 'ar' ? 'الحلول' : 'Solutions';
//   const description =
//     locale === 'ar'
//       ? 'استكشف مولدات الشرائح والقوالب المدعومة بالذكاء الاصطناعي، مصنفة حسب الفئة.'
//       : 'Explore our AI‑powered slide generators and templates, organised by solution category.';
//   const canonical = `${siteUrl}/${locale}/solutions`;

//   return {
//     title,
//     description,
//     alternates: {
//       canonical,
//       languages: LOCALES.reduce((acc, loc) => {
//         acc[loc] = `${siteUrl}/${loc}/solutions`;
//         return acc;
//       }, {} as Record<string, string>),
//     },
//     openGraph: {
//       title,
//       description,
//       url: canonical,
//       type: 'website',
//     },
//   };
// }

// /* --- Re‑usable icon map (slug substring → Lucide icon) --- */
// const iconMap: Record<string, LucideIcon> = {
//   word: FileType2,
//   pdf: FileUp,
//   ppt: Presentation,
//   markdown: FileCode,
//   default: FileText,
// };

// /* --- Page component --- */
// export default async function SolutionsPage({
//   params,
// }: {
//   params: { locale: Locale };
// }) {
//   const { locale } = params;
//   const slugs = await dataSource.getAllPillars();
//   const pillars = await Promise.all(
//     slugs.map((slug) => dataSource.findPillar(slug, locale)),
//   );

//   return (
//     <main className="container mt-16 pt-16 min-h-screen mx-auto px-4 py-8">
//       <h1 className="text-3xl font-bold mb-6">
//         {locale === 'ar' ? 'الحلول' : 'Solutions'}
//       </h1>

//       <ul
//         dir={locale === 'ar' ? 'rtl' : 'ltr'}
//         className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
//       >
//         {pillars.map((pillar) => {
//           if (!pillar) return null;

//           /* Pick an icon based on the slug; fall back to FileText */
//           const Icon =
//             Object.entries(iconMap).find(([key]) =>
//               pillar.slug.includes(key),
//             )?.[1] ?? iconMap.default;

//           return (
//             <li key={pillar.slug}>
//               {/* Entire card is a link */}
//               <Link href={`/${locale}/solutions/${pillar.slug}`} passHref>
//                 <FeatureCard
//                   Icon={Icon}
//                   title={pillar.title}
//                   desc={pillar.description}
//                   rtl={locale === 'ar'}
//                 />
//               </Link>
//             </li>
//           );
//         })}
//       </ul>
//     </main>
//   );
// }


// // app/(public)/[locale]/solutions/page.tsx
// import Link from 'next/link';
// import type { Metadata } from 'next';
// import { dataSource } from '@/lib/data';
// import type { Locale } from '@/utils/i18n';
// import { LOCALES } from '@/utils/i18n';
// import { siteUrl } from '@/utils/seo';

// /* --- Static params: pre-render this page for every locale --- */
// export async function generateStaticParams() {
//   return LOCALES.map((locale) => ({ locale }));
// }

// /* --- Metadata --- */
// export function generateMetadata(
//   { params }: { params: { locale: Locale } }
// ): Metadata {
//   const { locale } = params;
//   const title = locale === 'ar' ? 'الحلول' : 'Solutions';
//   const description =
//     locale === 'ar'
//       ? 'استكشف مولدات الشرائح والقوالب المدعومة بالذكاء الاصطناعي، مصنفة حسب الفئة.'
//       : 'Explore our AI‑powered slide generators and templates, organised by solution category.';
//   const canonical = `${siteUrl}/${locale}/solutions`;

//   return {
//     title,
//     description,
//     alternates: {
//       canonical,
//       languages: LOCALES.reduce((acc, loc) => {
//         acc[loc] = `${siteUrl}/${loc}/solutions`;
//         return acc;
//       }, {} as Record<string, string>),
//     },
//     openGraph: {
//       title,
//       description,
//       url: canonical,
//       type: 'website',
//     },
//   };
// }

// // app/(public)/[locale]/solutions/page.tsx
// export default async function SolutionsPage({ params }: { params: { locale: Locale }}) {
//   const { locale } = params;
//   const slugs = await dataSource.getAllPillars();
//   const pillars = await Promise.all(slugs.map((slug) => dataSource.findPillar(slug, locale)));

//   return (
//     <main className="container mt-16 pt-16 min-h-screen mx-auto px-4 py-8">
//       <h1 className="text-3xl font-bold mb-6">
//         {locale === 'ar' ? 'الحلول' : 'Solutions'}
//       </h1>
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//         {pillars.map((pillar) =>
//           pillar ? (
//             <article key={pillar.slug} className="bg-white border rounded-lg shadow-sm p-5">
//               <h2 className="text-xl font-semibold mb-2">{pillar.title}</h2>
//               <p className="text-gray-600 mb-4">{pillar.description}</p>
//               <Link href={`/${locale}/solutions/${pillar.slug}`} className="text-blue-600 font-medium">
//                 {locale === 'ar' ? 'اقرأ المزيد' : 'Learn more'}
//               </Link>
//             </article>
//           ) : null
//         )}
//       </div>
//     </main>
//   );
// }

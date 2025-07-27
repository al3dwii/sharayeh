// app/(public)/[locale]/solutions/page.tsx
import Link from 'next/link';
import type { Metadata } from 'next';
import { dataSource } from '@/lib/data';
import type { Locale } from '@/utils/i18n';
import { LOCALES } from '@/utils/i18n';
import { siteUrl } from '@/utils/seo';

/* --- Static params: pre-render this page for every locale --- */
export async function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

/* --- Metadata --- */
export function generateMetadata(
  { params }: { params: { locale: Locale } }
): Metadata {
  const { locale } = params;
  const title = locale === 'ar' ? 'الحلول' : 'Solutions';
  const description =
    locale === 'ar'
      ? 'استكشف مولدات الشرائح والقوالب المدعومة بالذكاء الاصطناعي، مصنفة حسب الفئة.'
      : 'Explore our AI‑powered slide generators and templates, organised by solution category.';
  const canonical = `${siteUrl}/${locale}/solutions`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: LOCALES.reduce((acc, loc) => {
        acc[loc] = `${siteUrl}/${loc}/solutions`;
        return acc;
      }, {} as Record<string, string>),
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
    },
  };
}

// app/(public)/[locale]/solutions/page.tsx
export default async function SolutionsPage({ params }: { params: { locale: Locale }}) {
  const { locale } = params;
  const slugs = await dataSource.getAllPillars();
  const pillars = await Promise.all(slugs.map((slug) => dataSource.findPillar(slug, locale)));

  return (
    <main className="container mt-16 pt-16 min-h-screen mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">
        {locale === 'ar' ? 'الحلول' : 'Solutions'}
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {pillars.map((pillar) =>
          pillar ? (
            <article key={pillar.slug} className="bg-white border rounded-lg shadow-sm p-5">
              <h2 className="text-xl font-semibold mb-2">{pillar.title}</h2>
              <p className="text-gray-600 mb-4">{pillar.description}</p>
              <Link href={`/${locale}/solutions/${pillar.slug}`} className="text-blue-600 font-medium">
                {locale === 'ar' ? 'اقرأ المزيد' : 'Learn more'}
              </Link>
            </article>
          ) : null
        )}
      </div>
    </main>
  );
}


// /* --- Page component --- */
// export default async function SolutionsPage({
//   params,
// }: {
//   params: { locale: Locale };
// }) {
//   const { locale } = params;

//   // Fetch slugs and then localized pillar data
//   const slugs = await dataSource.getAllPillars();
//   const pillars = await Promise.all(
//     slugs.map(async (slug) => await dataSource.findPillar(slug, locale))
//   );

//   return (
//     <main className="container mt-16 pt-16 min-h-screen mx-auto px-4 py-8">
//       <h1 className="text-3xl font-bold mb-6">
//         {locale === 'ar' ? 'الحلول' : 'Solutions'}
//       </h1>
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//         {pillars.map((pillar) =>
//           pillar ? (
//             <article
//               key={pillar.slug}
//               className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 hover:shadow-md transition-shadow duration-300"
//             >
//               <h2 className="text-xl font-semibold mb-2">{pillar.title_en}</h2>
//               <p className="text-gray-600 mb-4">{pillar.description_en}</p>
//               <Link
//                 href={`/${locale}/solutions/${pillar.slug}`}
//                 className="text-blue-600 hover:text-blue-800 font-medium"
//               >
//                 {locale === 'ar' ? 'اقرأ المزيد' : 'Learn more'}
//               </Link>
//             </article>
//           ) : null
//         )}
//       </div>
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

// /* ------------------------------------------------------------------ *
//  *  Static params: pre‑render this page for every locale
//  * ------------------------------------------------------------------ */
// export async function generateStaticParams() {
//   return LOCALES.map((locale) => ({ locale }));
// }

// /* ------------------------------------------------------------------ *
//  *  Dynamic <head> metadata (locale‑aware)
//  * ------------------------------------------------------------------ */
// export function generateMetadata(
//   { params }: { params: { locale: Locale } }
// ): Metadata {
//   const { locale } = params;

//   const title = 'Solutions';
//   const description =
//     'Explore our AI‑powered slide generators and templates, organised by solution category.';
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

// /* ------------------------------------------------------------------ *
//  *  Page component
//  * ------------------------------------------------------------------ */
// export default async function SolutionsPage({
//   params,
// }: {
//   params: { locale: Locale };
// }) {
//   const { locale } = params;

//   // Get all pillars then look up their data
//   const slugs = await dataSource.getAllPillars();
//   const pillars = await Promise.all(slugs.map((slug) => dataSource.findPillar(slug)));

//   return (
//     <main className="container mx-auto px-4 py-8">
//       <h1 className="text-3xl font-bold mb-6">Solutions</h1>

//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//         {pillars.map((pillar) =>
//           pillar ? (
//             <article
//               key={pillar.slug}
//               className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 hover:shadow-md transition-shadow duration-300"
//             >
//               <h2 className="text-xl font-semibold mb-2">{pillar.title}</h2>
//               <p className="text-gray-600 mb-4">{pillar.description}</p>

//               <Link
//                 href={`/${locale}/solutions/${pillar.slug}`}
//                 className="text-blue-600 hover:text-blue-800 font-medium"
//               >
//                 Learn more
//               </Link>
//             </article>
//           ) : null
//         )}
//       </div>
//     </main>
//   );
// }


// // app/(public)/[locale]/solutions/index.tsx
// import Link from 'next/link';
// import type { Metadata } from 'next';
// import { dataSource } from '@/lib/data';
// import type { Locale } from '@/utils/i18n';
// import { LOCALES } from '@/utils/i18n';
// import { siteUrl } from '@/utils/seo';



// export const metadata = {
//   title: 'Blog',
//   description: 'Read the latest updates, tips and news from Doc2Deck.',
//   alternates: {
//     canonical: ({ params }: { params: { locale: Locale } }) =>
//       `${siteUrl}/${params.locale}/blog`,
//     languages: LOCALES.reduce((acc, loc) => {
//       acc[loc] = `${siteUrl}/${loc}/blog`;
//       return acc;
//     }, {} as Record<string, string>),
//   },
// };
// /**
//  * Pre‑build this index page for every locale. Without this, Next.js would
//  * only statically generate one language. We iterate over all locales and
//  * return an array of params objects.
//  */
// export async function generateStaticParams() {
//   return LOCALES.map((locale) => ({ locale }));
// }

// /**
//  * Provide default metadata for the solutions listing. This includes a
//  * descriptive title and description as well as canonical and alternate
//  * language URLs. Individual pillar pages override this in their own
//  * generateMetadata functions.
//  */
// export function generateMetadata({ params }: { params: { locale: Locale } }): Metadata {
//   const { locale } = params;
//   const title = 'Solutions';
//   const description =
//     'Explore our AI powered slide generators and templates organized by solution category.';
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

// /**
//  * The solutions index page lists all pillars (solution categories). It fetches
//  * the list of pillar slugs then looks up each pillar to display its title and
//  * description. Each item links to the locale‑aware detail page.
//  */
// export default async function SolutionsPage({
//   params,
// }: {
//   params: { locale: Locale };
// }) {
//   const { locale } = params;
//   const slugs = await dataSource.getAllPillars();
//   const pillars = await Promise.all(slugs.map((slug) => dataSource.findPillar(slug)));

//   return (
//     <main className="container mx-auto px-4 py-8">
//       <h1 className="text-3xl font-bold mb-6">Solutions</h1>
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//         {pillars.map((pillar) =>
//           pillar ? (
//             <article
//               key={pillar.slug}
//               className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 hover:shadow-md transition-shadow duration-300"
//             >
//               <h2 className="text-xl font-semibold mb-2">{pillar.title}</h2>
//               <p className="text-gray-600 mb-4">{pillar.description}</p>
//               <Link
//                 href={`/${locale}/solutions/${pillar.slug}`}
//                 className="text-blue-600 hover:text-blue-800 font-medium"
//               >
//                 Learn more
//               </Link>
//             </article>
//           ) : null
//         )}
//       </div>
//     </main>
//   );
// }

// components/landing/LandingTemplate.tsx
'use client';

import StructuredData from '@/components/StructuredData';
import Converter from '@/components/Converter';
import FeatureSectionAr from '@/components/landing/FeatureSectionAr';
import FeatureSectionEn from '@/components/landing/FeatureSectionEn';
import LandingCopyAr from '@/components/landing/LandingCopyAr';
import LandingCopyEn from '@/components/landing/LandingCopyEn';
import FaqAr from '@/components/landing/FaqAr';
import { FaqEn } from '@/components/FaqEn';
import Link from 'next/link';
import type { Converter as ConverterRow } from '@/lib/server/converters';
import { buildHowToSchema } from '@/components/StructuredData';
import { getArVariations, getEnVariations } from '@/utils/variations';

interface LandingTemplateProps {
  locale: 'en' | 'ar';
  row: ConverterRow;
  related: ConverterRow[];
}

/** Utility: human readable “DOCX → PPT” string localized */
function dirLabel(row: ConverterRow, isAr: boolean): string {
  const spaced = row.dir.replace('→', ' → ');
  return isAr ? `(${spaced})` : spaced;
}

export default function LandingTemplate({
  locale,
  row,
  related,
}: LandingTemplateProps) {
  const isAr = locale === 'ar';

  // Generate keyword variations for on‑page copy
  const variations = isAr
    ? getArVariations(row.label_ar, row.dir)
    : getEnVariations(row.label_en, row.dir);

  return (
    <main className="container mt-16 pt-16 min-h-screen mx-auto py-12 space-y-12">
      <header className="text-center space-y-3">
        <h1 className="text-3xl font-bold">
          {isAr ? row.label_ar : row.label_en}
        </h1>
        <p className="text-sm text-muted-foreground">
          {dirLabel(row, isAr)}
        </p>
      </header>

      {/* Converter component */}
      <Converter
        locale={locale}
        proxyPath={`/api/ai/${row.slug_en}`}
        templateGalleryPath="/templates"
      />

      {/* Features, copy & FAQ */}
      {isAr ? (
        <>
          <FeatureSectionAr row={row} />
          <LandingCopyAr row={row} />
          <FaqAr row={row} />
        </>
      ) : (
        <>
          <FeatureSectionEn row={row} />
          <LandingCopyEn row={row} />
          <FaqEn row={row} />
        </>
      )}

      {/* Related search terms & variations */}
      <section className="mt-8 space-y-2">
        <h3 className="text-xl font-bold">
          {isAr ? 'عمليات بحث مشابهة' : 'Related search terms'}
        </h3>
        <p className={isAr ? 'text-right' : 'text-left'}>
          {variations.map((term, i) => (
            <span key={term}>
              {term}
              {i < variations.length - 1 && (isAr ? '، ' : ', ')}
            </span>
          ))}
        </p>
      </section>

      {/* Related converter links (contextual suggestions) */}
      {isAr && related.length > 0 && (
        <section className="mt-12" dir="rtl">
          <h3 className="text-xl font-bold">تم البحث أيضاً عن</h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {related.map((c) => (
              <li key={c.slug_en}>
                <Link href={`/ar/tools/${c.slug_en}`}>{c.label_ar}</Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Structured data for HowTo schema */}
      <StructuredData
        type="HowTo"
        data={buildHowToSchema(row, locale)}
      />
    </main>
  );
}

// 'use client';

// /**
//  * Universal landing-page layout for every converter.
//  */

// import StructuredData from "@/components/StructuredData";
// import Converter from "@/components/Converter";
// import FeatureSectionAr from "@/components/landing/FeatureSectionAr";
// import LandingCopyAr from "@/components/landing/LandingCopyAr";
// import FaqAr from "@/components/landing/FaqAr";
// import { FaqEn, FAQ_EN } from "@/components/FaqEn";
// import { FAQ_AR } from "@/components/landing/FaqAr";
// import type { Converter as ConverterRow } from "@/lib/routes";
// import { PlanBadge } from "@/components/PlanBadge";
// import { useUserPlan } from "@/context/UserContext";
// import { buildHowToSchema } from '@/components/StructuredData';
// import { getRelatedConverters } from '@/lib/routes';

// import LandingCopyEn   from "@/components/landing/LandingCopyEn";
// import FeatureSectionEn from "@/components/landing/FeatureSectionEn";
// import Link from 'next/link';


// interface LandingTemplateProps {
//   locale: "en" | "ar";
//   row: ConverterRow;
// }



// /** Utility: human readable “DOCX → PPT” string localized */
// function dirLabel(row: ConverterRow, isAr: boolean): string {
//   // row.dir already looks like "DOCX→PPT"; just space it + localize arrow if needed
//   const spaced = row.dir.replace("→", " → ");
//   if (!isAr) return spaced;
//   // Arabic UI: keep Latin extensions; prepend verb
//   return `(${spaced})`;
// }

// export default function LandingTemplate({ locale, row }: LandingTemplateProps) {
//   const isAr = locale === "ar";
//   const plan = useUserPlan();
//   const related = isAr ? getRelatedConverters(row.slug_en) : [];

//   return (
//     <main className="container mt-16 pt-16 min-h-screen mx-auto py-12 space-y-12">
//       <header className="text-center space-y-3">
//         {/* <PlanBadge plan={plan} /> */}
//         <h1 className="text-3xl font-bold">
//           {isAr ? row.label_ar : row.label_en}
//         </h1>
//         <p className="text-sm text-muted-foreground">{dirLabel(row, isAr)}</p>
//       </header>

//       {/* Converter takes no props in current codebase */}
//       <Converter 
//       locale={locale}
//       proxyPath={`/api/ai/${row.slug_en}`}
//       templateGalleryPath="/templates"
      
//       />

//       {isAr ? (
//   <>
//     <FeatureSectionAr row={row} />
//     <LandingCopyAr   row={row} />
//     <FaqAr           row={row} />
//   </>
// ) : (
//   <>
//     <FeatureSectionEn row={row} />
//     <LandingCopyEn row={row} />
//     <FaqEn         row={row} />
//   </>
// )}

//       {isAr && related.length > 0 && (
//         <section className="mt-12" dir="rtl">
//           <h3 className="text-xl font-bold">تم البحث أيضاً عن</h3>
//           <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
//             {related.map((c) => (
//               <li key={c.slug_en}>
//                 <Link href={`/ar/tools/${c.slug_en}`}>{c.label_ar}</Link>
//               </li>
//             ))}
//           </ul>
//         </section>
//       )}
// {/* 
//       {isAr ? (
//         <>
//           <FeatureSectionAr />
//           <LandingCopyAr />
//           <FaqAr />
//         </>
//       ) : (
//         <FaqEn />
//       )} */}

//       <StructuredData
//         type="HowTo"
//         data={buildHowToSchema(row, locale)}
//       />

//     </main>
//   );
// }

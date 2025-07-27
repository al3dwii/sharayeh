import type { Metadata } from 'next';
import HomeTemplate from '@/components/landing/HomeTemplate';
import { LOCALES } from '@/utils/i18n';
import {
  siteUrl,
  siteName,
  defaultTitle,
  defaultDescription,
  ogImage,
} from '@/utils/seo';

type Props = { params: { locale: (typeof LOCALES)[number] } };

/* ------------------------------------------------------------------ */
/* ① generateMetadata – now fully indexable & locale‑aware            */
/* ------------------------------------------------------------------ */
export function generateMetadata({ params }: Props): Metadata {
  const { locale } = params;

  /* Self‑canonical URL for the current locale */
  const canonical = `${siteUrl}/${locale}`;

  /* Localised meta */
  const title =
    locale === 'ar'
      ? 'تحويل الملفات وإنشاء المحتوى بالذكاء الاصطناعي'
      : defaultTitle;

  const description =
    locale === 'ar'
      ? 'حوِّل المستندات، الفيديوهات، العروض التقديمية والصور في خطوة واحدة.'
      : defaultDescription;

  return {
    /** ----------------------------------------------------------------
     * BASIC TAGS
     * ---------------------------------------------------------------- */
    title,
    description,

    /** ----------------------------------------------------------------
     * ROBOTS – explicitly allow indexing & following
     * ---------------------------------------------------------------- */
    robots: {
      index: true,
      follow: true,
    },

    /** ----------------------------------------------------------------
     * ALTERNATES – self‑canonical + hreflangs (+ x‑default for Google)
     * ---------------------------------------------------------------- */
    alternates: {
      canonical,                  // Self‑canonical
      languages: {
        en: `${siteUrl}/en`,
        ar: `${siteUrl}/ar`,
        'x-default': siteUrl,     // Fallback if locale unknown
      },
    },

    /** ----------------------------------------------------------------
     * OPEN GRAPH
     * ---------------------------------------------------------------- */
    openGraph: {
      type: 'website',
      url: canonical,
      title,
      description,
      siteName,
      locale,
      images: ogImage(),          // expects [{ url, width, height, alt }]
    },

    /** ----------------------------------------------------------------
     * TWITTER CARDS
     * ---------------------------------------------------------------- */
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImage().map((img) => img.url),
    },
  };
}

/* ------------------------------------------------------------------ */
/* ② Page component – unchanged                                       */
/* ------------------------------------------------------------------ */
export default function Page({ params }: Props) {
  return <HomeTemplate locale={params.locale} />;
}

// import type { Metadata } from 'next';
// import HomeTemplate from '@/components/landing/HomeTemplate';
// import { LOCALES } from '@/utils/i18n';
// import { siteUrl, siteName, defaultTitle, defaultDescription, ogImage } from '@/utils/seo';

// type Props = { params: { locale: (typeof LOCALES)[number] } };

// export function generateMetadata({ params }: Props): Metadata {
//   const { locale } = params;
//   const url = `${siteUrl}/${locale}`;
//   const title =
//     locale === 'ar'
//       ? ' تحويل الملفات وإنشاء المحتوى بالذكاء الصناعي '
//       : defaultTitle;
//   const description =
//     locale === 'ar'
//       ? 'حوِّل المستندات، الفيديوهات، العروض التقديمية والصور في خطوة واحدة.'
//       : defaultDescription;

//   return {
//     title,
//     description,
//     alternates: {
//       canonical: url,
//       languages: {
//         'en': `${siteUrl}/en`,
//         'ar': `${siteUrl}/ar`,
//       },
//     },
//     openGraph: {
//       title,
//       description,
//       url,
//       locale,
//       siteName,
//       images: ogImage(),
//       type: 'website',
//     },
//     twitter: {
//       card: 'summary_large_image',
//       title,
//       description,
//       images: ogImage().map((img) => img.url),
//     },
//   };
// }

// export default function Page({ params }: Props) {
//   return <HomeTemplate locale={params.locale} />;
// }


// import Link from 'next/link'
// import { Footer } from "@/components/custom/footer";
// // import {Button} from "../components/gadawel/custom-button";

// import { Hero } from "@/components/custom/hero";
// import Hvideo from "@/components/custom/homevid";
// import { Faqs } from "@/components/custom/faqs";


// export default async function Home() {
  
//   return (
//     <>
    //   <Hero />
    //  <Hvideo src="/ge44.mp4" className="lg:w-2/3 m-auto bg-gray-200 flex flex-col md:flex-row justify-around items-center gap-2 p-4 md:p-2 relative" />
    //   <Faqs /> 

    //   <section className="bg-secondary w-full flex flex-col md:flex-row justify-around items-center gap-2 p-20 relative">
    //     <div className="bg-gradient-primary h-full w-full absolute top-0 left-0 z-10" />
    //     <div className="max-w-[500px] z-[20]">
    //       <h3 className="text-white capitalize text-[20px] m-0 font-[600] w-[300px]">
    //         استخدم الذكاء الصناعي في إنشاء بوربوينت احترافي خلال دقائق
    //       </h3>
    //       <p className="text-slate-300 text-[16px] w-full my-5">
    //         ملف كامل بجودة عالية مع الحركات و قابل للتعديل 
    //       </p>
    //     </div>
    //     <Link href="/sign-up" prefetch={false} className="z-20 w-full max-w-[350px] flex justify-center rounded-xl font-bold">
    //       {/* <Button
    //         text="التسجيل"
    //         className="z-[20] button-primary rounded-xl text-[28px] px-10 font-bold flex justify-center"
    //       /> */}
    //     </Link>
    //   </section>

//     </>
//   )
// }


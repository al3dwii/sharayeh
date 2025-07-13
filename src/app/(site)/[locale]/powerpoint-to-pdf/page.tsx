import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";

import { availableLocales } from "@/lib/i18n";
import { getRoutes, routeMeta } from "@/lib/routes";

import FeatureSectionAr from "@/components/landing/FeatureSectionAr";
import LandingCopyAr    from "@/components/landing/LandingCopyAr";
import FaqAr            from "@/components/landing/FaqAr";

const Converter = dynamic(() => import("@/components/Converter"), { ssr: false });

export const revalidate = 86400;

export async function generateStaticParams() {
  return getRoutes().flatMap(r =>
    availableLocales.map(locale => ({ locale, slug_en: r.slug_en }))
  );
}

export async function generateMetadata({ params }: { params: { locale: string; slug_en: string } }): Promise<Metadata> {
  return routeMeta(params.slug_en, params.locale as "ar" | "en");
}

export default function Page({ params }: { params: { locale: string; slug_en: string } }) {
  const routes = getRoutes();
  const row = routes.find(r => r.slug_en === params.slug_en);
  if (!row) return notFound();

  const isAr = params.locale === "ar";
  return (
    <main className="container mx-auto py-12 space-y-12">
      <h1 className="text-3xl font-bold text-center">
        {isAr ? row.label_ar : row.label_en}
      </h1>
      <Converter conversion={row.dir} />
      {isAr && <FeatureSectionAr />}
      {isAr && <LandingCopyAr />}
      {isAr && <FaqAr />}
    </main>
  );
}

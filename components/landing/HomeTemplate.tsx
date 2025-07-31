'use client';

import { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { HOME_EN, HOME_AR, HomeCopy } from '@/content/home';
import { LOCALES } from '@/utils/i18n';

import { Footer } from "@/components/custom/footer";
// import {Button} from "../components/gadawel/custom-button";

import  Hero  from "@/components/custom/hero";
import Hvideo from "@/components/custom/homevid";
import { Faqs } from "@/components/custom/faqs";


type Props = { locale: (typeof LOCALES)[number] };

export default function HomeTemplate({ locale }: Props) {
  const t: HomeCopy = locale === 'ar' ? HOME_AR : HOME_EN;
  const isAr = locale === 'ar';

  return (
    <main dir={isAr ? 'rtl' : 'ltr'} className="mt-8 mx-auto ">
      {/* HERO */}
      <Hero locale={locale} />

      {/* <section className="text-center pb-16space-y-6">
        <h1 className="text-4xl font-extrabold">{t.hero.title}</h1>
        <p className="text-gray-600">{t.hero.subtitle}</p>
        <Link
          href={`/${locale}/dashboard`}
          className="inline-block rounded-lg bg-primary px-6 py-3 font-semibold text-white shadow hover:bg-primary/90"
        >
          {t.hero.cta}
        </Link>
      </section> */}

      {/* FEATURE GRID */}
      <section className="mt-4 mb-4 m-8 grid gap-4 md:grid-cols-4">
        {t.features.map(({ icon, title, desc }) => {
          const Icon = (require('lucide-react') as any)[icon] as LucideIcon;
          return (
            <div
              key={title}
              className="flex flex-col items-start gap-4 bg-white rounded-2xl border p-6 shadow-sm hover:shadow-md"
            >
              <span className="rounded-full border p-3">
                <Icon className="size-5" aria-hidden />
              </span>
              <h3 className="font-semibold">{title}</h3>
              <p className="text-sm text-gray-600">{desc}</p>
            </div>
          );
        })}
      </section>
          
     <Hvideo src="/ge44.mp4" className="lg:w-2/3 m-auto bg-gray-200 flex flex-col md:flex-row justify-around items-center gap-2 p-4 md:p-2 relative" />
      <Faqs /> 

      <section className="bg-secondary w-full flex flex-col md:flex-row justify-around items-center gap-2 p-20 relative">
        <div className="bg-gradient-primary h-full w-full absolute top-0 left-0 z-10" />
        <div className="max-w-[500px] z-[20]">
          
        </div>
        <Link href="/sign-up" prefetch={false} className="z-20 w-full max-w-[350px] flex justify-center rounded-xl font-bold">
          {/* <Button
            text="التسجيل"
            className="z-[20] button-primary rounded-xl text-[28px] px-10 font-bold flex justify-center"
          /> */}
        </Link>
      </section>


      {/* FAQ */}
      {/* <section className="mt-24 space-y-6">
        <h2 className="text-2xl font-bold">{isAr ? 'الأسئلة الشائعة' : 'FAQ'}</h2>
        <div className="space-y-4">
          {t.faqs.map(({ q, a }) => (
            <details key={q} className="rounded-lg border p-4">
              <summary className="cursor-pointer font-medium">{q}</summary>
              <p className="mt-2 text-gray-600">{a}</p>
            </details>
          ))}
        </div>
      </section> */}
    </main>
  );
}

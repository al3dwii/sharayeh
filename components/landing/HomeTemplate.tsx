'use client';

import { LucideIcon } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { HOME_EN, HOME_AR, HomeCopy } from '@/content/home';
import { LOCALES } from '@/utils/i18n';

import { Footer } from "@/components/custom/footer";
// import {Button} from "../components/gadawel/custom-button";

import  Hero  from "@/components/custom/hero";
import Hvideo from "@/components/custom/homevid";
import { Faqs } from "@/components/custom/faqs";
import { QuickAnswer, KeyStats } from '@/components/ai/AIComponents';


type Props = { locale: (typeof LOCALES)[number] };

export default function HomeTemplate({ locale }: Props) {
  const t: HomeCopy = locale === 'ar' ? HOME_AR : HOME_EN;
  const isAr = locale === 'ar';

  return (
    <main dir={isAr ? 'rtl' : 'ltr'} className="mt-8 mx-auto ">
      {/* HERO */}
      <Hero locale={locale} />

      {/* AI-OPTIMIZED QUICK ANSWER */}
      <section className="container mx-auto px-4 mt-8">
        <QuickAnswer
          question={isAr ? 'ما هي شرايح؟' : 'What is Sharayeh?'}
          answer={
            isAr
              ? 'شرايح هي منصة مدعومة بالذكاء الاصطناعي تقدم أكثر من 30 أداة متخصصة لتحويل المستندات وتحسين الملفات. حول الملفات، وأنشئ العروض التقديمية، وحسّن ملفات PDF - كل ذلك مجانًا دون الحاجة للتسجيل.'
              : 'Sharayeh is an AI-powered platform offering 30+ specialized tools for document conversion, file optimization, and content automation. Convert files, create presentations, and optimize PDFs—all free with no registration required.'
          }
          steps={
            isAr
              ? ['ارفع ملفك', 'اختر نوع التحويل', 'حمّل الملف المحول']
              : ['Upload your file', 'Choose conversion type', 'Download converted file']
          }
          keyFacts={[
            { label: isAr ? 'الأدوات' : 'Tools', value: '30+' },
            { label: isAr ? 'المستخدمون' : 'Users', value: '2.3M+' },
            { label: isAr ? 'التقييم' : 'Rating', value: '4.8/5' },
            { label: isAr ? 'السرعة' : 'Speed', value: '< 10s' },
          ]}
        />
      </section>

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
      
      {/* AI-OPTIMIZED KEY STATISTICS */}
      <section className="container mx-auto px-4 my-12">
        <KeyStats
          title={isAr ? 'إحصائيات المنصة' : 'Platform Statistics'}
          stats={[
            {
              label: isAr ? 'إجمالي التحويلات' : 'Total Conversions',
              value: '5.7M+',
              description: isAr ? 'ملفات تمت معالجتها بنجاح' : 'Files processed successfully',
            },
            {
              label: isAr ? 'متوسط السرعة' : 'Average Speed',
              value: '< 10s',
              description: isAr ? 'لكل تحويل' : 'Per conversion',
            },
            {
              label: isAr ? 'تقييم المستخدمين' : 'User Rating',
              value: '4.8/5',
              description: isAr ? 'بناءً على 1,247 مراجعة' : 'Based on 1,247 reviews',
            },
            {
              label: isAr ? 'وقت التشغيل' : 'Uptime',
              value: '99.9%',
              description: isAr ? 'توافر الخدمة' : 'Service availability',
            },
            {
              label: isAr ? 'الدول' : 'Countries',
              value: '150+',
              description: isAr ? 'مستخدمون حول العالم' : 'Users worldwide',
            },
            {
              label: isAr ? 'اللغات' : 'Languages',
              value: '2',
              description: isAr ? 'العربية والإنجليزية' : 'Arabic & English',
            },
          ]}
        />
      </section>

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

/* content/home.ts
 * Pure data → easily statically analysed & tree‑shaken
 */
export interface HomeCopy {
  hero: { title: string; subtitle: string; cta: string };
  features: Array<{ icon: string; title: string; desc: string }>;
  faqs: Array<{ q: string; a: string }>;
}

export const HOME_EN: HomeCopy = {
  hero: {
    title: 'AI‑Powered Content Automation & File Conversion Hub',
    subtitle:
      'Convert, optimise & repurpose DOCX, PDF, PPTX, media, CAD, code and data using 30+ specialised AI pipelines — all in one privacy‑first workspace.',
    cta: 'Get started for free',
  },
  features: [
    { icon: 'FileText', title: 'Universal formats', desc: 'DOCX, PDF, PPTX, audio, video, spreadsheets, CAD, code and more.' },
    { icon: 'Zap', title: '30+ AI converters', desc: 'From summarising documents to generating slides, transcribing audio and translating code.' },
    { icon: 'ShieldCheck', title: 'Privacy‑first', desc: 'Files are processed securely and automatically deleted after 24\u00A0hours.' },
    { icon: 'Globe', title: 'Multilingual', desc: 'English, Arabic and more — RTL support out of the box.' },
  ],
  faqs: [ /* update FAQ copy if needed */ ],
};

export const HOME_AR: HomeCopy = {
  hero: {
    title: 'تحويل الملفات وإنشاء المحتوى بالذكاء الصناعي',
    subtitle:
      'حوِّل المستندات، الفيديوهات، العروض التقديمية، والبيانات باستخدام أكثر من ٣٠ أداة متخصصة في مكان واحد وبخصوصية تامة.',
    cta: 'ابدأ مجاناً',
  },
  features: [
    { icon: 'FileText', title: 'تنسيقات شاملة', desc: 'DOCX، PDF، PPTX، صوت، فيديو، جداول، CAD، كود وغيرها.' },
    { icon: 'Zap', title: 'أكثر من ٣٠ محولاً ذكياً', desc: 'من تلخيص المستندات إلى إنشاء عروض الشرائح وترجمة الكود.' },
    { icon: 'ShieldCheck', title: 'خصوصية أولاً', desc: 'يتم معالجة الملفات بأمان وحذفها بعد ٢٤ ساعة.' },
    { icon: 'Globe', title: 'دعم متعدد اللغات', desc: 'الإنجليزية والعربية وغيرها — مع دعم RTL.' },
  ],
  faqs: [ /* عيّن الأسئلة الشائعة الجديدة هنا */ ],
};

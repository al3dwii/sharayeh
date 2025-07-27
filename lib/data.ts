// lib/data.ts
// -----------------------------------------------------------------------------
//  SlideCraft Suite – full data model with 6 customer‑centric pillars
//  (English + Arabic). Copy‑and‑paste this file to replace your old placeholders.
// -----------------------------------------------------------------------------

export type Tool = {
  slug: string;
  name_en: string;
  name_ar: string;
};

export type Pillar = {
  slug: string;
  title_en: string;
  title_ar: string;
  description_en: string;
  description_ar: string;
  tools: Tool[];
};

export type LocalizedTool = Tool & { name: string };

export type LocalizedPillar = Pillar & {
  title: string;
  description: string;
  tools: LocalizedTool[];
};

/* -------------------------------------------------------------------------- */
/*  Pillars                                                                   */
/* -------------------------------------------------------------------------- */
export const pillars: Pillar[] = [

  /* 1. Everyday Office & Students ------------------------------------------ */
  {
    slug: 'office-conversions',
    title_en: 'Everyday Conversions (Office & Students)',
    title_ar: 'تحويلات يومية (مكتب وطلاب)',
    description_en:
      'Fast one‑click converters between Word, PDF, Google Slides and PowerPoint for homework, reports and daily office tasks.',
    description_ar:
      'محولات سريعة بنقرة واحدة بين وورد وPDF وجوجل سلايد وبوربوينت للواجبات والتقارير والمهام المكتبية اليومية.',
    tools: [
      { slug: 'word-to-powerpoint',            name_en: 'Convert Word to PowerPoint',              name_ar: 'تحويل وورد إلى بوربوينت' },
      { slug: 'pdf-to-powerpoint',             name_en: 'Convert PDF to PowerPoint',               name_ar: 'تحويل PDF إلى بوربوينت' },
      { slug: 'powerpoint-to-pdf',             name_en: 'Convert PowerPoint to PDF',               name_ar: 'تحويل بوربوينت إلى PDF' },
      { slug: 'powerpoint-to-word',            name_en: 'Convert PowerPoint to Word',              name_ar: 'تحويل بوربوينت إلى وورد' },
      { slug: 'word-to-pdf',                   name_en: 'Convert Word to PDF',                     name_ar: 'تحويل وورد إلى PDF' },
      { slug: 'excel-to-powerpoint',           name_en: 'Convert Excel to PowerPoint',             name_ar: 'تحويل اكسل إلى بوربوينت' },
      { slug: 'powerpoint-to-google-slides',   name_en: 'Convert PowerPoint to Google Slides',     name_ar: 'تحويل بوربوينت إلى جوجل سلايد' },
      { slug: 'google-slides-to-powerpoint',   name_en: 'Convert Google Slides to PowerPoint',     name_ar: 'تحويل جوجل سلايد إلى بوربوينت' },
      { slug: 'powerpoint-to-jpeg',            name_en: 'Convert PowerPoint to Images',            name_ar: 'تحويل بوربوينت إلى صور' },
      { slug: 'ppt-to-video',                  name_en: 'Convert PowerPoint to Video',             name_ar: 'تحويل بوربوينت إلى فيديو' },
      { slug: 'ppt-to-prezi',                  name_en: 'Convert PPT to Prezi',                    name_ar: 'تحويل بوربوينت إلى بريزي' },
      { slug: 'ppt-to-google-slides',          name_en: 'Convert PPT to Google Slides',            name_ar: 'تحويل بوربوينت إلى جوجل شرائح' },
      { slug: 'ppt-slide-gif',                 name_en: 'Slide to GIF',                            name_ar: 'تحويل شريحة إلى GIF' },
      { slug: 'ppt-to-html5',                  name_en: 'Convert PPT to HTML5',                    name_ar: 'تحويل بوربوينت إلى HTML5' },
      { slug: 'markdown-to-powerpoint',        name_en: 'Convert Markdown to PowerPoint',          name_ar: 'تحويل ماركداون إلى بوربوينت' },
      { slug: 'notion-to-powerpoint',          name_en: 'Convert Notion Page to PowerPoint',       name_ar: 'تحويل صفحة Notion إلى بوربوينت' },
      { slug: 'google-doc-to-powerpoint',      name_en: 'Google Doc to PowerPoint',                name_ar: 'تحويل مستند جوجل إلى بوربوينت' },
      { slug: 'pptx-compress',                 name_en: 'Compress PPTX Online',                    name_ar: 'ضغط بوربوينت أونلاين' },
      { slug: 'ppt-dimensions',                name_en: 'Best PPT Dimensions',                     name_ar: 'أفضل مقاسات بوربوينت' },
      { slug: 'ppt-vs-keynote',                name_en: 'PPT vs Keynote',                          name_ar: 'بوربوينت مقابل كينوت' },
      { slug: 'ppt-slide-count',               name_en: 'Count Slides in PPT',                     name_ar: 'عدد الشرائح في بوربوينت' },
      { slug: 'ppt-speaker-notes',             name_en: 'Export Speaker Notes',                    name_ar: 'تصدير ملاحظات المتحدث' }
    ],
  },

  /* 2. Educators & LMS ------------------------------------------------------ */
  {
    slug: 'educator-toolkit',
    title_en: 'Educators & LMS Toolkit',
    title_ar: 'عدة المعلمين وأنظمة التعلم',
    description_en:
      'Create SCORM‑ready lessons, interactive quizzes and course material directly from your documents.',
    description_ar:
      'أنشئ دروسًا جاهزة لـ SCORM واختبارات تفاعلية ومواد تدريبية مباشرة من مستنداتك.',
    tools: [
      { slug: 'training-manual-to-slides',   name_en: 'Training Manual to Slides',        name_ar: 'تحويل دليل تدريب إلى شرائح' },
      { slug: 'syllabus-to-scorm',           name_en: 'Convert Syllabus to SCORM',        name_ar: 'تحويل منهج إلى SCORM' },
      { slug: 'course-to-quiz',              name_en: 'Convert Course to Quiz',           name_ar: 'تحويل دورة إلى اختبار' },
      { slug: 'ppt-learning-objectives',     name_en: 'Learning Objectives Slides',       name_ar: 'أهداف تعلم في بوربوينت' },
      { slug: 'ppt-course-outline',          name_en: 'Course Outline Slides',            name_ar: 'مخطط دورة بوربوينت' },
      { slug: 'ppt-quiz-template',           name_en: 'Quiz Template PPT',                name_ar: 'قالب اختبار بوربوينت' },
      { slug: 'ppt-interactive-quiz',        name_en: 'Interactive PPT Quiz',             name_ar: 'اختبار تفاعلي بوربوينت' },
      { slug: 'ppt-scorm-example',           name_en: 'PPT to SCORM Example',             name_ar: 'مثال بوربوينت إلى SCORM' },
      { slug: 'ppt-scorm-cloud',             name_en: 'Send PPT to SCORM Cloud',          name_ar: 'إرسال بوربوينت إلى SCORM كلاود' },
      { slug: 'ppt-moodle-import',           name_en: 'Import PPT to Moodle',             name_ar: 'استيراد بوربوينت إلى مودل' },
      { slug: 'ppt-lms-export',              name_en: 'Export PPT to LMS',                name_ar: 'تصدير بوربوينت إلى نظام تعلم' },
      { slug: 'ppt-elearning-export',        name_en: 'PPT eLearning Export',             name_ar: 'تصدير بوربوينت للتعلم الإلكتروني' },
      { slug: 'ppt-h5p-convert',             name_en: 'Convert PPT to H5P',               name_ar: 'تحويل بوربوينت إلى H5P' },
      { slug: 'ppt-branching-scenarios',     name_en: 'Branching Scenarios PPT',          name_ar: 'سيناريوهات متفرعة بوربوينت' },
      { slug: 'ppt-adaptive-learning',       name_en: 'Adaptive Learning Slides',         name_ar: 'شرائح تعلم تكيفي' },
      { slug: 'ppt-xapi-export',             name_en: 'Export PPT to xAPI',               name_ar: 'تصدير بوربوينت إلى xAPI' },
      { slug: 'ppt-xapi-analytics',          name_en: 'xAPI Analytics Slides',            name_ar: 'تحليلات xAPI بوربوينت' },
      { slug: 'policy-doc-to-slides',        name_en: 'Policy Doc to Training Slides',    name_ar: 'تحويل سياسة إلى شرائح تدريبية' }
    ],
  },

  /* 3. Business & Strategy -------------------------------------------------- */
  {
    slug: 'business-analytics',
    title_en: 'Business & Strategy Decks',
    title_ar: 'عروض الأعمال والاستراتيجيات',
    description_en:
      'Turn raw data and plans into executive‑ready dashboards, investor decks and KPI visuals.',
    description_ar:
      'حوّل البيانات والخطط إلى لوحات معلومات وعروض مستثمرين وشرائح KPI جاهزة للإدارة.',
    tools: [
      { slug: 'kpi-dashboard-to-slide',   name_en: 'Convert KPI Dashboard to Slides', name_ar: 'تحويل لوحة مؤشرات إلى شرائح' },
      { slug: 'ppt-data-dashboard',       name_en: 'PowerPoint Data Dashboard',       name_ar: 'لوحة بيانات في بوربوينت' },
      { slug: 'ppt-kpi-templates',        name_en: 'KPI Templates PPT',               name_ar: 'قوالب KPI بوربوينت' },
      { slug: 'ppt-gantt-chart',          name_en: 'Gantt Chart in PPT',              name_ar: 'مخطط جان في بوربوينت' },
      { slug: 'ppt-timeline-chart',       name_en: 'Timeline Chart in PPT',           name_ar: 'مخطط زمني بوربوينت' },
      { slug: 'ppt-financial-ratios',     name_en: 'Financial Ratios Slides',         name_ar: 'شرائح نسب مالية' },
      { slug: 'ppt-roadmap-slide',        name_en: 'Product Roadmap Slide',           name_ar: 'شريحة خارطة الطريق' },
      { slug: 'ppt-okrs',                 name_en: 'OKR Slides',                      name_ar: 'شرائح OKR' },
      { slug: 'ppt-investor-deck',        name_en: 'Investor Deck PPT',               name_ar: 'عرض بوربوينت للمستثمرين' },
      { slug: 'ppt-pitch-deck',           name_en: 'Pitch Deck PPT',                  name_ar: 'عرض تقديمي بوربوينت' },
      { slug: 'ppt-rfp-slides',           name_en: 'RFP Response Slides',             name_ar: 'شرائح رد على عطاء' },
      { slug: 'ppt-market-analysis',      name_en: 'Market Analysis PPT',             name_ar: 'تحليل سوق بوربوينت' },
      { slug: 'ppt-swot-template',        name_en: 'SWOT Template PPT',               name_ar: 'قالب تحليل SWOT' },
      { slug: 'ppt-risk-register',        name_en: 'Risk Register Slides',            name_ar: 'شرائح سجل المخاطر' },
      { slug: 'ppt-error-budget',         name_en: 'Error Budget Slides',             name_ar: 'شرائح ميزانية الأخطاء' },
      { slug: 'ppt-sla-report',           name_en: 'SLA Report PPT',                  name_ar: 'تقرير اتفاقية مستوى الخدمة' },
      { slug: 'ppt-sla-monitor',          name_en: 'PPT SLA Monitoring',              name_ar: 'مراقبة SLA بوربوينت' },
      { slug: 'ppt-team-charter',         name_en: 'Team Charter Slide',              name_ar: 'شريحة ميثاق الفريق' },
      { slug: 'ppt-analytics',            name_en: 'PPT Usage Analytics',             name_ar: 'تحليلات استخدام بوربوينت' },
      { slug: 'ppt-sop-template',         name_en: 'SOP Template PPT',                name_ar: 'قالب إجراءات تشغيل' },
      { slug: 'ppt-onboarding-kit',       name_en: 'Employee Onboarding Kit',         name_ar: 'مجموعة تهيئة الموظفين' }
    ],
  },

  /* 4. Marketing & Creative ------------------------------------------------- */
  {
    slug: 'marketing-creative',
    title_en: 'Marketing & Creative Studio',
    title_ar: 'استوديو التسويق والإبداع',
    description_en:
      'Stay on‑brand with AI design, rich templates, voice‑overs, animations and share‑ready videos.',
    description_ar:
      'حافظ على الهوية باستخدام تصميمات ذكاء اصطناعي وقوالب غنية وتعليقات صوتية ورسوم متحركة وفيديوهات جاهزة للمشاركة.',
    tools: [
      { slug: 'ppt-brand-kit',            name_en: 'Apply Brand Kit to PPT',          name_ar: 'تطبيق الهوية البصرية على بوربوينت' },
      { slug: 'ppt-template-arabic',      name_en: 'Arabic PowerPoint Templates',     name_ar: 'قوالب عربية لبوربوينت' },
      { slug: 'ppt-template-english',     name_en: 'English PowerPoint Templates',    name_ar: 'قوالب إنجليزية لبوربوينت' },
      { slug: 'ppt-template-corporate',   name_en: 'Corporate PPT Template',          name_ar: 'قالب بوربوينت للشركات' },
      { slug: 'ppt-template-education',   name_en: 'Education PPT Template',          name_ar: 'قالب بوربوينت تعليمي' },
      { slug: 'ppt-ai-design',            name_en: 'AI PowerPoint Design',            name_ar: 'تصميم بوربوينت بالذكاء الاصطناعي' },
      { slug: 'ppt-infographic',          name_en: 'Create PPT Infographic',          name_ar: 'إنشاء انفوجرافيك بوربوينت' },
      { slug: 'ppt-photo-gallery',        name_en: 'Photo Gallery PPT',               name_ar: 'معرض صور بوربوينت' },
      { slug: 'ppt-ai-avatar',            name_en: 'AI Avatar Slides',                name_ar: 'شرائح أفاتار بالذكاء الاصطناعي' },
      { slug: 'ppt-avatar-lip-sync',      name_en: 'Avatar Lip‑sync PPT',             name_ar: 'تزامن شفاه أفاتار بوربوينت' },
      { slug: 'ppt-animation-to-video',   name_en: 'Animation PPT to Video',          name_ar: 'تحويل الحركة في بوربوينت إلى فيديو' },
      { slug: 'ppt-explainer-video',      name_en: 'PowerPoint Explainer Video',      name_ar: 'فيديو توضيحي بوربوينت' },
      { slug: 'ppt-training-video',       name_en: 'Training Video from PPT',         name_ar: 'فيديو تدريبي من بوربوينت' },
      { slug: 'ppt-marketing-video',      name_en: 'Marketing Video PPT',             name_ar: 'فيديو بوربوينت تسويقي' },
      { slug: 'ppt-video-thumbnail',      name_en: 'Generate Video Thumbnail',        name_ar: 'إنشاء صورة مصغرة للفيديو' },
      { slug: 'ppt-voiceover',            name_en: 'Add Voiceover to PPT',            name_ar: 'إضافة تعليق صوتي إلى بوربوينت' },
      { slug: 'ppt-text-to-speech',       name_en: 'Text‑to‑Speech Slides',           name_ar: 'تحويل النص إلى صوت بوربوينت' },
      { slug: 'ppt-audio-sync',           name_en: 'Sync Audio to Slides',            name_ar: 'مزامنة صوت مع الشرائح' },
      { slug: 'ppt-screen-record',        name_en: 'Screen‑record PPT',               name_ar: 'تسجيل شاشة بوربوينت' },
      { slug: 'ppt-live-share',           name_en: 'Live Share PPT',                  name_ar: 'مشاركة بوربوينت حيّة' },
      { slug: 'ppt-video-example',        name_en: 'PPT to Video Example',            name_ar: 'مثال بوربوينت إلى فيديو' },
      { slug: 'ppt-brand-guidelines',     name_en: 'Brand Guidelines Slides',         name_ar: 'شرائح دليل الهوية' },
      { slug: 'ppt-lottie',               name_en: 'Add Lottie Animations PPT',       name_ar: 'إضافة رسوم Lottie إلى بوربوينت' }
    ],
  },

  /* 5. Localization & Compliance ------------------------------------------- */
  {
    slug: 'localization-compliance',
    title_en: 'Localization, Accessibility & Compliance',
    title_ar: 'التعريب والموائمة والالتزام',
    description_en:
      'Translate, localize and make every slide accessible and policy‑compliant (RTL, subtitles, GDPR, H&S, etc.).',
    description_ar:
      'ترجم وعرّب واجعل كل شريحة موائمة وملتزمة بالسياسات (اتجاه RTL، ترجمات، GDPR، الصحة والسلامة وغير ذلك).',
    tools: [
      { slug: 'ppt-to-arabic',        name_en: 'Translate PPT to Arabic',      name_ar: 'ترجمة بوربوينت إلى العربية' },
      { slug: 'ppt-to-english',       name_en: 'Translate PPT to English',     name_ar: 'ترجمة بوربوينت إلى الإنجليزية' },
      { slug: 'word-to-arabic-slides',name_en: 'Word to Arabic Slides',        name_ar: 'تحويل وورد إلى شرائح عربية' },
      { slug: 'ppt-auto-translate',   name_en: 'Auto‑translate Slides',        name_ar: 'ترجمة تلقائية للشرائح' },
      { slug: 'ppt-localize',         name_en: 'Localize PPT Slides',          name_ar: 'تعريب شرائح بوربوينت' },
      { slug: 'ppt-rtl-fix',          name_en: 'Fix RTL Slides',               name_ar: 'تصحيح تنسيق الشرائح من اليمين إلى اليسار' },
      { slug: 'ppt-subtitles',        name_en: 'Add Subtitles to Slides',      name_ar: 'إضافة ترجمات إلى الشرائح' },
      { slug: 'ppt-subtitle-ar',      name_en: 'Arabic Subtitles PPT',         name_ar: 'ترجمة عربية للشرائح' },
      { slug: 'ppt-subtitle-en',      name_en: 'English Subtitles PPT',        name_ar: 'ترجمة إنجليزية للشرائح' },
      { slug: 'ppt-accessibility',    name_en: 'Accessible PPT Design',        name_ar: 'تصميم بوربوينت موائم' },
      { slug: 'ppt-watermark-remove', name_en: 'Remove PPT Watermark',         name_ar: 'إزالة علامة مائية من بوربوينت' },
      { slug: 'ppt-white-label',      name_en: 'White‑Label PPT',              name_ar: 'بوربوينت بدون علامة تجارية' },
      { slug: 'ppt-health-safety',    name_en: 'Health & Safety Slides',       name_ar: 'شرائح صحة وسلامة' },
      { slug: 'ppt-security-awareness',name_en:'Security Awareness PPT',       name_ar: 'بوربوينت توعية أمنية' },
      { slug: 'ppt-gdpr-compliance',  name_en: 'GDPR Compliance Slides',       name_ar: 'شرائح امتثال GDPR' }
    ],
  },

  /* 6. Developer & Enterprise --------------------------------------------- */
  {
    slug: 'developer-enterprise',
    title_en: 'Developer & Enterprise APIs',
    title_ar: 'واجهات برمجة التطبيقات للمطورين والمؤسسات',
    description_en:
      'Programmatic generation, bulk operations and deep integrations for your slide workflows.',
    description_ar:
      'إنشاء شرائح برمجيًا، تحويلات جماعية وتكاملات عميقة مع سير عملك.',
    tools: [
      { slug: 'ppt-api-generate',   name_en: 'Generate PPT via API',        name_ar: 'إنشاء بوربوينت عبر API' },
      { slug: 'ppt-enterprise-api', name_en: 'Enterprise PPT API',          name_ar: 'API بوربوينت مؤسسة' },
      { slug: 'ppt-sdk',            name_en: 'PPT SDK',                     name_ar: 'حزمة تطوير بوربوينت' },
      { slug: 'ppt-cli-tool',       name_en: 'PPT CLI Tool',                name_ar: 'أداة سطر أوامر بوربوينت' },
      { slug: 'ppt-bulk-convert',   name_en: 'Bulk Convert PPTs',           name_ar: 'تحويل بوربوينت جماعي' },
      { slug: 'ppt-json-input',     name_en: 'Generate PPT from JSON',      name_ar: 'إنشاء بوربوينت من JSON' },
      { slug: 'ppt-latex-input',    name_en: 'Generate PPT from LaTeX',     name_ar: 'إنشاء بوربوينت من LaTeX' },
      { slug: 'ppt-data-export',    name_en: 'Export PPT Data',             name_ar: 'تصدير بيانات بوربوينت' },
      { slug: 'ppt-integrations',   name_en: 'PPT Zapier Integration',      name_ar: 'تكامل بوربوينت مع Zapier' },
      { slug: 'ppt-ssu',            name_en: 'SSO PowerPoint Portal',       name_ar: 'بوابة بوربوينت SSO' },
      { slug: 'ppt-sso-guide',      name_en: 'PPT SSO Guide',               name_ar: 'دليل SSO لبوربوينت' },
      { slug: 'ppt-ai-summary',     name_en: 'AI Summary Slides',           name_ar: 'شرائح ملخص ذكاء اصطناعي' },
      { slug: 'ppt-content-ai',     name_en: 'Generate Slide Content AI',   name_ar: 'إنشاء محتوى شرائح بالذكاء الاصطناعي' }
    ],
  },
];

/* -------------------------------------------------------------------------- */
/*  Data‑access helpers                                                      */
/* -------------------------------------------------------------------------- */

export const dataSource = {
  /** Return just the pillar slugs (useful for static params) */
  getAllPillars: async (): Promise<string[]> => pillars.map((p) => p.slug),

  /** Fetch a pillar localized to the requested locale */
  findPillar: async (
    slug: string,
    locale: 'en' | 'ar'
  ): Promise<LocalizedPillar | undefined> => {
    const pillar = pillars.find((p) => p.slug === slug);
    if (!pillar) return undefined;

    return {
      ...pillar,
      title: locale === 'ar' ? pillar.title_ar : pillar.title_en,
      description: locale === 'ar' ? pillar.description_ar : pillar.description_en,
      tools: pillar.tools.map((tool) => ({
        ...tool,
        name: locale === 'ar' ? tool.name_ar : tool.name_en,
      })),
    };
  },
};

// // lib/data.ts
// export type Tool = {
//   slug: string;
//   name_en: string;
//   name_ar: string;
// };

// export type Pillar = {
//   slug: string;
//   title_en: string;
//   title_ar: string;
//   description_en: string;
//   description_ar: string;
//   tools: Tool[];
// };

// export type LocalizedTool = Tool & { name: string };

// export type LocalizedPillar = Pillar & {
//   title: string;
//   description: string;
//   tools: LocalizedTool[];
// };


// // lib/data.ts (continued)
// const pillars: Pillar[] = [
//   {
//     slug: 'startup-pitch-decks',
//     title_en: 'Startup Pitch Decks',
//     title_ar: 'عروض المستثمرين للشركات الناشئة',
//     description_en: 'Comprehensive guides and templates to craft investor‑focused pitch decks for your startup.',
//     description_ar: 'أدلة شاملة وقوالب لإعداد عروض استثمارية تركز على المستثمرين لشركتك الناشئة.',
//     tools: [
//       { slug: 'investor-pitch', name_en: 'Investor Pitch Generator', name_ar: 'مولِّد عرض المستثمر' },
//       { slug: 'saas-pitch', name_en: 'SaaS Pitch Deck Builder', name_ar: 'منشئ عرض SaaS' },
//       { slug: 'series-a-slides', name_en: 'Series A Slides Creator', name_ar: 'منشئ شرائح الجولة أ' },
//        { slug: 'investor-pitch', name_en: 'Investor Pitch Generator', name_ar: 'مولِّد عرض المستثمر' },
//       { slug: 'saas-pitch', name_en: 'SaaS Pitch Deck Builder', name_ar: 'منشئ عرض SaaS' },
//       { slug: 'series-a-slides', name_en: 'Series A Slides Creator', name_ar: 'منشئ شرائح الجولة أ' }, { slug: 'investor-pitch', name_en: 'Investor Pitch Generator', name_ar: 'مولِّد عرض المستثمر' },
//       { slug: 'saas-pitch', name_en: 'SaaS Pitch Deck Builder', name_ar: 'منشئ عرض SaaS' },
//       { slug: 'series-a-slides', name_en: 'Series A Slides Creator', name_ar: 'منشئ شرائح الجولة أ' },
//       // …add additional tools here
//     ],
//   },
//   {
//     slug: 'startup-pitch-decks',
//     title_en: 'Startup Pitch Decks',
//     title_ar: 'عروض المستثمرين للشركات الناشئة',
//     description_en: 'Comprehensive guides and templates to craft investor‑focused pitch decks for your startup.',
//     description_ar: 'أدلة شاملة وقوالب لإعداد عروض استثمارية تركز على المستثمرين لشركتك الناشئة.',
//     tools: [
//       { slug: 'investor-pitch', name_en: 'Investor Pitch Generator', name_ar: 'مولِّد عرض المستثمر' },
//       { slug: 'saas-pitch', name_en: 'SaaS Pitch Deck Builder', name_ar: 'منشئ عرض SaaS' },
//       { slug: 'series-a-slides', name_en: 'Series A Slides Creator', name_ar: 'منشئ شرائح الجولة أ' },
//        { slug: 'investor-pitch', name_en: 'Investor Pitch Generator', name_ar: 'مولِّد عرض المستثمر' },
//       { slug: 'saas-pitch', name_en: 'SaaS Pitch Deck Builder', name_ar: 'منشئ عرض SaaS' },
//       { slug: 'series-a-slides', name_en: 'Series A Slides Creator', name_ar: 'منشئ شرائح الجولة أ' }, { slug: 'investor-pitch', name_en: 'Investor Pitch Generator', name_ar: 'مولِّد عرض المستثمر' },
//       { slug: 'saas-pitch', name_en: 'SaaS Pitch Deck Builder', name_ar: 'منشئ عرض SaaS' },
//       { slug: 'series-a-slides', name_en: 'Series A Slides Creator', name_ar: 'منشئ شرائح الجولة أ' },
//       // …add additional tools here
//     ],
//   },
//   {
//     slug: 'startup-pitch-decks',
//     title_en: 'Startup Pitch Decks',
//     title_ar: 'عروض المستثمرين للشركات الناشئة',
//     description_en: 'Comprehensive guides and templates to craft investor‑focused pitch decks for your startup.',
//     description_ar: 'أدلة شاملة وقوالب لإعداد عروض استثمارية تركز على المستثمرين لشركتك الناشئة.',
//     tools: [
//       { slug: 'investor-pitch', name_en: 'Investor Pitch Generator', name_ar: 'مولِّد عرض المستثمر' },
//       { slug: 'saas-pitch', name_en: 'SaaS Pitch Deck Builder', name_ar: 'منشئ عرض SaaS' },
//       { slug: 'series-a-slides', name_en: 'Series A Slides Creator', name_ar: 'منشئ شرائح الجولة أ' },
//        { slug: 'investor-pitch', name_en: 'Investor Pitch Generator', name_ar: 'مولِّد عرض المستثمر' },
//       { slug: 'saas-pitch', name_en: 'SaaS Pitch Deck Builder', name_ar: 'منشئ عرض SaaS' },
//       { slug: 'series-a-slides', name_en: 'Series A Slides Creator', name_ar: 'منشئ شرائح الجولة أ' }, { slug: 'investor-pitch', name_en: 'Investor Pitch Generator', name_ar: 'مولِّد عرض المستثمر' },
//       { slug: 'saas-pitch', name_en: 'SaaS Pitch Deck Builder', name_ar: 'منشئ عرض SaaS' },
//       { slug: 'series-a-slides', name_en: 'Series A Slides Creator', name_ar: 'منشئ شرائح الجولة أ' },
//       // …add additional tools here
//     ],
//   },
//   {
//     slug: 'teacher-toolkit',
//     title_en: 'Teacher Toolkit',
//     title_ar: 'عدة المعلم',
//     description_en: 'Engaging slide and curriculum generators built for educators and trainers.',
//     description_ar: 'مولدات شرائح وخطط دروس تفاعلية مصممة للمعلمين والمدربين.',
//     tools: [
//       { slug: 'lesson-plan-slides', name_en: 'Lesson Plan Slide Creator', name_ar: 'مولّد شرائح خطة الدرس' },
//       { slug: 'pdf-to-class-slides', name_en: 'PDF to Class Slides Converter', name_ar: 'محول PDF إلى شرائح صفية' },
//       { slug: 'word-to-training-deck', name_en: 'Word to Training Deck Maker', name_ar: 'منشئ شرائح التدريب من Word' },
//       { slug: 'lesson-plan-slides', name_en: 'Lesson Plan Slide Creator', name_ar: 'مولّد شرائح خطة الدرس' },
//       { slug: 'pdf-to-class-slides', name_en: 'PDF to Class Slides Converter', name_ar: 'محول PDF إلى شرائح صفية' },
//       { slug: 'word-to-training-deck', name_en: 'Word to Training Deck Maker', name_ar: 'منشئ شرائح التدريب من Word' },{ slug: 'lesson-plan-slides', name_en: 'Lesson Plan Slide Creator', name_ar: 'مولّد شرائح خطة الدرس' },
//       { slug: 'pdf-to-class-slides', name_en: 'PDF to Class Slides Converter', name_ar: 'محول PDF إلى شرائح صفية' },
//       { slug: 'word-to-training-deck', name_en: 'Word to Training Deck Maker', name_ar: 'منشئ شرائح التدريب من Word' },
//       // …etc.
//     ],
//   },
//   {
//     slug: 'sales-marketing',
//     title_en: 'Sales & Marketing',
//     title_ar: 'المبيعات والتسويق',
//     description_en: 'Slide templates and generators for sales demos, marketing funnels and product launches.',
//     description_ar: 'قوالب ومولدات شرائح لعروض المبيعات، وقمع التسويق، وإطلاق المنتجات.',
//     tools: [
//       { slug: 'product-launch', name_en: 'Product Launch Deck', name_ar: 'شرائح إطلاق المنتج' },
//       { slug: 'sales-funnel-slides', name_en: 'Sales Funnel Slides Generator', name_ar: 'مولّد شرائح قمع المبيعات' },
//       { slug: 'demo-presentation', name_en: 'Demo Presentation Maker', name_ar: 'منشئ عرض توضيحي' },
//       { slug: 'lesson-plan-slides', name_en: 'Lesson Plan Slide Creator', name_ar: 'مولّد شرائح خطة الدرس' },
//       { slug: 'pdf-to-class-slides', name_en: 'PDF to Class Slides Converter', name_ar: 'محول PDF إلى شرائح صفية' },
//       { slug: 'word-to-training-deck', name_en: 'Word to Training Deck Maker', name_ar: 'منشئ شرائح التدريب من Word' },{ slug: 'lesson-plan-slides', name_en: 'Lesson Plan Slide Creator', name_ar: 'مولّد شرائح خطة الدرس' },
//       { slug: 'pdf-to-class-slides', name_en: 'PDF to Class Slides Converter', name_ar: 'محول PDF إلى شرائح صفية' },
//       { slug: 'word-to-training-deck', name_en: 'Word to Training Deck Maker', name_ar: 'منشئ شرائح التدريب من Word' },{ slug: 'lesson-plan-slides', name_en: 'Lesson Plan Slide Creator', name_ar: 'مولّد شرائح خطة الدرس' },
//       { slug: 'pdf-to-class-slides', name_en: 'PDF to Class Slides Converter', name_ar: 'محول PDF إلى شرائح صفية' },
//       { slug: 'word-to-training-deck', name_en: 'Word to Training Deck Maker', name_ar: 'منشئ شرائح التدريب من Word' },
//       // …add more tools
//     ],
//   },
//   // …add more pillars here
// ];


// export const dataSource = {
//   getAllPillars: async (): Promise<string[]> => pillars.map((p) => p.slug),

//   findPillar: async (
//     slug: string,
//     locale: 'en' | 'ar'
//   ): Promise<LocalizedPillar | undefined> => {
//     const pillar = pillars.find((p) => p.slug === slug);
//     if (!pillar) return undefined;
//     return {
//       ...pillar,
//       title: locale === 'ar' ? pillar.title_ar : pillar.title_en,
//       description: locale === 'ar' ? pillar.description_ar : pillar.description_en,
//       tools: pillar.tools.map((tool) => ({
//         ...tool,
//         name: locale === 'ar' ? tool.name_ar : tool.name_en,
//       })),
//     };
//   },
// };

// apps/nextjs/src/config/price/price-faq-data.ts
interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export const priceFaqDataMap: Record<string, FAQItem[]> = {
  ar: [
    {
      id: "item-1",
      question: "ما تكلفة الخطة المجانية؟",
      answer:
        "خطتنا المجانية مجانية تمامًا، دون أي رسوم شهرية أو سنوية. إنها طريقة رائعة للبدء واستكشاف ميزاتنا الأساسية.",
    },
    {
      id: "item-2",
      question: "كم تبلغ تكلفة خطة المحترفين الشهرية؟",
      answer:
        "تبلغ تكلفة خطة المحترفين الشهرية 30 دولارًا شهريًا. توفر هذه الخطة الوصول إلى ميزاتنا الأساسية ويتم احتسابها شهريًا.",
    },
    {
      id: "item-3",
      question: "ما سعر خطة الأعمال الشهرية؟",
      answer:
        "خطة الأعمال الشهرية متاحة بسعر 60 دولارًا شهريًا. تقدم هذه الخطة ميزات متقدمة ويتم احتسابها شهريًا لمرونة إضافية.",
    },
    {
      id: "item-4",
      question: "هل تقدمون أي خطط اشتراك سنوية؟",
      answer:
        "نعم، نقدم خطط اشتراك سنوية لمزيد من التوفير. خطة المحترفين السنوية تبلغ 288 دولارًا سنويًا، وخطة الأعمال السنوية تبلغ 600 دولار سنويًا.",
    },
    {
      id: "item-5",
      question: "هل هناك فترة تجريبية للخطط المدفوعة؟",
      answer:
        "نحن نقدم فترة تجريبية مجانية لمدة 14 يومًا لكل من خطة المحترفين الشهرية والسنوية. إنها طريقة رائعة لتجربة جميع الميزات قبل الالتزام بالاشتراك المدفوع.",
    },
  ],

  en: [
    {
      id: "item-1",
      question: "What is the cost of the free plan?",
      answer:
        "Our free plan is completely free, with no monthly or annual charges. It's a great way to get started and explore our basic features.",
    },
    {
      id: "item-2",
      question: "How much does the Pro Monthly plan cost?",
      answer:
        "The Pro Monthly plan is priced at $30 per month. It provides access to our core features and is billed on a monthly basis.",
    },
    {
      id: "item-3",
      question: "What is the price of the Business Monthly plan?",
      answer:
        "The Business Monthly plan is available for $60 per month. It offers advanced features and is billed on a monthly basis for added flexibility.",
    },
    {
      id: "item-4",
      question: "Do you offer any annual subscription plans?",
      answer:
        "Yes, we offer annual subscription plans for even more savings. The Pro Annual plan is $288 per year, and the Business Annual plan is $600 per year.",
    },
    {
      id: "item-5",
      question: "Is there a trial period for the paid plans?",
      answer:
        "We offer a 14-day free trial for both the Pro Monthly and Pro Annual plans. It's a great way to experience all the features before committing to a paid subscription.",
    },
  ],
  };

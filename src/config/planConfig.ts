export interface Plan {
  id: string;
  stripePriceId: string;
  title: string;
  price: string;
  frequency: string;
  features: string[];
  limitations: string[];
  tier: "FREE" | "STANDARD" | "PREMIUM"; // Added tier for consistency
}

export const planHierarchy: string[] = [
  "cm4kcbd6t00007ndb3r9dydrc", // Free
  "cm4kcbe5u00017ndbe7dphuoo", // Standard
  "cm4kcbeop00027ndbbg8k20me", // Premium
];

export const pricingPlans: Plan[] = [
  {
    id: "cm4kcbd6t00007ndb3r9dydrc",
    stripePriceId: "price_1QVtmXAlDgxzsK9aFXzqJmSy",
    title: "الخطة الأساسية",
    price: "0$",
    frequency: "",
    features: [
      "رفع 10 مستندات شهرياً",
      "معالجة OCR الأساسية",
      "دعم عبر البريد الإلكتروني",
    ],
    limitations: [
      "لا توجد تحليلات متقدمة",
      "سعة تخزين محدودة",
    ],
    tier: "FREE",
  },
  {
    id: "cm4kcbe5u00017ndbe7dphuoo",
    stripePriceId: "price_1QVtn7AlDgxzsK9aupXkenzq",
    title: "خطة المعيارية",
    price: "10$",
    frequency: "3 أشهر",
    features: [
      "رفع 100 مستند شهرياً",
      "معالجة OCR متقدمة",
      "دعم عبر الدردشة",
    ],
    limitations: [
      "تحليلات محدودة",
      "سعة تخزين متوسطة",
    ],
    tier: "STANDARD",
  },
  {
    id: "cm4kcbeop00027ndbbg8k20me",
    stripePriceId: "price_1QVtnTAlDgxzsK9aWNXCKGqT",
    title: "خطة المحترفين",
    price: "25$",
    frequency: "6 أشهر",
    features: [
      "رفع مستندات غير محدود",
      "معالجة OCR المتقدمة",
      "دعم الأولوية",
      "الوصول إلى التحليلات الشاملة",
    ],
    limitations: [],
    tier: "PREMIUM",
  },
];



// // src/config/planConfig.ts

// export interface Plan {
//   id: string;
//   stripePriceId: string;
//   title: string;
//   price: string;
//   frequency: string;
//   features: string[];
//   limitations: string[];
// }

// export const planHierarchy: string[] = [
//   "cm4kcbd6t00007ndb3r9dydrc", // Free
//   "cm4kcbe5u00017ndbe7dphuoo", // Standard
//   "cm4kcbeop00027ndbbg8k20me", // Premium
// ];

// export const pricingPlans: Plan[] = [
//   {
//     id: "cm4kcbd6t00007ndb3r9dydrc", // Free plan ID
//     stripePriceId: "price_1QVtmXAlDgxzsK9aFXzqJmSy", // Replace with your actual Free plan Stripe Price ID
//     title: "الخطة الأساسية",
//     price: "0$",
//     frequency: "شهرياً",
//     features: [
//       "رفع 10 مستندات شهرياً",
//       "معالجة OCR الأساسية",
//       "دعم عبر البريد الإلكتروني",
//     ],
//     limitations: [
//       "لا توجد تحليلات متقدمة",
//       "سعة تخزين محدودة",
//     ],
//   },
//   {
//     id: "cm4kcbe5u00017ndbe7dphuoo", // Standard plan ID
//     stripePriceId: "price_1QVtn7AlDgxzsK9aupXkenzq", // Replace with your actual Standard plan Stripe Price ID
//     title: "خطة المعيارية",
//     price: "10$",
//     frequency: "شهرياً",
//     features: [
//       "رفع 100 مستند شهرياً",
//       "معالجة OCR متقدمة",
//       "دعم عبر الدردشة",
//     ],
//     limitations: [
//       "تحليلات محدودة",
//       "سعة تخزين متوسطة",
//     ],
//   },
//   {
//     id: "cm4kcbeop00027ndbbg8k20me", // Premium plan ID
//     stripePriceId: "price_1QVtnTAlDgxzsK9aWNXCKGqT", // Replace with your actual Premium plan Stripe Price ID
//     title: "خطة المحترفين",
//     price: "25$",
//     frequency: "شهرياً",
//     features: [
//       "رفع مستندات غير محدود",
//       "معالجة OCR المتقدمة",
//       "دعم الأولوية",
//       "الوصول إلى التحليلات الشاملة",
//     ],
//     limitations: [],
//   },
// ];


// // src/config/planConfig.ts

// export interface Plan {
//     id: string;
//     stripePriceId: string;
//     title: string;
//     price: string;
//     frequency: string;
//     features: string[];
//     limitations: string[];
//   }
  
//   export const planHierarchy: string[] = [
//     "cm4kcbd6t00007ndb3r9dydrc", // Free
//     "cm4kcbe5u00017ndbe7dphuoo", // Standard
//     "cm4kcbeop00027ndbbg8k20me", // Premium
//   ];
  
//   export const pricingPlans: Plan[] = [
//     {
//       id: "cm4kcbd6t00007ndb3r9dydrc", // Free plan ID
//       stripePriceId: "price_1QVtmXAlDgxzsK9aFXzqJmSy", // Replace with your actual Free plan Stripe Price ID
//       title: "الخطة الأساسية",
//       price: "0$",
//       frequency: "شهرياً",
//       features: [
//         "رفع 10 مستندات شهرياً",
//         "معالجة OCR الأساسية",
//         "دعم عبر البريد الإلكتروني",
//       ],
//       limitations: [
//         "لا توجد تحليلات متقدمة",
//         "سعة تخزين محدودة",
//       ],
//     },
//     {
//       id: "cm4kcbe5u00017ndbe7dphuoo", // Standard plan ID
//       stripePriceId: "price_1QVtn7AlDgxzsK9aupXkenzq", // Replace with your actual Standard plan Stripe Price ID
//       title: "خطة المعيارية",
//       price: "10$",
//       frequency: "شهرياً",
//       features: [
//         "رفع 100 مستند شهرياً",
//         "معالجة OCR متقدمة",
//         "دعم عبر الدردشة",
//       ],
//       limitations: [
//         "تحليلات محدودة",
//         "سعة تخزين متوسطة",
//       ],
//     },
//     {
//       id: "cm4kcbeop00027ndbbg8k20me", // Premium plan ID
//       stripePriceId: "price_1QVtnTAlDgxzsK9aWNXCKGqT", // Replace with your actual Premium plan Stripe Price ID
//       title: "خطة المحترفين",
//       price: "25$",
//       frequency: "شهرياً",
//       features: [
//         "رفع مستندات غير محدود",
//         "معالجة OCR المتقدمة",
//         "دعم الأولوية",
//         "الوصول إلى التحليلات الشاملة",
//       ],
//       limitations: [],
//     },
//   ];
  

// // src/config/planConfig.ts

// export interface Plan {
//     id: string;
//     stripePriceId: string;
//     title: string;
//     price: string;
//     frequency: string;
//     features: string[];
//     limitations: string[];
//   }
  
//   export const planHierarchy: string[] = [
//     "price_1QVtmXAlDgxzsK9aFXzqJmSy", // Free
//     "price_1QVtn7AlDgxzsK9aupXkenzq", // Standard
//     "price_1QVtnTAlDgxzsK9aWNXCKGqT", // Premium
//   ];
  
//   export const pricingPlans: Plan[] = [
//     {
//       id: "cm4kcbd6t00007ndb3r9dydrc", // Free plan ID
//       stripePriceId: "price_1QVtmXAlDgxzsK9aFXzqJmSy", // Replace with your actual Free plan Stripe Price ID
//       title: "الخطة الأساسية",
//       price: "0$",
//       frequency: "شهرياً",
//       features: [
//         "رفع 10 مستندات شهرياً",
//         "معالجة OCR الأساسية",
//         "دعم عبر البريد الإلكتروني",
//       ],
//       limitations: [
//         "لا توجد تحليلات متقدمة",
//         "سعة تخزين محدودة",
//       ],
//     },
//     {
//       id: "cm4kcbe5u00017ndbe7dphuoo", // Standard plan ID
//       stripePriceId: "price_1QVtn7AlDgxzsK9aupXkenzq", // Replace with your actual Standard plan Stripe Price ID
//       title: "الخطة المعيارية",
//       price: "10$",
//       frequency: "شهرياً",
//       features: [
//         "رفع 100 مستند شهرياً",
//         "معالجة OCR متقدمة",
//         "دعم عبر الدردشة",
//       ],
//       limitations: [
//         "تحليلات محدودة",
//         "سعة تخزين متوسطة",
//       ],
//     },
//     {
//       id: "cm4kcbeop00027ndbbg8k20me", // Premium plan ID
//       stripePriceId: "price_1QVtnTAlDgxzsK9aWNXCKGqT", // Replace with your actual Premium plan Stripe Price ID
//       title: "الخطة المحترفين",
//       price: "25$",
//       frequency: "شهرياً",
//       features: [
//         "رفع مستندات غير محدود",
//         "معالجة OCR المتقدمة",
//         "دعم الأولوية",
//         "الوصول إلى التحليلات الشاملة",
//       ],
//       limitations: [],
//     },
//   ];
  

// // src/config/planConfig.ts

// export interface Plan {
//     id: string;
//     title: string;
//     price: string;
//     frequency: string;
//     features: string[];
//     limitations: string[];
//   }
  
//   export const planHierarchy: string[] = [
//     "cm4kcbd6t00007ndb3r9dydrc", // Free
//     "cm4kcbe5u00017ndbe7dphuoo", // Standard
//     "cm4kcbeop00027ndbbg8k20me", // Premium
//   ];
  
//   export const pricingPlans: Plan[] = [
//     {
//       id: "cm4kcbd6t00007ndb3r9dydrc", // Free plan ID
//       title: "الخطة الأساسية",
//       price: "0$",
//       frequency: "شهرياً",
//       features: [
//         "رفع 10 مستندات شهرياً",
//         "معالجة OCR الأساسية",
//         "دعم عبر البريد الإلكتروني",
//       ],
//       limitations: [
//         "لا توجد تحليلات متقدمة",
//         "سعة تخزين محدودة",
//       ],
//     },
//     {
//       id: "cm4kcbe5u00017ndbe7dphuoo", // Standard plan ID
//       title: "خطة المعيارية",
//       price: "10$",
//       frequency: "شهرياً",
//       features: [
//         "رفع 100 مستند شهرياً",
//         "معالجة OCR متقدمة",
//         "دعم عبر الدردشة",
//       ],
//       limitations: [
//         "تحليلات محدودة",
//         "سعة تخزين متوسطة",
//       ],
//     },
//     {
//       id: "cm4kcbeop00027ndbbg8k20me", // Premium plan ID
//       title: "خطة المحترفين",
//       price: "25$",
//       frequency: "شهرياً",
//       features: [
//         "رفع مستندات غير محدود",
//         "معالجة OCR المتقدمة",
//         "دعم الأولوية",
//         "الوصول إلى التحليلات الشاملة",
//       ],
//       limitations: [],
//     },
//   ];
  

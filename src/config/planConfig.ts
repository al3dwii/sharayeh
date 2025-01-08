// src/config/planConfig.ts

export interface PricingPlan {
  id: string;
  stripePriceId: string;
  title: string;
  price: string;
  frequency: string;
  features: string[];
  limitations: string[];
  tier: "FREE" | "STANDARD" | "PREMIUM" | "SUPER";
}

export const planHierarchy: string[] = [
  "cm4kcbd6t00007ndb3r9dydrc", // Free
  "cm4kcbe5u00017ndbe7dphuoo", // Standard
  "cm4kcbeop00027ndbbg8k20me", // Premium
  "cm4kcbeop00027ndbbg8k20mesuper", // Super
];

// Mapping of package IDs to Stripe Price IDs via environment variables
export const stripePriceIds: Record<string, string> = {
  "cm4kcbd6t00007ndb3r9dydrc": process.env.STRIPE_PRICE_ID_FREE!,
  "cm4kcbe5u00017ndbe7dphuoo": process.env.STRIPE_PRICE_ID_STANDARD!,
  "cm4kcbeop00027ndbbg8k20me": process.env.STRIPE_PRICE_ID_PREMIUM!,
  "cm4kcbeop00027ndbbg8k20mesuper": process.env.STRIPE_PRICE_ID_SUPER!,
};

export const pricingPlans: PricingPlan[] = [
  {
    id: "cm4kcbd6t00007ndb3r9dydrc",
    stripePriceId: stripePriceIds["cm4kcbd6t00007ndb3r9dydrc"],
    title: "الباقة التجريبية",
    price: "0$",
    frequency: "",
    features: [
      "انشاء بوربوينت من 10 شرائح ",
      "اضافة الحركات",
    ],
    limitations: [
      "لا توجد تحليلات متقدمة",
      "سعة تخزين محدودة",
    ],
    tier: "FREE",
  },
  {
    id: "cm4kcbe5u00017ndbe7dphuoo",
    stripePriceId: stripePriceIds["cm4kcbe5u00017ndbe7dphuoo"],
    title: "الباقة الأساسية",
    price: "10$",
    frequency: " ",
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
    stripePriceId: stripePriceIds["cm4kcbeop00027ndbbg8k20me"],
    title: "الباقة المميزة",
    price: "25$",
    frequency: " ",
    features: [
      "رفع مستندات غير محدود",
      "معالجة OCR المتقدمة",
      "دعم الأولوية",
      "الوصول إلى التحليلات الشاملة",
    ],
    limitations: [
      "تحليلات محدودة",
      "سعة تخزين متوسطة",
    ],
    tier: "PREMIUM",
  },
  // Add Super tier if necessary
];


// export interface Plan {
//   id: string;
//   stripePriceId: string;
//   title: string;
//   price: string;
//   frequency: string;
//   features: string[];
//   limitations: string[];
//   tier: "FREE" | "STANDARD" | "PREMIUM" | "SUPER";

// }

// export const planHierarchy: string[] = [
//   "cm4kcbd6t00007ndb3r9dydrc", // Free
//   "cm4kcbe5u00017ndbe7dphuoo", // Standard
//   "cm4kcbeop00027ndbbg8k20me", // Premium
//   "cm4kcbeop00027ndbbg8k20mesuper", // Super
// ];

// export const pricingPlans: Plan[] = [
//   {
//     id: "cm4kcbd6t00007ndb3r9dydrc",
//     stripePriceId: "price_1QVtmXAlDgxzsK9aFXzqJmSy",
//     title: "الباقة التجريبية",
//     price: "0$",
//     frequency: "",
//     features: [
//       "انشاء بوربوينت من 10 شرائح ",
//       "  اضافة الحركات",
//     ],
//     limitations: [
//       "لا توجد تحليلات متقدمة",
//       "سعة تخزين محدودة",
//     ],
//     tier: "FREE",
//   },
//   {
//     id: "cm4kcbe5u00017ndbe7dphuoo",
//     stripePriceId: "price_1Qem6ZAlDgxzsK9aDTKSjO2M",
//     title: "الباقة الأساسية ",
//     price: "10$",
//     frequency: " ",
//     features: [
//       "رفع 100 مستند شهرياً",
//       "معالجة OCR متقدمة",
//       "دعم عبر الدردشة",
//     ],
//     limitations: [
//       "تحليلات محدودة",
//       "سعة تخزين متوسطة",
//     ],
//     tier: "STANDARD",
//   },
//   {
//     id: "cm4kcbeop00027ndbbg8k20me",
//     stripePriceId: "price_1QemAMAlDgxzsK9a4ErFp0Zs",
//     title: "الباقة المميزة",
//     price: "25$",
//     frequency: " ",
//     features: [
//       "رفع مستندات غير محدود",
//       "معالجة OCR المتقدمة",
//       "دعم الأولوية",
//       "الوصول إلى التحليلات الشاملة",
//     ],
//     limitations: [
//       "تحليلات محدودة",
//       "سعة تخزين متوسطة",
//     ],
//     tier: "PREMIUM",
//   },


  // {
  //   id: "cm4kcbeop00027ndbbg8k20mesuper",
  //   stripePriceId: "price_1Qc69GAlDgxzsK9aKuQvYr9s",
  //   title: "خطة الشركات",
  //   price: "55$",
  //   frequency: "6 أشهر",
  //   features: [
  //     "رفع مستندات غير محدود",
  //     "معالجة OCR المتقدمة",
  //     "دعم الأولوية",
  //     "الوصول إلى التحليلات الشاملة",
  //   ],
  //   limitations: [],
  //   tier: "SUPER",
  // },




// export interface Plan {
//   id: string;
//   stripePriceId: string;
//   title: string;
//   price: string;
//   frequency: string;
//   features: string[];
//   limitations: string[];
//   tier: "FREE" | "STANDARD" | "PREMIUM"; // Added tier for consistency
// }

// export const planHierarchy: string[] = [
//   "cm4kcbd6t00007ndb3r9dydrc", // Free
//   "cm4kcbe5u00017ndbe7dphuoo", // Standard
//   "cm4kcbeop00027ndbbg8k20me", // Premium
// ];

// export const pricingPlans: Plan[] = [
//   {
//     id: "cm4kcbd6t00007ndb3r9dydrc",
//     stripePriceId: "price_1QVtmXAlDgxzsK9aFXzqJmSy",
//     title: "الخطة الأساسية",
//     price: "0$",
//     frequency: "",
//     features: [
//       "رفع 10 مستندات شهرياً",
//       "معالجة OCR الأساسية",
//       "دعم عبر البريد الإلكتروني",
//     ],
//     limitations: [
//       "لا توجد تحليلات متقدمة",
//       "سعة تخزين محدودة",
//     ],
//     tier: "FREE",
//   },
//   {
//     id: "cm4kcbe5u00017ndbe7dphuoo",
//     stripePriceId: "price_1QVtn7AlDgxzsK9aupXkenzq",
//     title: "خطة المعيارية",
//     price: "10$",
//     frequency: "3 أشهر",
//     features: [
//       "رفع 100 مستند شهرياً",
//       "معالجة OCR متقدمة",
//       "دعم عبر الدردشة",
//     ],
//     limitations: [
//       "تحليلات محدودة",
//       "سعة تخزين متوسطة",
//     ],
//     tier: "STANDARD",
//   },
//   {
//     id: "cm4kcbeop00027ndbbg8k20me",
//     stripePriceId: "price_1QVtnTAlDgxzsK9aWNXCKGqT",
//     title: "خطة المحترفين",
//     price: "25$",
//     frequency: "6 أشهر",
//     features: [
//       "رفع مستندات غير محدود",
//       "معالجة OCR المتقدمة",
//       "دعم الأولوية",
//       "الوصول إلى التحليلات الشاملة",
//     ],
//     limitations: [],
//     tier: "PREMIUM",
//   },
// ];



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
  

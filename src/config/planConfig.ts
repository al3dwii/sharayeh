// src/config/planConfig.ts

export interface Plan {
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

export const pricingPlans: Plan[] = [
  // {
  //   id: "cm4kcbd6t00007ndb3r9dydrc",
  //   stripePriceId: stripePriceIds["cm4kcbd6t00007ndb3r9dydrc"],
  //   title: "الباقة التجريبية",
  //   price: "0$",
  //   frequency: "",
  //   features: [
  //     "انشاء 2 بوربوينت من 10 شرائح ",
  //   ],
  //   limitations: [
  //     "اضافة الحركات ",
  //     "من ملف وورد  ",
  //      "من ملف بي دي ف  "
  //   ],
  //   tier: "FREE",
  // },
  {
    id: "cm4kcbe5u00017ndbe7dphuoo",
    stripePriceId: stripePriceIds["cm4kcbe5u00017ndbe7dphuoo"],
    title: "الباقة الأساسية",
    price: "5$",
    frequency: " ",
    features: [
      "انشاء 4 بوربوينت من 15 شريحة ",
    ],
    limitations: [
      "اضافة الحركات ",
      "من ملف وورد  ",
       "من ملف بي دي ف  "
    ],
    tier: "STANDARD",
  },
  {
    id: "cm4kcbeop00027ndbbg8k20me",
    stripePriceId: stripePriceIds["cm4kcbeop00027ndbbg8k20me"],
    title: "الباقة المميزة",
    price: "10$",
    frequency: " ",
    features: [
      "انشاء 8 بوربوينت من 25 شريحة   ",
      "اضافة الحركات   ",
      "من ملف وورد  ",
      "من ملف بي دي اف (قريباً)    ",
    ],
    limitations: [
     
    ],
    tier: "PREMIUM",
  },
  // Add Super tier if necessary
];

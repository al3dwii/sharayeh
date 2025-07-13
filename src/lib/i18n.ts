//-----------------------------------------------------
// Locale helper (Day 1)
//-----------------------------------------------------

/** List of supported locales in canonical order. */
export const availableLocales = ["ar", "en"] as const;

/** Derived union type "ar" | "en" */
export type Locale = (typeof availableLocales)[number];

// lib/tools.ts
// -----------------------------------------------------------------------------
//  Utility helpers that flatten all pillars into one list of tools
//  and expose handy lookup functions for the landing‑page router.
//
//  • ConverterRow = shape expected by LandingTemplate, FeatureSection, FAQs etc.
//  • getAllTools() returns the complete list.
//  • getToolBySlug() finds a row by either the English *or* Arabic slug.
// -----------------------------------------------------------------------------

import { pillars } from "./data";   // ← the master list you pasted earlier

/* -------------------------------------------------------------------------- */
/*  Public type                                                               */
/* -------------------------------------------------------------------------- */

export type ConverterRow = {
  slug_en: string;        // URL path for English   (/en/tools/word-to-powerpoint)
  slug_ar: string;        // URL path for Arabic    (/ar/tools/تحويل-وورد-بوربوينت)
  label_en: string;       // “Convert Word to PowerPoint”
  label_ar: string;       // “تحويل وورد إلى بوربوينت”
  dir: string;            // e.g. “DOCX→PPT”  (can be refined per tool later)
  icon?: string;          // optional: SVG icon filename
  description_en?: string;
  description_ar?: string;
};

/* -------------------------------------------------------------------------- */
/*  Build flattened array one time at module init                             */
/* -------------------------------------------------------------------------- */

const allTools: ConverterRow[] = pillars.flatMap((pillar) =>
  pillar.tools.map((t) => {
    /* ---------- Arabic slugifier ---------- */
    const slugAr = t.name_ar
      .trim()
      .replace(/\s+/g, "-")           // spaces → dashes
      .replace(/[^\u0600-\u06FF\-]/g, "") // keep Arabic letters & dash
      .toLowerCase();

    /* ---------- Guess the direction string ----------
       If you have real dir data, replace this heuristic.
       Otherwise we map common patterns: Word, PDF, Excel, Google Docs etc.    */
    const extMap: Record<string, string> = {
      word: "DOCX",
      pdf: "PDF",
      excel: "XLSX",
      notion: "DOC",
      google: "DOC",
    };

    // crude detection from English label (fine for SEO tags, not for logic)
    const match = t.name_en.match(/(Word|PDF|Excel|Google|Notion)/i);
    const from = match ? extMap[match[1].toLowerCase()] ?? "DOC" : "DOC";
    const to   = t.name_en.match(/PowerPoint|PPT|Slides/i) ? "PPT" : "???";

    return {
      slug_en: t.slug,
      slug_ar: slugAr,
      label_en: t.name_en,
      label_ar: t.name_ar,
      dir: `${from}→${to}`,
    };
  })
);

/* -------------------------------------------------------------------------- */
/*  Public helpers                                                            */
/* -------------------------------------------------------------------------- */

/** Return the entire flattened list (useful for generateStaticParams) */
export const getAllTools = async (): Promise<ConverterRow[]> => allTools;

/**
 * Find a tool row by slug.
 * Accepts either the English slug (`word-to-powerpoint`)
 * or the Arabic slug (`تحويل-وورد-بوربوينت`).
 */
export const getToolBySlug = async (
  slug: string
): Promise<ConverterRow | undefined> =>
  allTools.find((row) => row.slug_en === slug || row.slug_ar === slug);

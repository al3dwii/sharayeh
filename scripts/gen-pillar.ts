#!/usr/bin/env ts-node
/* ------------------------------------------------------------------ *
   Auto‑generates one pillar MDX file per converter row.
   Each file lives at   content/pillar/<slug_en>.mdx
   ------------------------------------------------------------------ */

import fs from "node:fs";
import path from "node:path";
import { getConverters } from "../src/lib/routes";

/* ---------- Load pillar body template ---------- */

const TEMPLATE_PATH = path.join("templates", "pillar.mdx");
const templateBody = fs.readFileSync(TEMPLATE_PATH, "utf8");

/* ---------- Ensure output dir exists ---------- */

const PILLAR_DIR = path.join("content", "pillar");
fs.mkdirSync(PILLAR_DIR, { recursive: true });

/* ---------- Generate a page for each converter ---------- */

getConverters().forEach((c) => {
  const frontmatter = [
    "---",
    `title: "${c.label_ar}"`,                 // display title in Arabic
    "related:",
    `  - slug: "${c.slug_en}"`,
    '    cta: "جرّب المحول الآن"',           // CTA in Arabic
    "---",
    "",
  ].join("\n");

  const outfile = path.join(PILLAR_DIR, `${c.slug_en}.mdx`);
  fs.writeFileSync(outfile, frontmatter + templateBody);

  console.log(`📝  wrote ${outfile}`);
});


// import fs from 'fs';
// import { getRoutes } from '../src/lib/routes';

// const tpl = fs.readFileSync('templates/pillar.mdx','utf8');

// getRoutes().forEach(r => {
//   const content = `---\ntitle: "${r.label_ar}"\nrelated:\n  - slug: "${r.slug_en}"\n    cta: "جرّب المحول الآن"\n---\n` + tpl;
//   const dir = `content/pillar/${r.slug_en}`;
//   fs.mkdirSync('content/pillar', { recursive: true });
//   fs.writeFileSync(`content/pillar/${r.slug_en}.mdx`, content);
// });

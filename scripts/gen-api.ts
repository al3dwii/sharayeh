#!/usr/bin/env ts-node
/* ------------------------------------------------------------------ *
   Regenerates `openapi.src.yml` by looping over every converter row
   and hydrating the Handlebars‑style stub at templates/openapi-path.hbs.
   ------------------------------------------------------------------ */

import fs from "node:fs";
import path from "node:path";
import { getConverters } from "../src/lib/routes";

/* ---------- Load template ---------- */

const TEMPLATE_PATH = path.join("templates", "openapi-path.hbs");
const template = fs.readFileSync(TEMPLATE_PATH, "utf8");

/* ---------- Build YAML path blocks ---------- */

const blocks = getConverters().map((c) => {
  /* c.dir looks like "DOCX→PPT" */
  const [from, to] = c.dir.split("→"); // Unicode arrow
  return template
    .replace(/__SLUG__/g, c.slug_en)                // e.g. word-to-powerpoint
    .replace(/__FROM__/g, from.toLowerCase())       // docx
    .replace(/__TO__/g, to.toLowerCase())           // ppt
    .replace(/__SUMMARY__/g, `${from} → ${to}`);    // optional placeholder
});

/* ---------- Write final spec ---------- */

const outPath = "openapi.src.yml";
fs.writeFileSync(outPath, `paths:\n${blocks.join("\n")}`);
console.log(`✅  Wrote ${outPath} with ${blocks.length} paths`);


// import fs from 'fs';
// import { getRoutes } from '../src/lib/routes';

// const tpl = fs.readFileSync('templates/openapi-path.hbs','utf8');
// const paths = getRoutes().map(r =>
//   tpl.replace(/__FROM__/g, r.dir.split('→')[0])
//      .replace(/__TO__/g, r.dir.split('→')[1])
// );
// fs.writeFileSync('openapi.src.yml', `paths:\n${paths.join('\n')}` );

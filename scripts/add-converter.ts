#!/usr/bin/env ts-node
import fs from 'node:fs';
import path from 'node:path';

const [slug, arTitle, enTitle] = process.argv.slice(2);
if (!slug || !arTitle || !enTitle) {
  console.error('Usage: pnpm add:converter slug "AR title" "EN title"');
  process.exit(1);
}

const csv = path.join('content', 'conversions.csv');
fs.appendFileSync(csv, `\n${slug},${encodeURI(arTitle)},DOCX→PPT,${enTitle},${arTitle},0,,PT30S,${slug}`);
const jsonPath = path.join('content', 'conversion-extra.json');
const extra = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
extra[slug] = { ar: ['خطوة ١', 'خطوة ٢', 'خطوة ٣'], en: ['Step 1', 'Step 2', 'Step 3'] };
fs.writeFileSync(jsonPath, JSON.stringify(extra, null, 2));
console.log(`✅ Added ${slug}. Now commit & deploy.`);

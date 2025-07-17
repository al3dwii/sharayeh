#!/usr/bin/env ts-node
import fs from "node:fs";
import path from "node:path";

// slug  AR‑title  EN‑title  DIR (e.g. PPT→MP4)
const [slug, arTitle, enTitle, dir] = process.argv.slice(2);
if (!dir)
  throw new Error('Usage: pnpm add:converter slug "AR" "EN" "PPT→MP4"');

const csv = path.join("content", "conversions.csv");
fs.appendFileSync(
  csv,
  `\n${slug},${encodeURI(arTitle)},${dir},${enTitle},${arTitle},0,,PT30S,${slug}`
);

const json = path.join("content", "conversion-extra.json");
const extra = JSON.parse(fs.readFileSync(json, "utf8"));
extra[slug] = {
  ar: ["ارفع ملفك", "اضغط «حوّل»", "نزّل النتيجة"],
  en: ["Upload file", "Click Convert", "Download result"]
};
fs.writeFileSync(json, JSON.stringify(extra, null, 2));

console.log(`✅ Added ${slug}`);

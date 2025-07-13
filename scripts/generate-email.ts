import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';
const tmpl = readFileSync('templates/email-ar.hbs','utf8');
const rows = parse(readFileSync('content/outreach.csv'), { columns: true });
rows.forEach(r => {
  const body = tmpl.replace(/__NAME__/g, r.name).replace(/__URL__/g, `https://sharayeh.com/ar/${r.slug_en}`);
  console.log(`\n---- ${r.email} ----\n${body}`);
});

import fs from 'fs';
import { getRoutes } from '../src/lib/routes';

const tpl = fs.readFileSync('templates/pillar.mdx','utf8');

getRoutes().forEach(r => {
  const content = `---\ntitle: "${r.label_ar}"\nrelated:\n  - slug: "${r.slug_en}"\n    cta: "جرّب المحول الآن"\n---\n` + tpl;
  const dir = `content/pillar/${r.slug_en}`;
  fs.mkdirSync('content/pillar', { recursive: true });
  fs.writeFileSync(`content/pillar/${r.slug_en}.mdx`, content);
});

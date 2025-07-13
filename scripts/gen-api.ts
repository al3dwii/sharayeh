import fs from 'fs';
import { getRoutes } from '../src/lib/routes';

const tpl = fs.readFileSync('templates/openapi-path.hbs','utf8');
const paths = getRoutes().map(r =>
  tpl.replace(/__FROM__/g, r.dir.split('→')[0])
     .replace(/__TO__/g, r.dir.split('→')[1])
);
fs.writeFileSync('openapi.src.yml', `paths:\n${paths.join('\n')}` );

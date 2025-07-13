const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

const csv = fs.readFileSync('./content/conversions.csv', 'utf8');
const rows = parse(csv, { columns: true, skip_empty_lines: true });

module.exports = plop => {
  plop.setHelper('Camel', txt =>
    txt.replace(/[^A-Za-z0-9]/g, ' ')
       .split(' ') .map(w => w.charAt(0).toUpperCase() + w.slice(1)) .join('')
  );

  rows.forEach(r => {
    plop.setGenerator(r.slug_en, {
      description: `Scaffold route for ${r.dir}`,
      prompts: [],
      actions: [
        {
          type: 'add',
          path: 'src/app/(site)/[locale]/' + r.slug_en + '/page.tsx',
          templateFile: 'templates/page.hbs',
          force: true,
        },
        {
          type: 'add',
          path: 'src/components/seo/StructuredData/' + plop.getHelper('Camel')(r.slug_en) + '.tsx',
          templateFile: 'templates/howto-component.hbs',
          force: true,
        },
      ],
    });
  });
};

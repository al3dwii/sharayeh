// Map extensions to the label you want to display.
// For English we usually keep the upper‑case extension itself.
// For Arabic you can keep the Latin extension or replace it with
// a fully‑written Arabic word – your choice.
const EXT_LABELS_EN: Record<string, string> = {
  DOCX: 'DOCX',
  DOC:  'DOC',
  PDF:  'PDF',
  PPT:  'PPT',
  PPTX: 'PPT',
  JPG:  'JPG',
  PNG:  'PNG',
  // add more …
};

const EXT_LABELS_AR: Record<string, string> = {
  DOCX: 'DOCX',
  DOC:  'DOC',
  PDF:  'PDF',
  PPT:  'PPT',
  PPTX: 'PPT',
  JPG:  'JPG',
  PNG:  'PNG',
};

export function dirReadable(dir: string, locale: 'en' | 'ar'): string {
  const [from, to] = dir.split('→').map((x) => x.trim().toUpperCase());

  if (locale === 'ar') {
    return `${EXT_LABELS_AR[from] ?? from} إلى ${EXT_LABELS_AR[to] ?? to}`;
  }
  // default = English
  return `${EXT_LABELS_EN[from] ?? from} to ${EXT_LABELS_EN[to] ?? to}`;
}

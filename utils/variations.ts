// utils/variations.ts
export function getArVariations(label: string, dir: string): string[] {
  const [fromExt, toExt] = dir.split('→');
  // Remove "تحويل " prefix for reuse
  const base = label.replace(/^تحويل\s+/, '');

  return [
    `${label} بالذكاء الاصطناعي`,
    `${label} مجاناً`,
    `${label} بدون برامج`,
    `${label} اون لاين`,
    `i love ${toExt} ${label}`,   // e.g. "i love PDF تحويل ملف Word"
    `${fromExt} إلى ${toExt} ${base} 2010`, // year variation
  ];
}

export function getEnVariations(label: string, dir: string): string[] {
  const [fromExt, toExt] = dir.split('→');
  return [
    `${label} with AI`,
    `${label} free online`,
    `${label} without software`,
    `${label} converter 2010`,
    `${fromExt} to ${toExt} converter free`,
  ];
}

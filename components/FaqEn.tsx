// src/components/landing/FaqEn.tsx
import type { ConverterRow } from "@/lib/tools";

/* Optional: export the raw data if you want Structured‑data JSON‑LD later */
export const FAQ_EN = (row: ConverterRow) => [
  {
    q: `Is there a file‑size limit for ${row.label_en}?`,
    a: "Yes. Free users can convert files up to 25 MB. Pro subscribers get 500 MB."
  },
  {
    q: "Will my layout change?",
    a: "No. We preserve fonts, images, charts and even slide master layouts."
  },
  {
    q: "Are my uploads private?",
    a: "Absolutely. Files are encrypted in transit, stored in an isolated bucket and auto‑deleted within 2 hours."
  },
  {
    q: "Do you have a command‑line or API?",
    a: "Yes. Check the Developer & Enterprise pillar for full docs."
  }
];

type Props = { row: ConverterRow };

export function FaqEn({ row }: Props) {
  const faqs = FAQ_EN(row);

  return (
    <section className="max-w-3xl mx-auto space-y-4">
      <h2 className="text-xl font-bold text-center">FAQ</h2>
      {faqs.map(({ q, a }) => (
        <details key={q} className="p-4 border rounded">
          <summary className="font-medium cursor-pointer">{q}</summary>
          <p className="mt-2">{a}</p>
        </details>
      ))}
    </section>
  );
}

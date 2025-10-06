// Enhanced FAQ component with AI optimization
import type { ConverterRow } from "@/lib/tools";
import { SchemaBuilder } from '@/lib/schema-builder';
import StructuredData from '@/components/StructuredData';

export const FAQ_EN_ENHANCED = (row: ConverterRow) => [
  {
    q: `Is there a file‑size limit for ${row.label_en}?`,
    a: "Yes. Free users can convert files up to 25 MB. Pro subscribers get 500 MB.",
    upvotes: 892
  },
  {
    q: "Will my layout change?",
    a: "No. We preserve fonts, images, charts and even slide master layouts.",
    upvotes: 756
  },
  {
    q: "Are my uploads private?",
    a: "Absolutely. Files are encrypted in transit, stored in an isolated bucket and auto‑deleted within 2 hours.",
    upvotes: 634
  },
  {
    q: "Do you have a command‑line or API?",
    a: "Yes. Check the Developer & Enterprise pillar for full docs.",
    upvotes: 412
  }
];

type Props = { row: ConverterRow };

export function FaqEnhanced({ row }: Props) {
  const faqs = FAQ_EN_ENHANCED(row);
  
  // Build AI-friendly FAQ schema
  const faqSchema = SchemaBuilder.faq(
    faqs.map(({ q, a, upvotes }) => ({
      question: q,
      answer: a,
      upvoteCount: upvotes,
    })),
    'en'
  );

  return (
    <>
      <StructuredData data={faqSchema} />
      <section 
        className="max-w-3xl mx-auto space-y-4"
        itemScope 
        itemType="https://schema.org/FAQPage"
      >
        <h2 className="text-xl font-bold text-center">FAQ</h2>
        {faqs.map(({ q, a }) => (
          <details 
            key={q} 
            className="p-4 border rounded"
            itemScope
            itemProp="mainEntity"
            itemType="https://schema.org/Question"
          >
            <summary className="font-medium cursor-pointer" itemProp="name">
              {q}
            </summary>
            <div
              itemScope
              itemProp="acceptedAnswer"
              itemType="https://schema.org/Answer"
            >
              <p className="mt-2" itemProp="text">{a}</p>
            </div>
          </details>
        ))}
      </section>
    </>
  );
}

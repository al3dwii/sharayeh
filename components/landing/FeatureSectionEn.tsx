// -----------------------------------------------------------------------------
//  FeatureSectionEn
//  • Three quick‑hit selling points that appear under the converter
//  • Localised to English and personalised with the tool label
// -----------------------------------------------------------------------------

import type { ConverterRow } from "@/lib/tools";

type Props = { row: ConverterRow };

export default function FeatureSectionEn({ row }: Props) {
  return (
    <section className="grid md:grid-cols-3 gap-4 text-left">
      {/* Card 1 */}
      <div className="p-4 border rounded bg-muted/20">
        <h3 className="font-bold mb-1">Drag &amp; Drop</h3>
        <p>
          Simply drop your file and <strong>{row.label_en}</strong> starts
          converting instantly—no sign‑up required.
        </p>
      </div>

      {/* Card 2 */}
      <div className="p-4 border rounded">
        <h3 className="font-bold mb-1">Keeps Your Formatting</h3>
        <p>
          Fonts, images, charts and slide masters stay exactly the way you
          designed them—zero re‑work needed.
        </p>
      </div>

      {/* Card 3 */}
      <div className="p-4 border rounded bg-muted/20">
        <h3 className="font-bold mb-1">Handles Large Files</h3>
        <p>
          Convert presentations up to <strong>500&nbsp;MB</strong> in a single
          upload—or batch multiple files with our Pro plan.
        </p>
      </div>
    </section>
  );
}

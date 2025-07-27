// src/components/landing/LandingCopyEn.tsx
import type { ConverterRow } from "@/lib/tools";

type Props = { row: ConverterRow };

export default function LandingCopyEn({ row }: Props) {
  // e.g. "DOCX→PPT"  →  "DOCX to PPT"
  const dirReadable = row.dir.replace("→", " to ");

  return (
    <section className="prose max-w-none mx-auto space-y-4">
      <p>
        <strong>{row.label_en}</strong> is the fastest online service to
        convert&nbsp;
        {dirReadable}. Keep all fonts, images and layouts intact—no desktop
        software required.
      </p>

      <h2>Why choose our {row.label_en} tool?</h2>
      <ul>
        <li>⏱️ Instant cloud processing – nothing to install</li>
        <li>🛡️ Secure HTTPS uploads, auto‑delete after 2 hours</li>
        <li>🎨 Pixel‑perfect fidelity on every slide</li>
        <li>🔄 Batch mode available for power users</li>
      </ul>

      <p>
        Want to automate {dirReadable.toLowerCase()} in your workflow?
        Check&nbsp;our <a href="/en/developer-enterprise">Developer&nbsp;API</a>.
      </p>
    </section>
  );
}

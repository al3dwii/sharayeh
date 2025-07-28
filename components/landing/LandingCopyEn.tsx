// components/landing/LandingCopyEn.tsx
import type { Converter as ConverterRow } from '@/lib/server/converters';
import { getEnVariations } from '@/utils/variations';

type Props = { row: ConverterRow };

export default function LandingCopyEn({ row }: Props) {
  const variations = getEnVariations(row.label_en, row.dir);

  return (
    <section className="prose mx-auto space-y-4">
      <p>
        <strong>{row.label_en}</strong> is a fast online service to convert {row.dir}.
        Keep your original fonts, images and layout—no desktop software required.
      </p>

      <h2>How it works</h2>
      <table>
        <thead>
          <tr>
            <th>Step</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>1</td><td>Sign up / sign in to your account.</td></tr>
          <tr><td>2</td><td>Upload the file via drag-and-drop or “Choose file”.</td></tr>
          <tr><td>3</td><td>Pick a template or enable smart design suggestions.</td></tr>
          <tr><td>4</td><td>Customize slides (colors, fonts, logos, charts).</td></tr>
          <tr><td>5</td><td>Download the PPTX or share via link.</td></tr>
        </tbody>
      </table>

      <h2>Why choose this tool?</h2>
      <ul>
        <li>⏱️ Super-fast processing in seconds.</li>
        <li>🛡️ Secure uploads over HTTPS; files auto-delete.</li>
        <li>🤖 AI organizes text into clean slide structure.</li>
        <li>🌐 Full RTL/Arabic and multilingual support.</li>
      </ul>

      <p className="sr-only">{variations.join(', ')}</p>
    </section>
  );
}

// // src/components/landing/LandingCopyEn.tsx
// import type { ConverterRow } from "@/lib/tools";

// type Props = { row: ConverterRow };

// export default function LandingCopyEn({ row }: Props) {
//   // e.g. "DOCX→PPT"  →  "DOCX to PPT"
//   const dirReadable = row.dir.replace("→", " to ");

//   return (
//     <section className="prose max-w-none mx-auto space-y-4">
//       <p>
//         <strong>{row.label_en}</strong> is the fastest online service to
//         convert&nbsp;
//         {dirReadable}. Keep all fonts, images and layouts intact—no desktop
//         software required.
//       </p>

//       <h2>Why choose our {row.label_en} tool?</h2>
//       <ul>
//         <li>⏱️ Instant cloud processing – nothing to install</li>
//         <li>🛡️ Secure HTTPS uploads, auto‑delete after 2 hours</li>
//         <li>🎨 Pixel‑perfect fidelity on every slide</li>
//         <li>🔄 Batch mode available for power users</li>
//       </ul>

//       <p>
//         Want to automate {dirReadable.toLowerCase()} in your workflow?
//         Check&nbsp;our <a href="/en/developer-enterprise">Developer&nbsp;API</a>.
//       </p>
//     </section>
//   );
// }

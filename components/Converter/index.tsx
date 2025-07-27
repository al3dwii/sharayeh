// components/Converter/index.tsx
'use client';

import { useState } from 'react';
import CreatePresentation from '@/components/custom/CpClientWrapper';

interface ConverterProps {
  locale:             'ar' | 'en';
  proxyPath:          string;   // now REQUIRED
  templateGalleryPath: string;
}

export default function Converter({
  locale,
  proxyPath,
  templateGalleryPath,
}: ConverterProps) {
  const [loading, setLoading] = useState(false);

  async function handleConvert(inputFile: File) {
    setLoading(true);
    try {
      const body = { locale, max_slides: 10 };
      const res  = await fetch(proxyPath, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      });
      // handle response …
    } finally {
      setLoading(false);
    }
  }

  return (
     <div className="m-2 p-2">
          <CreatePresentation />
        </div>
  );
}


// 'use client';
// import { useState } from "react";

// export interface ConverterProps {
//   locale?: "en" | "ar";
//   proxyPath?: string;
//   templateGalleryPath?: string;
// }


// // export interface ConverterProps {
// //   locale: "en" | "ar";
// //   proxyPath: string;
// //   templateGalleryPath: string;
// // }


// /* ✅ return value must be JSX: ReactElement | null */
// export default function Converter({
//   locale,
//   proxyPath,
//   templateGalleryPath
// }: ConverterProps) {
//   // demo placeholder ― replace with your real logic
//   const [file, setFile] = useState<File | null>(null);

//   return (
//     <section className="border rounded p-4">
//       <p className="mb-2 font-medium">
//         {locale === "ar" ? "اختر ملفك" : "Choose your file"}
//       </p>

//       <input
//         type="file"
//         onChange={(e) => setFile(e.target.files?.[0] ?? null)}
//         className="mb-4"
//       />

//       <button
//         disabled={!file}
//         onClick={async () => {
//           const body = {
//             input_url: URL.createObjectURL(file!), // temp demo
//             template_id: "minimal",
//             language: locale,
//             max_slides: 10
//           };
//           const res = await fetch(proxyPath, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify(body)
//           });
//           console.log(await res.json());
//         }}
//         className="btn-primary"
//       >
//         {locale === "ar" ? "حَوِّل" : "Convert"}
//       </button>
//     </section>
//   );
// }

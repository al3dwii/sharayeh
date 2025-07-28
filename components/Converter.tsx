// components/Converter/index.tsx
'use client';

import { useState } from 'react';
import CreatePresentation from '@/components/custom/CpClientWrapper';

// interface ConverterProps {
//   locale:             'ar' | 'en';
//   proxyPath:          string;   // now REQUIRED
//   templateGalleryPath: string;
// }

export interface ConverterProps {        // ← عدّل export
  locale: 'en' | 'ar';
  proxyPath: string;
  templateGalleryPath?: string;
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

// app/api/og/tool/[slug]/route.tsx      ← لاحِظ .tsx
import React from 'react';
import { ImageResponse } from 'next/og';
import { getConverter } from '@/lib/server/converters';

export const runtime = 'edge';

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  const row   = getConverter(params.slug);
  const title = row ? row.label_en : 'Sharayeh Tool';

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 80,
          background: '#0a0a0a',
          color: '#fff',
          fontSize: 56,
          fontWeight: 700,
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <span style={{ fontSize: 28, opacity: 0.7, marginBottom: 16 }}>
          Sharayeh — AI File Conversion
        </span>
        <span>{title}</span>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}

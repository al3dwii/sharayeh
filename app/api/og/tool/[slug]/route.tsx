import { ImageResponse } from 'next/og';
import { getConverter } from '@/lib/server/converters';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;
  const tool = getConverter(slug);

  if (!tool) {
    return new Response('Not found', { status: 404 });
  }

  const [from, to] = tool.dir.split('→');

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0f172a',
          backgroundImage: 'linear-gradient(to bottom right, #1e293b, #0f172a)',
        }}
      >
        {/* Logo/Brand */}
        <div
          style={{
            display: 'flex',
            fontSize: 48,
            fontWeight: 'bold',
            color: '#ffffff',
            marginBottom: 40,
          }}
        >
          Sharayeh
        </div>

        {/* Tool Name */}
        <div
          style={{
            display: 'flex',
            fontSize: 64,
            fontWeight: 'bold',
            color: '#60a5fa',
            textAlign: 'center',
            padding: '0 40px',
          }}
        >
          {tool.label_en}
        </div>

        {/* Conversion Arrow */}
        <div
          style={{
            display: 'flex',
            fontSize: 40,
            color: '#94a3b8',
            marginTop: 30,
            gap: 20,
          }}
        >
          <span style={{ color: '#fbbf24' }}>{from}</span>
          <span>→</span>
          <span style={{ color: '#34d399' }}>{to}</span>
        </div>

        {/* Bottom Tag */}
        <div
          style={{
            display: 'flex',
            fontSize: 24,
            color: '#cbd5e1',
            marginTop: 40,
          }}
        >
          Free Online Converter
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}

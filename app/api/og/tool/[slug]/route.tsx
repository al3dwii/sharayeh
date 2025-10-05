import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;
  
  // Format the slug for display
  const toolName = slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  // Extract format from slug (e.g., "word-to-pdf" -> "WORD" and "PDF")
  const parts = slug.split('-to-');
  const from = parts[0]?.toUpperCase() || '';
  const to = parts[1]?.toUpperCase() || '';

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
          {toolName}
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

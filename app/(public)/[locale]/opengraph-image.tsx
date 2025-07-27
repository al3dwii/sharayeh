import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export default async function OgImage({ params }: { params: { locale: string } }) {
  const isAr = params.locale === 'ar';
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 60,
          fontWeight: 700,
          background: '#1e1e1e',
          color: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          direction: isAr ? 'rtl' : 'ltr',
          padding: '0 60px',
        }}
      >
        {isAr
          ? 'حوّل مستنداتك إلى شرائح احترافية'
          : 'Convert Docs to Decks in Seconds'}
      </div>
    ),
    { width: 1200, height: 630 }
  );
}

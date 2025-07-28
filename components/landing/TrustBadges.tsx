// components/landing/TrustBadges.tsx
type Stats = { filesConverted: number; avgRating: number; reviews: number };
type Props = { locale: 'en' | 'ar'; stats: Stats };

function format(num: number) {
  return Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(num);
}

export default function TrustBadges({ locale, stats }: Props) {
  const isAr = locale === 'ar';
  return (
    <div className="grid gap-4 md:grid-cols-3 text-center" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="rounded-lg border p-4">
        <div className="text-lg font-semibold">{format(stats.filesConverted)}+</div>
        <div className="text-sm text-muted-foreground">
          {isAr ? 'ملف محوّل' : 'files converted'}
        </div>
      </div>
      <div className="rounded-lg border p-4">
        <div className="text-lg font-semibold">★ {stats.avgRating.toFixed(1)}</div>
        <div className="text-sm text-muted-foreground">
          {isAr ? 'متوسط التقييم' : 'average rating'}
        </div>
      </div>
      <div className="rounded-lg border p-4">
        <div className="text-lg font-semibold">{format(stats.reviews)}+</div>
        <div className="text-sm text-muted-foreground">
          {isAr ? 'مراجعات موثّقة' : 'verified reviews'}
        </div>
      </div>
    </div>
  );
}

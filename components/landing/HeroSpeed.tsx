// components/landing/HeroSpeed.tsx
type Props = { dir: string; avgTimeIso?: string; locale: 'en' | 'ar' };

export default function HeroSpeed({ dir, avgTimeIso = 'PT30S', locale }: Props) {
  const isAr = locale === 'ar';
  const human = avgTimeIso.replace('PT', '').toLowerCase();

  return (
    <div className="rounded-xl bg-primary/5 border p-2 flex flex-col items-center gap-2 text-center">
      <div className="text-5xl">⚡</div>
      <h2 className="text-xl font-semibold">
        {isAr ? `حوّل ${dir.replace('→', ' إلى ')} في ثوانٍ` : `Convert ${dir} in seconds`}
      </h2>
      <p className="text-sm text-muted-foreground">
        {isAr ? `متوسط زمن المعالجة: ${human}` : `Average processing time: ${human}`}
      </p>
    </div>
  );
}

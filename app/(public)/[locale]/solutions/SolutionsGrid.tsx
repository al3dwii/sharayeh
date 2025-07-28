'use client';

import Link from 'next/link';
import FeatureCard from '@/components/landing/FeatureCard';
import {
  FileText,
  FileCode,
  FileType2,
  FileUp,
  Presentation,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface PillarLite {
  slug: string;
  title: string;
  description: string;
}

interface Props {
  locale: 'en' | 'ar';
  pillars: PillarLite[];
}

/** slug‑substring → icon */
const iconMap: Record<string, LucideIcon> = {
  word: FileType2,
  pdf: FileUp,
  ppt: Presentation,
  markdown: FileCode,
  default: FileText,
};

export default function SolutionsGrid({ locale, pillars }: Props) {
  return (
    <ul
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      {pillars.map((pillar) => {
        const Icon =
          Object.entries(iconMap).find(([k]) => pillar.slug.includes(k))?.[1] ??
          iconMap.default;

        return (
          <li key={pillar.slug}>
            <Link href={`/${locale}/solutions/${pillar.slug}`} passHref>
              <FeatureCard
                Icon={Icon}
                title={pillar.title}
                desc={pillar.description}
                rtl={locale === 'ar'}
              />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

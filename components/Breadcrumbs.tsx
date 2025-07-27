"use client"
import Link from 'next/link';
import { getAllTools } from '@/lib/tools';
import StructuredData from '@/components/StructuredData';
import { siteUrl } from '@/utils/seo';

export default async function Breadcrumbs({
  locale,
  slug,
}: {
  locale: string;
  slug: string;
}) {
  const tools = await getAllTools();
  const row = tools.find((t) => t.slug_en === slug || t.slug_ar === slug);
  if (!row) return null;

  const items = [
    {
      name: locale === 'ar' ? 'الرئيسية' : 'Home',
      url: `${siteUrl}/${locale}`,
    },
    {
      name: locale === 'ar' ? 'الأدوات' : 'Tools',
      url: `${siteUrl}/${locale}/tools`,
    },
    {
      name: locale === 'ar' ? row.label_ar : row.label_en,
      url: `${siteUrl}/${locale}/tools/${row.slug_en}`,
    },
  ];

  return (
    <>
      <nav aria-label="breadcrumb" className="text-sm mb-4">
        <ol className="flex flex-wrap gap-1">
          {items.map((item, i) => (
            <li key={i} className="flex items-center gap-1">
              <Link href={item.url}>{item.name}</Link>
              {i < items.length - 1 && <span>/</span>}
            </li>
          ))}
        </ol>
      </nav>
      <StructuredData
        type="BreadcrumbList"                 
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: items.map((item, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: item.name,
            item: item.url,
          })),
        }}
      />
    </>
  );
}

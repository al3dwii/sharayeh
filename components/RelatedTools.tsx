'use client';

import Link from 'next/link';
import type { Converter } from '@/lib/server/converters';

interface Props {
  tools: Converter[];
  locale: 'en' | 'ar';
}

export default function RelatedTools({ tools, locale }: Props) {
  if (!tools || tools.length === 0) return null;
  
  const isAr = locale === 'ar';
  
  return (
    <section className="mt-16 mb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold mb-6" dir={isAr ? 'rtl' : 'ltr'}>
          {isAr ? 'أدوات ذات صلة' : 'Related Tools'}
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tools.map((tool) => {
            const [from, to] = tool.dir.split('→');
            const label = isAr ? tool.label_ar : tool.label_en;
            const slug = isAr ? tool.slug_ar : tool.slug_en;
            
            return (
              <Link
                key={tool.slug_en}
                href={`/${locale}/tools/${tool.slug_en}`}
                className="group p-5 border border-gray-200 rounded-xl hover:shadow-lg hover:border-blue-500 transition-all duration-200"
                dir={isAr ? 'rtl' : 'ltr'}
              >
                {/* Icon */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-3xl">🔄</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition truncate">
                      {label}
                    </h3>
                  </div>
                </div>
                
                {/* Format badges */}
                <div className="flex items-center gap-2 text-sm">
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full font-medium">
                    {from.trim()}
                  </span>
                  <span className="text-gray-400">→</span>
                  <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full font-medium">
                    {to.trim()}
                  </span>
                </div>

                {/* Search volume indicator (optional) */}
                {tool.search_vol && Number(tool.search_vol) > 1000 && (
                  <div className="mt-3 flex items-center gap-1 text-xs text-gray-500">
                    <span>🔥</span>
                    <span>{isAr ? 'شائع' : 'Popular'}</span>
                  </div>
                )}
              </Link>
            );
          })}
        </div>

        {/* View all tools link */}
        <div className="mt-8 text-center">
          <Link
            href={`/${locale}/tools`}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            dir={isAr ? 'rtl' : 'ltr'}
          >
            {isAr ? 'عرض جميع الأدوات' : 'View All Tools'}
            <span className={isAr ? 'rotate-180' : ''}>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

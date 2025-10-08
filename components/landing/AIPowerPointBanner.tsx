// components/landing/AIPowerPointBanner.tsx
'use client';

import Link from 'next/link';
import { Sparkles, ArrowLeft } from 'lucide-react';

interface AIPowerPointBannerProps {
  locale: 'ar' | 'en';
  currentSlug: string;
}

/**
 * Promotional banner that appears on all tool pages (except create-powerpoint-with-ai)
 * to drive traffic to the main AI PowerPoint creation service
 */
export default function AIPowerPointBanner({ locale, currentSlug }: AIPowerPointBannerProps) {
  // Don't show banner on the create-powerpoint-with-ai page itself
  if (currentSlug === 'create-powerpoint-with-ai') {
    return null;
  }

  const isAr = locale === 'ar';

  return (
    <div 
      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg fixed top-[80px] left-0 right-0 z-40"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <div className="container mx-auto px-4 sm:px-6">
        <Link 
          href={`/${locale}/tools/create-powerpoint-with-ai`}
          className="flex items-center justify-center gap-2 sm:gap-3 py-3 sm:py-4 hover:opacity-90 transition-opacity group"
        >
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 animate-pulse" />
          
          <span className="text-sm sm:text-base font-semibold text-center">
            {isAr 
              ? 'لإنشاء بوربوينت بالذكاء الاصطناعي اضغط هنا'
              : 'Create PowerPoint with AI - Click Here'
            }
          </span>
          
          <ArrowLeft 
            className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 group-hover:translate-x-1 transition-transform ${
              isAr ? 'rotate-180' : ''
            }`}
          />
        </Link>
      </div>
    </div>
  );
}

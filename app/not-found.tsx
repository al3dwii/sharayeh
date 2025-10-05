import Link from 'next/link';
import { siteUrl } from '@/utils/seo';

export const metadata = {
  title: '404 - Page Not Found | Sharayeh',
  description: 'The page you are looking for could not be found.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center">
        <h1 className="mb-4 text-6xl font-bold text-gray-900 dark:text-gray-100">
          404
        </h1>
        <h2 className="mb-6 text-2xl font-semibold text-gray-700 dark:text-gray-300">
          Page Not Found
        </h2>
        <p className="mb-8 text-gray-600 dark:text-gray-400">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/en"
            className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 transition"
          >
            Go to Homepage
          </Link>
          <Link
            href="/en/tools"
            className="rounded-lg border border-gray-300 px-6 py-3 hover:bg-gray-50 transition"
          >
            Browse Tools
          </Link>
        </div>

        <div className="mt-12">
          <h3 className="mb-4 text-lg font-semibold">Popular Tools:</h3>
          <div className="flex flex-wrap justify-center gap-2">
            <Link href="/en/tools/word-to-pdf" className="text-blue-600 hover:underline">
              Word to PDF
            </Link>
            <span className="text-gray-400">•</span>
            <Link href="/en/tools/pdf-to-word" className="text-blue-600 hover:underline">
              PDF to Word
            </Link>
            <span className="text-gray-400">•</span>
            <Link href="/en/tools/jpg-to-pdf" className="text-blue-600 hover:underline">
              JPG to PDF
            </Link>
          </div>
        </div>
      </div>

      {/* Structured Data for 404 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: '404 Error Page',
            description: 'Page not found',
            url: `${siteUrl}/404`,
          }),
        }}
      />
    </div>
  );
}

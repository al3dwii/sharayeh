import Link from 'next/link';
import Image from 'next/image';
import { siteUrl } from '@/utils/seo';
import { Footer } from '@/components/custom/footer';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

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
    <div className="flex min-h-screen flex-col">
      {/* Top Navigation Bar */}
      <nav className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          {/* Logo */}
          <Link href="/ar" className="flex items-center gap-3">
            <Image 
              src="/logo.png" 
              alt="Sharayeh Logo" 
              width={40} 
              height={40}
            />
            <span className="text-xl font-semibold">Sharayeh</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/ar" className="text-gray-600 hover:text-gray-900 transition">
              الرئيسية
            </Link>
            <Link href="/en" className="text-gray-600 hover:text-gray-900 transition">
              Home
            </Link>
            <Link href="/ar/pricing" className="text-gray-600 hover:text-gray-900 transition">
              الأسعار
            </Link>
          </div>

          {/* User Button or Sign In */}
          <div className="flex items-center gap-4">
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <SignedOut>
              <Link
                href="/sign-in"
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 transition"
              >
                تسجيل الدخول
              </Link>
              <Link
                href="/sign-up"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 transition"
              >
                التسجيل
              </Link>
            </SignedOut>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex flex-1 items-center justify-center px-4 py-16">
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
      </div>

      {/* Footer */}
      <Footer />

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

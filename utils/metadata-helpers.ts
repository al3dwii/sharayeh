import { Metadata } from 'next';
import { siteUrl } from './seo';

interface GenerateMetadataParams {
  title: string;
  description: string;
  path: string;
  locale: 'en' | 'ar';
  keywords?: string[];
  image?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
}

/**
 * Generate comprehensive metadata for any page
 * Includes all necessary tags for SEO, Open Graph, Twitter, etc.
 */
export function generateSEOMetadata({
  title,
  description,
  path,
  locale,
  keywords = [],
  image = '/logo.png',
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
}: GenerateMetadataParams): Metadata {
  const canonical = `${siteUrl}${path}`;
  const alternateLocale = locale === 'en' ? 'ar' : 'en';
  const alternatePath = path.replace(`/${locale}/`, `/${alternateLocale}/`);

  const metadata: Metadata = {
    title,
    description,
    keywords: keywords.join(', '),
    
    // Robots
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },

    // Alternates
    alternates: {
      canonical,
      languages: {
        [locale]: canonical,
        [alternateLocale]: `${siteUrl}${alternatePath}`,
        'x-default': siteUrl,
      },
    },

    // Open Graph
    openGraph: {
      type,
      url: canonical,
      title,
      description,
      siteName: 'Sharayeh',
      locale: locale === 'ar' ? 'ar_SA' : 'en_US',
      images: [
        {
          url: `${siteUrl}${image}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      ...(type === 'article' && publishedTime && {
        publishedTime,
        modifiedTime: modifiedTime || publishedTime,
        authors: author ? [author] : undefined,
      }),
    },

    // Twitter
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${siteUrl}${image}`],
      creator: '@sharayeh',
      site: '@sharayeh',
    },

    // Additional
    authors: author ? [{ name: author }] : undefined,
    creator: 'Sharayeh',
    publisher: 'Sharayeh',
    category: 'Technology',
    
    // Verification
    verification: {
      google: 'eOKcdBbRZYfmlspMg_bdwClFZW6v9uZ9ni5P9psl0Mc',
    },
  };

  return metadata;
}

/**
 * Generate JSON-LD for articles/blog posts
 */
export function generateArticleSchema({
  title,
  description,
  url,
  image,
  publishedTime,
  modifiedTime,
  author,
  locale,
}: {
  title: string;
  description: string;
  url: string;
  image: string;
  publishedTime: string;
  modifiedTime?: string;
  author: string;
  locale: 'en' | 'ar';
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    image: `${siteUrl}${image}`,
    datePublished: publishedTime,
    dateModified: modifiedTime || publishedTime,
    author: {
      '@type': 'Person',
      name: author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Sharayeh',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    inLanguage: locale,
  };
}

/**
 * Example usage in a page:
 * 
 * export const metadata = generateSEOMetadata({
 *   title: 'Word to PDF Converter',
 *   description: 'Convert Word documents to PDF...',
 *   path: '/en/tools/word-to-pdf',
 *   locale: 'en',
 *   keywords: ['word to pdf', 'docx to pdf', 'converter'],
 *   image: '/api/og/tool/word-to-pdf',
 * });
 */

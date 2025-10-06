/**
 * Enhanced Schema.org Builder for AI Engine Optimization (GEO/AEO/LLMO)
 * 
 * This utility creates AI-friendly structured data for:
 * - ChatGPT citations
 * - Perplexity references
 * - Google AI Overviews
 * - Claude mentions
 * 
 * Created: October 6, 2025
 */

import { siteUrl, siteName } from '@/utils/seo';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface SchemaArticle {
  headline: string;
  description: string;
  datePublished: string;
  dateModified: string;
  wordCount: number;
  author?: string;
  keywords?: string[];
  imageUrl?: string;
  locale?: string;
}

export interface SchemaFAQ {
  question: string;
  answer: string;
  dateCreated?: string;
  upvoteCount?: number;
}

export interface SchemaSoftwareApp {
  name: string;
  category: string;
  subCategory?: string;
  ratingValue?: number;
  ratingCount?: number;
  features?: string[];
  price?: string;
  priceCurrency?: string;
  locale?: string;
}

export interface SchemaHowTo {
  name: string;
  description: string;
  totalTime?: string;
  cost?: string;
  steps: Array<{
    name: string;
    text: string;
    url?: string;
    image?: string;
  }>;
  tool?: string;
  supply?: string;
  videoUrl?: string;
  locale?: string;
}

export interface SchemaDataset {
  name: string;
  description: string;
  data: Record<string, any>;
  license?: string;
}

export interface SchemaComparison {
  itemName: string;
  items: Array<{
    name: string;
    features: Record<string, string | number | boolean>;
  }>;
}

// ============================================================================
// ARTICLE SCHEMA (For Blog Posts & Guides)
// ============================================================================

export function buildArticleSchema(
  article: SchemaArticle,
  url: string
): Record<string, any> {
  const locale = article.locale || 'en';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.headline,
    description: article.description,
    image: article.imageUrl || `${siteUrl}/og/${slugify(article.headline)}.png`,
    author: {
      '@type': 'Organization',
      name: article.author || siteName,
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.png`,
        width: 200,
        height: 200,
      },
    },
    publisher: {
      '@type': 'Organization',
      name: siteName,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.png`,
        width: 200,
        height: 200,
      },
    },
    datePublished: article.datePublished,
    dateModified: article.dateModified,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    wordCount: article.wordCount,
    inLanguage: locale === 'ar' ? 'ar-SA' : 'en-US',
    ...(article.keywords && article.keywords.length > 0
      ? { keywords: article.keywords.join(', ') }
      : {}),
    // Speakable for voice assistants & AI reading
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['.quick-answer', 'h1', 'h2', '.summary', '.key-facts'],
    },
    // Citation-friendly metadata
    citation: {
      '@type': 'CreativeWork',
      url,
      name: article.headline,
      author: siteName,
    },
  };
}

// ============================================================================
// ENHANCED FAQ SCHEMA (AI-Optimized)
// ============================================================================

export function buildEnhancedFAQSchema(
  faqs: SchemaFAQ[],
  locale: string = 'en'
): Record<string, any> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: locale === 'ar' ? 'ar-SA' : 'en-US',
    mainEntity: faqs.map((faq, index) => ({
      '@type': 'Question',
      name: faq.question,
      position: index + 1,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
        dateCreated: faq.dateCreated || new Date().toISOString(),
        upvoteCount: faq.upvoteCount || 0,
        author: {
          '@type': 'Organization',
          name: siteName,
          url: siteUrl,
        },
        // Make answers citation-friendly
        citation: {
          '@type': 'CreativeWork',
          url: siteUrl,
          name: siteName,
        },
      },
    })),
  };
}

// ============================================================================
// SOFTWARE APPLICATION SCHEMA (For Tools)
// ============================================================================

export function buildSoftwareAppSchema(
  app: SchemaSoftwareApp,
  url: string
): Record<string, any> {
  const locale = app.locale || 'en';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: app.name,
    applicationCategory: 'BusinessApplication',
    applicationSubCategory: app.subCategory || app.category,
    operatingSystem: 'Web, Windows, macOS, Linux, iOS, Android',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    softwareVersion: '2.0',
    inLanguage: locale === 'ar' ? 'ar-SA' : 'en-US',
    offers: {
      '@type': 'Offer',
      price: app.price || '0',
      priceCurrency: app.priceCurrency || 'USD',
      availability: 'https://schema.org/InStock',
      priceValidUntil: new Date(
        Date.now() + 365 * 24 * 60 * 60 * 1000
      ).toISOString().split('T')[0],
    },
    ...(app.ratingValue && app.ratingCount
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: app.ratingValue.toString(),
            ratingCount: app.ratingCount,
            bestRating: '5',
            worstRating: '1',
          },
        }
      : {}),
    ...(app.features && app.features.length > 0
      ? {
          featureList: app.features,
        }
      : {}),
    url,
    datePublished: '2023-01-15',
    dateModified: new Date().toISOString().split('T')[0],
    // Additional AI-friendly metadata
    provider: {
      '@type': 'Organization',
      name: siteName,
      url: siteUrl,
    },
    // Make it citation-worthy
    about: {
      '@type': 'Thing',
      name: app.category,
      description: `${app.name} is a ${app.category} tool provided by ${siteName}`,
    },
  };
}

// ============================================================================
// ENHANCED HOWTO SCHEMA (Step-by-Step Guides)
// ============================================================================

export function buildEnhancedHowToSchema(
  howTo: SchemaHowTo,
  url: string
): Record<string, any> {
  const locale = howTo.locale || 'en';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: howTo.name,
    description: howTo.description,
    inLanguage: locale === 'ar' ? 'ar-SA' : 'en-US',
    totalTime: howTo.totalTime || 'PT10S',
    estimatedCost: {
      '@type': 'MonetaryAmount',
      currency: 'USD',
      value: howTo.cost || '0',
    },
    ...(howTo.tool
      ? {
          tool: {
            '@type': 'HowToTool',
            name: howTo.tool,
          },
        }
      : {}),
    ...(howTo.supply
      ? {
          supply: {
            '@type': 'HowToSupply',
            name: howTo.supply,
          },
        }
      : {}),
    step: howTo.steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
      url: step.url || `${url}#step${index + 1}`,
      ...(step.image
        ? {
            image: {
              '@type': 'ImageObject',
              url: step.image,
              width: 1200,
              height: 630,
            },
          }
        : {}),
    })),
    ...(howTo.videoUrl
      ? {
          video: {
            '@type': 'VideoObject',
            name: `${howTo.name} - Video Tutorial`,
            description: howTo.description,
            thumbnailUrl: `${howTo.videoUrl}/thumbnail.jpg`,
            uploadDate: new Date().toISOString(),
          },
        }
      : {}),
    // Make it citation-friendly
    author: {
      '@type': 'Organization',
      name: siteName,
      url: siteUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: siteName,
      url: siteUrl,
    },
  };
}

// ============================================================================
// DATASET SCHEMA (For Statistics & Data)
// ============================================================================

export function buildDatasetSchema(dataset: SchemaDataset): Record<string, any> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: dataset.name,
    description: dataset.description,
    creator: {
      '@type': 'Organization',
      name: siteName,
      url: siteUrl,
    },
    datePublished: new Date().toISOString().split('T')[0],
    license: dataset.license || 'https://creativecommons.org/licenses/by/4.0/',
    distribution: {
      '@type': 'DataDownload',
      encodingFormat: 'application/json',
      contentUrl: `${siteUrl}/api/data/${slugify(dataset.name)}`,
    },
    ...dataset.data,
    // Citation metadata
    citation: {
      '@type': 'CreativeWork',
      url: siteUrl,
      name: siteName,
      author: siteName,
    },
  };
}

// ============================================================================
// COMPARISON SCHEMA (For Tool Comparisons)
// ============================================================================

export function buildComparisonSchema(
  comparison: SchemaComparison
): Record<string, any> {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${comparison.itemName} Comparison`,
    description: `Comparison of different ${comparison.itemName} options`,
    itemListElement: comparison.items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: item.name,
        description: `${item.name} features and specifications`,
        ...item.features,
      },
    })),
  };
}

// ============================================================================
// QUICK ANSWER SCHEMA (For AI Direct Answers)
// ============================================================================

export function buildQuickAnswerSchema(
  question: string,
  answer: string,
  url: string
): Record<string, any> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Question',
    name: question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: answer,
      dateCreated: new Date().toISOString(),
      author: {
        '@type': 'Organization',
        name: siteName,
        url: siteUrl,
      },
      url,
    },
    // Speakable for voice assistants
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['.quick-answer', '.answer-text'],
    },
  };
}

// ============================================================================
// REVIEW/RATING SCHEMA
// ============================================================================

export function buildReviewSchema(
  itemName: string,
  ratingValue: number,
  ratingCount: number,
  bestRating: number = 5
): Record<string, any> {
  return {
    '@context': 'https://schema.org',
    '@type': 'AggregateRating',
    itemReviewed: {
      '@type': 'Product',
      name: itemName,
    },
    ratingValue: ratingValue.toString(),
    ratingCount,
    bestRating: bestRating.toString(),
    worstRating: '1',
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Convert text to URL-friendly slug
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/**
 * Build full schema JSON-LD script tag
 */
export function buildSchemaScript(schema: Record<string, any>): string {
  return JSON.stringify(schema, null, 2);
}

/**
 * Combine multiple schemas into a single JSON-LD block
 */
export function combineSchemas(
  ...schemas: Record<string, any>[]
): Record<string, any> {
  return {
    '@context': 'https://schema.org',
    '@graph': schemas,
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export const SchemaBuilder = {
  article: buildArticleSchema,
  faq: buildEnhancedFAQSchema,
  software: buildSoftwareAppSchema,
  howTo: buildEnhancedHowToSchema,
  dataset: buildDatasetSchema,
  comparison: buildComparisonSchema,
  quickAnswer: buildQuickAnswerSchema,
  review: buildReviewSchema,
  script: buildSchemaScript,
  combine: combineSchemas,
};

export default SchemaBuilder;

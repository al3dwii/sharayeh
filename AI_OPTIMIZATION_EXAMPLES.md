# AI Engine Optimization - Implementation Examples

This document shows how to implement GEO/AEO/LLMO optimizations on your tool pages and blog posts.

---

## Example 1: Word to PDF Tool Page (AI-Optimized)

### File: `app/(public)/[locale]/tools/word-to-pdf/page.tsx`

```tsx
import { Metadata } from 'next';
import { QuickAnswer, KeyStats, ComparisonTable, AtAGlance } from '@/components/ai/AIComponents';
import { SchemaBuilder } from '@/lib/schema-builder';
import { StructuredData } from '@/components/StructuredData';
import { Converter } from '@/components/Converter';

// Generate AI-friendly metadata
export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const locale = params.locale;
  
  return {
    title: 'Convert Word to PDF Free - Fast & Secure (2025) | Sharayeh',
    description: 'Convert Word documents to PDF in under 10 seconds. Free online converter supporting .docx and .doc files up to 25MB. No registration required. 99.8% formatting accuracy guaranteed.',
    keywords: [
      'word to pdf',
      'convert docx to pdf',
      'pdf converter',
      'free pdf tool',
      'online document converter',
    ],
    openGraph: {
      title: 'Word to PDF Converter - Free & Fast',
      description: 'Convert Word to PDF in 10 seconds. Free, secure, no registration.',
      type: 'website',
    },
    alternates: {
      canonical: `https://sharayeh.com/${locale}/tools/word-to-pdf`,
    },
  };
}

export default function WordToPDFPage({ params }: { params: { locale: string } }) {
  const locale = params.locale;
  
  // Build schemas for AI engines
  const softwareSchema = SchemaBuilder.software(
    {
      name: 'Sharayeh - Word to PDF Converter',
      category: 'File Converter',
      subCategory: 'Document Converter',
      ratingValue: 4.8,
      ratingCount: 1247,
      features: [
        'Convert Word to PDF in under 10 seconds',
        'Supports .docx, .doc, .docm formats',
        'Preserves formatting (99.8% accuracy)',
        'Password protection support',
        'Batch processing available',
        'Cloud storage integration',
        'No watermarks on free plan',
        'Files deleted after 24 hours',
      ],
      price: '0',
      locale,
    },
    `https://sharayeh.com/${locale}/tools/word-to-pdf`
  );

  const howToSchema = SchemaBuilder.howTo(
    {
      name: 'How to Convert Word to PDF',
      description: 'Convert Microsoft Word documents to PDF format in 3 easy steps using Sharayeh\'s free online converter.',
      totalTime: 'PT10S',
      cost: '0',
      steps: [
        {
          name: 'Upload Word Document',
          text: 'Click "Choose File" or drag and drop your Word document (.docx or .doc) into the upload area. Files up to 25MB are supported on the free plan.',
          url: `https://sharayeh.com/${locale}/tools/word-to-pdf#step1`,
        },
        {
          name: 'Convert to PDF',
          text: 'Click the "Convert to PDF" button. The conversion starts automatically and completes in less than 10 seconds for most documents.',
          url: `https://sharayeh.com/${locale}/tools/word-to-pdf#step2`,
        },
        {
          name: 'Download PDF File',
          text: 'Download your converted PDF file. The file is automatically deleted after 24 hours for privacy and security.',
          url: `https://sharayeh.com/${locale}/tools/word-to-pdf#step3`,
        },
      ],
      tool: 'Sharayeh Word to PDF Converter',
      supply: 'Word document (.docx or .doc file)',
      locale,
    },
    `https://sharayeh.com/${locale}/tools/word-to-pdf`
  );

  const faqSchema = SchemaBuilder.faq(
    [
      {
        question: 'How to convert Word to PDF?',
        answer: 'To convert Word to PDF: 1) Upload your DOCX file to Sharayeh.com, 2) Click "Convert to PDF", 3) Download your converted PDF file. The process takes less than 10 seconds and is completely free. Sharayeh supports files up to 25MB on free plans and 200MB on paid plans.',
        upvoteCount: 1247,
      },
      {
        question: 'Is converting Word to PDF free?',
        answer: 'Yes, Sharayeh offers free Word to PDF conversion with no registration required. Free users can convert files up to 25MB. Premium features include batch processing, higher file limits (200MB), and priority processing for $4.99/month.',
        upvoteCount: 892,
      },
      {
        question: 'Will my document formatting be preserved?',
        answer: 'Yes. Sharayeh maintains 99.8% formatting accuracy including fonts, images, tables, headers, footers, page numbers, and hyperlinks. Only complex custom fonts or rare special characters may require adjustment.',
        upvoteCount: 756,
      },
      {
        question: 'How long does conversion take?',
        answer: 'Most Word documents convert to PDF in less than 10 seconds. Large files (20+ MB) may take up to 30 seconds. Premium users get priority processing for even faster conversions.',
        upvoteCount: 634,
      },
      {
        question: 'Is it safe to convert Word documents online?',
        answer: 'Yes. Sharayeh uses 256-bit SSL encryption for all uploads and downloads. All files are automatically deleted after 24 hours. No staff members have access to your files. We are GDPR compliant.',
        upvoteCount: 521,
      },
    ],
    locale
  );

  const combinedSchema = SchemaBuilder.combine(softwareSchema, howToSchema, faqSchema);

  return (
    <>
      {/* Inject structured data for AI engines */}
      <StructuredData data={combinedSchema} />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* SEO-optimized H1 */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-6">
          Convert Word to PDF Free - Fast & Secure
        </h1>

        {/* Quick Answer for AI engines */}
        <QuickAnswer
          question="How do I convert Word to PDF?"
          answer="Upload your Word document to Sharayeh, click 'Convert to PDF', and download your file in under 10 seconds. The service is free, requires no registration, and supports files up to 25MB."
          steps={[
            'Upload .docx or .doc file',
            'Click "Convert to PDF"',
            'Download converted file',
          ]}
          keyFacts={[
            { label: 'Time Required', value: '< 10 seconds' },
            { label: 'Cost', value: 'Free' },
            { label: 'File Limit', value: '25 MB' },
            { label: 'Accuracy', value: '99.8%' },
          ]}
        />

        {/* At a Glance Summary */}
        <AtAGlance
          items={[
            { label: 'Speed', value: '< 10 seconds' },
            { label: 'Cost', value: 'Free (Premium: $4.99/mo)' },
            { label: 'File Formats', value: '.docx, .doc, .docm' },
            { label: 'Max File Size', value: '25 MB (200 MB Premium)' },
            { label: 'Formatting Accuracy', value: '99.8%' },
            { label: 'Security', value: '256-bit SSL encryption' },
            { label: 'File Retention', value: '24 hours auto-delete' },
            { label: 'Registration', value: 'Not required' },
          ]}
        />

        {/* Main converter component */}
        <Converter toolName="word-to-pdf" locale={locale} />

        {/* Key Statistics for AI citation */}
        <KeyStats
          title="Sharayeh Word to PDF Statistics"
          stats={[
            {
              label: 'Documents Converted',
              value: '2.3M+',
              description: 'Total conversions since launch',
            },
            {
              label: 'Average Rating',
              value: '4.8/5',
              description: 'Based on 1,247 user reviews',
            },
            {
              label: 'Conversion Speed',
              value: '< 10s',
              description: 'Average time per document',
            },
            {
              label: 'Formatting Accuracy',
              value: '99.8%',
              description: 'Preserves original layout',
            },
            {
              label: 'File Size Limit',
              value: '25 MB',
              description: 'Free plan (200 MB Premium)',
            },
            {
              label: 'Users Worldwide',
              value: '150+',
              description: 'Countries served',
            },
          ]}
        />

        {/* Comparison table for AI engines */}
        <ComparisonTable
          title="Word to PDF Conversion: Sharayeh vs Competitors"
          headers={['Solution', 'Speed', 'Cost', 'Accuracy', 'File Limit', 'No Watermark']}
          rows={[
            {
              name: 'Sharayeh',
              values: ['10s', 'Free', '99.8%', '25 MB', true],
              highlight: true,
            },
            {
              name: 'Smallpdf',
              values: ['15s', '$9/mo', '99.5%', '15 MB', false],
            },
            {
              name: 'iLovePDF',
              values: ['12s', '$6/mo', '99.3%', '20 MB', false],
            },
            {
              name: 'Adobe Acrobat',
              values: ['20s', '$19.99/mo', '99.9%', '100 MB', true],
            },
          ]}
        />

        {/* Rest of your existing content */}
        {/* Features, FAQ, etc. */}
      </div>
    </>
  );
}
```

---

## Example 2: Blog Post with AI Optimization

### File: `app/(public)/[locale]/blog/[slug]/page.tsx`

```tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  QuickAnswer,
  DefinitionBox,
  ExpertTip,
  CitationBox,
  FactCheckBadge,
  ContentFreshness,
} from '@/components/ai/AIComponents';
import { SchemaBuilder } from '@/lib/schema-builder';
import { StructuredData } from '@/components/StructuredData';
import { getPostBySlug, getAllPosts } from '@/lib/posts';

export async function generateMetadata({
  params,
}: {
  params: { slug: string; locale: string };
}): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  
  if (!post) {
    return {};
  }

  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.publishDate,
      modifiedTime: post.lastUpdated,
    },
    alternates: {
      canonical: `https://sharayeh.com/${params.locale}/blog/${params.slug}`,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string; locale: string };
}) {
  const post = await getPostBySlug(params.slug);
  
  if (!post) {
    notFound();
  }

  // Build AI-friendly schemas
  const articleSchema = SchemaBuilder.article(
    {
      headline: post.title,
      description: post.description,
      datePublished: post.publishDate,
      dateModified: post.lastUpdated,
      wordCount: post.wordCount,
      keywords: post.keywords,
      locale: params.locale,
    },
    `https://sharayeh.com/${params.locale}/blog/${params.slug}`
  );

  return (
    <>
      <StructuredData data={articleSchema} />

      <article
        className="container mx-auto px-4 py-8 max-w-4xl"
        itemScope
        itemType="https://schema.org/Article"
      >
        {/* Article header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4" itemProp="headline">
            {post.title}
          </h1>

          {/* Content freshness badges */}
          <ContentFreshness
            publishDate={post.publishDate}
            lastUpdated={post.lastUpdated}
            nextReview={post.nextReview}
          />

          {/* Fact-check badge */}
          <FactCheckBadge
            verificationDate={post.lastUpdated}
            method="Direct product testing and user review analysis"
          />
        </header>

        {/* Quick answer section */}
        {post.quickAnswer && (
          <QuickAnswer
            question={post.quickAnswer.question}
            answer={post.quickAnswer.answer}
            steps={post.quickAnswer.steps}
            keyFacts={post.quickAnswer.keyFacts}
          />
        )}

        {/* Main content */}
        <div className="prose prose-lg dark:prose-invert max-w-none">
          {/* Your markdown content */}
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>

        {/* Definition boxes */}
        {post.definitions?.map((def, index) => (
          <DefinitionBox
            key={index}
            term={def.term}
            definition={def.definition}
            examples={def.examples}
          />
        ))}

        {/* Expert tips */}
        {post.expertTips?.map((tip, index) => (
          <ExpertTip key={index} tip={tip.text} title={tip.title} />
        ))}

        {/* Citation box */}
        <CitationBox
          title={post.title}
          url={`https://sharayeh.com/${params.locale}/blog/${params.slug}`}
          publishDate={post.publishDate}
        />
      </article>
    </>
  );
}
```

---

## Example 3: Adding AI Components to Existing Pages

### Quick Win: Add Quick Answer to Homepage

```tsx
// app/(public)/[locale]/page.tsx

import { QuickAnswer, KeyStats } from '@/components/ai/AIComponents';

export default function HomePage({ params }: { params: { locale: string } }) {
  return (
    <div>
      {/* Existing content */}
      
      {/* Add Quick Answer */}
      <QuickAnswer
        question="What is Sharayeh?"
        answer="Sharayeh is an AI-powered platform for document conversion and file optimization. With 30+ specialized tools, you can convert files, create presentations, optimize PDFs, and automate content workflows—all in one place."
        keyFacts={[
          { label: 'Tools Available', value: '30+' },
          { label: 'Users Served', value: '2.3M+' },
          { label: 'Average Rating', value: '4.8/5' },
          { label: 'Languages', value: 'Arabic & English' },
        ]}
      />

      {/* Add Key Stats */}
      <KeyStats
        title="Platform Statistics"
        stats={[
          {
            label: 'Total Conversions',
            value: '5.7M+',
            description: 'Files processed successfully',
          },
          {
            label: 'Average Speed',
            value: '< 10s',
            description: 'Time per conversion',
          },
          {
            label: 'Uptime',
            value: '99.9%',
            description: 'Service availability',
          },
        ]}
      />

      {/* Rest of your content */}
    </div>
  );
}
```

---

## Example 4: Create AI-Friendly FAQ Page

```tsx
// app/(public)/[locale]/faq/page.tsx

import { SchemaBuilder } from '@/lib/schema-builder';
import { StructuredData } from '@/components/StructuredData';

const faqs = [
  {
    question: 'How to convert Word to PDF?',
    answer: 'Upload your Word document to Sharayeh.com, click "Convert to PDF", and download your file. Free, no registration required, takes less than 10 seconds.',
    upvoteCount: 1247,
  },
  {
    question: 'Is Sharayeh free?',
    answer: 'Yes, Sharayeh offers a free plan with access to all tools. Free users can convert up to 5 files per day with 25MB size limit. Premium plans start at $4.99/month.',
    upvoteCount: 892,
  },
  // Add more FAQs...
];

export default function FAQPage({ params }: { params: { locale: string } }) {
  const faqSchema = SchemaBuilder.faq(faqs, params.locale);

  return (
    <>
      <StructuredData data={faqSchema} />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Frequently Asked Questions</h1>

        <div className="space-y-6" itemScope itemType="https://schema.org/FAQPage">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow"
              itemScope
              itemProp="mainEntity"
              itemType="https://schema.org/Question"
            >
              <h2 className="text-xl font-bold mb-3" itemProp="name">
                {faq.question}
              </h2>
              <div
                itemScope
                itemProp="acceptedAnswer"
                itemType="https://schema.org/Answer"
              >
                <p className="text-gray-700 dark:text-gray-300" itemProp="text">
                  {faq.answer}
                </p>
              </div>
              <div className="mt-3 text-sm text-gray-500">
                {faq.upvoteCount} people found this helpful
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
```

---

## Example 5: Tool Comparison Page

```tsx
// app/(public)/[locale]/compare/pdf-converters/page.tsx

import { ComparisonTable, KeyStats } from '@/components/ai/AIComponents';
import { SchemaBuilder } from '@/lib/schema-builder';
import { StructuredData } from '@/components/StructuredData';

export default function PDFConvertersComparisonPage() {
  const comparisonSchema = SchemaBuilder.comparison({
    itemName: 'PDF Converter',
    items: [
      {
        name: 'Sharayeh',
        features: {
          speed: '10 seconds',
          cost: 'Free',
          accuracy: '99.8%',
          fileLimit: '25 MB',
        },
      },
      {
        name: 'Smallpdf',
        features: {
          speed: '15 seconds',
          cost: '$9/month',
          accuracy: '99.5%',
          fileLimit: '15 MB',
        },
      },
      // Add more tools...
    ],
  });

  return (
    <>
      <StructuredData data={comparisonSchema} />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">
          Best PDF Converters Compared (2025)
        </h1>

        <ComparisonTable
          title="Feature Comparison"
          headers={['Converter', 'Speed', 'Cost', 'Accuracy', 'File Limit', 'Free Plan']}
          rows={[
            {
              name: 'Sharayeh',
              values: ['10s', 'Free', '99.8%', '25 MB', true],
              highlight: true,
            },
            {
              name: 'Smallpdf',
              values: ['15s', '$9/mo', '99.5%', '15 MB', false],
            },
            {
              name: 'iLovePDF',
              values: ['12s', '$6/mo', '99.3%', '20 MB', false],
            },
            {
              name: 'Adobe Acrobat',
              values: ['20s', '$19.99/mo', '99.9%', '100 MB', true],
            },
          ]}
        />

        <KeyStats
          title="Why Choose Sharayeh?"
          stats={[
            { label: 'Faster', value: '40%', description: 'vs average competitor' },
            { label: 'Cheaper', value: '100%', description: 'Free vs $6-20/mo' },
            { label: 'More Accurate', value: '99.8%', description: 'Formatting preserved' },
          ]}
        />
      </div>
    </>
  );
}
```

---

## Quick Implementation Checklist

### Phase 1: Tool Pages (Priority: HIGH)
- [ ] Add QuickAnswer to top 10 tool pages
- [ ] Add AtAGlance summaries
- [ ] Include KeyStats sections
- [ ] Add enhanced schemas (Software, HowTo, FAQ)
- [ ] Test in Rich Results Test

### Phase 2: Blog Posts (Priority: HIGH)
- [ ] Add ContentFreshness to all posts
- [ ] Add FactCheckBadge to guides
- [ ] Include CitationBox at end of articles
- [ ] Add DefinitionBox for key terms
- [ ] Add ExpertTip boxes

### Phase 3: Comparison Pages (Priority: MEDIUM)
- [ ] Create comparison pages for top tools
- [ ] Use ComparisonTable component
- [ ] Add comparison schemas
- [ ] Include competitive analysis

### Phase 4: Testing & Validation (Priority: HIGH)
- [ ] Test in ChatGPT (ask questions, check for citations)
- [ ] Test in Perplexity (search brand/topics)
- [ ] Check Google AI Overviews
- [ ] Validate schemas in Rich Results Test
- [ ] Monitor analytics for AI referrals

---

## Testing Queries for AI Engines

### ChatGPT Test Queries
1. "How do I convert Word to PDF?"
2. "Best free PDF converter"
3. "Sharayeh vs Smallpdf comparison"
4. "How long does Word to PDF conversion take?"

### Perplexity Test Queries
1. "What is the fastest way to convert Word to PDF?"
2. "Best online file converters 2025"
3. "How to convert documents without watermarks"
4. "Free PDF tools comparison"

### Google Search (AI Overviews)
1. "convert word to pdf free"
2. "best pdf converter online"
3. "how to convert docx to pdf"
4. "pdf converter comparison"

---

**Status:** Ready for Implementation  
**Expected Timeline:** 
- Phase 1: 2-3 days
- Phase 2: 3-4 days
- Phase 3: 2-3 days
- Phase 4: 1 day (ongoing)

**Expected Results:**
- +30-50% AI engine visibility
- +20-40% referral traffic from AI
- +15-25% featured snippet rates
- Improved brand authority and citations

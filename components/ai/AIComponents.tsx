/**
 * AI-Optimized Content Components
 * 
 * Reusable React components for GEO/AEO/LLMO optimization:
 * - Quick Answer boxes
 * - Key Statistics callouts
 * - Comparison tables
 * - Citation boxes
 * - Definition boxes
 * 
 * Created: October 6, 2025
 */

import React from 'react';
import { cn } from '@/lib/utils';

// ============================================================================
// QUICK ANSWER BOX
// ============================================================================

interface QuickAnswerProps {
  question: string;
  answer: string;
  steps?: string[];
  keyFacts?: { label: string; value: string }[];
  className?: string;
}

export function QuickAnswer({
  question,
  answer,
  steps,
  keyFacts,
  className,
}: QuickAnswerProps) {
  return (
    <div
      className={cn(
        'rounded-lg border-2 border-primary/20 bg-primary/5 p-6 my-8',
        className
      )}
      role="complementary"
      aria-label="Quick Answer"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
          ✓
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold mb-3 text-primary">Quick Answer</h2>
          
          <div className="mb-4">
            <p className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {question}
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {answer}
            </p>
          </div>

          {steps && steps.length > 0 && (
            <div className="mb-4">
              <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-2">
                Key Steps:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-gray-700 dark:text-gray-300">
                {steps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </div>
          )}

          {keyFacts && keyFacts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-primary/20">
              {keyFacts.map((fact, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {fact.label}:
                  </span>
                  <span className="text-sm font-bold text-primary">
                    {fact.value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// KEY STATISTICS BOX
// ============================================================================

interface KeyStatsProps {
  title?: string;
  stats: Array<{
    label: string;
    value: string | number;
    description?: string;
  }>;
  className?: string;
}

export function KeyStats({ title = 'Key Statistics', stats, className }: KeyStatsProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 my-8',
        className
      )}
    >
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <span className="text-2xl">📊</span>
        {title}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="flex flex-col p-4 rounded-lg bg-gray-50 dark:bg-gray-800"
          >
            <div className="text-3xl font-bold text-primary mb-1">
              {stat.value}
            </div>
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
              {stat.label}
            </div>
            {stat.description && (
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {stat.description}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// COMPARISON TABLE
// ============================================================================

interface ComparisonTableProps {
  title: string;
  headers: string[];
  rows: Array<{
    name: string;
    values: (string | number | boolean)[];
    highlight?: boolean;
  }>;
  className?: string;
}

export function ComparisonTable({
  title,
  headers,
  rows,
  className,
}: ComparisonTableProps) {
  return (
    <div className={cn('my-8', className)}>
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <div className="overflow-x-auto">
        <table
          className="w-full border-collapse rounded-lg overflow-hidden"
          role="table"
          aria-label={title}
        >
          <thead>
            <tr className="bg-primary/10">
              {headers.map((header, index) => (
                <th
                  key={index}
                  scope="col"
                  className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={cn(
                  'border-t border-gray-200 dark:border-gray-800',
                  row.highlight && 'bg-primary/5',
                  rowIndex % 2 === 0 && !row.highlight && 'bg-gray-50 dark:bg-gray-900'
                )}
              >
                <th
                  scope="row"
                  className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100"
                >
                  {row.name}
                  {row.highlight && (
                    <span className="ml-2 text-xs bg-primary text-white px-2 py-0.5 rounded">
                      Recommended
                    </span>
                  )}
                </th>
                {row.values.map((value, valueIndex) => (
                  <td
                    key={valueIndex}
                    data-label={headers[valueIndex + 1]}
                    className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300"
                  >
                    {typeof value === 'boolean' ? (
                      value ? (
                        <span className="text-green-600 dark:text-green-400">✓</span>
                      ) : (
                        <span className="text-red-600 dark:text-red-400">✗</span>
                      )
                    ) : (
                      value
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================================
// DEFINITION BOX
// ============================================================================

interface DefinitionBoxProps {
  term: string;
  definition: string;
  examples?: string[];
  className?: string;
}

export function DefinitionBox({
  term,
  definition,
  examples,
  className,
}: DefinitionBoxProps) {
  return (
    <div
      className={cn(
        'rounded-lg border-l-4 border-primary bg-gray-50 dark:bg-gray-900 p-6 my-6',
        className
      )}
      role="definition"
    >
      <h3 className="text-lg font-bold mb-2">
        <dfn className="not-italic text-primary">{term}</dfn>
      </h3>
      <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
        {definition}
      </p>
      {examples && examples.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Examples:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
            {examples.map((example, index) => (
              <li key={index}>{example}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// CITATION BOX
// ============================================================================

interface CitationBoxProps {
  title: string;
  url: string;
  publishDate: string;
  className?: string;
}

export function CitationBox({
  title,
  url,
  publishDate,
  className,
}: CitationBoxProps) {
  const siteTitle = 'Sharayeh';
  const formattedDate = new Date(publishDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const apaFormat = `${siteTitle}. (${new Date(publishDate).getFullYear()}, ${new Date(publishDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}). ${title}. ${url}`;
  
  const mlaFormat = `"${title}." ${siteTitle}, ${formattedDate}, ${url}.`;

  return (
    <div
      className={cn(
        'rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-6 my-8',
        className
      )}
      role="complementary"
    >
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <span className="text-xl">📖</span>
        Cite This Article
      </h3>
      
      <div className="space-y-4">
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
            APA Format:
          </p>
          <pre className="text-xs bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700 overflow-x-auto">
            {apaFormat}
          </pre>
        </div>
        
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
            MLA Format:
          </p>
          <pre className="text-xs bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700 overflow-x-auto">
            {mlaFormat}
          </pre>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// FACT-CHECK BADGE
// ============================================================================

interface FactCheckBadgeProps {
  verificationDate: string;
  method?: string;
  className?: string;
}

export function FactCheckBadge({
  verificationDate,
  method = 'Direct product testing and user review analysis',
  className,
}: FactCheckBadgeProps) {
  const formattedDate = new Date(verificationDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800',
        className
      )}
      role="complementary"
    >
      <span className="text-green-600 dark:text-green-400 text-lg">✓</span>
      <div>
        <p className="text-sm font-semibold text-green-900 dark:text-green-100">
          Fact-Checked Content
        </p>
        <p className="text-xs text-green-700 dark:text-green-300">
          Verified: {formattedDate}
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// CONTENT FRESHNESS BADGE
// ============================================================================

interface ContentFreshnessProps {
  publishDate: string;
  lastUpdated: string;
  nextReview?: string;
  className?: string;
}

export function ContentFreshness({
  publishDate,
  lastUpdated,
  nextReview,
  className,
}: ContentFreshnessProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 my-6',
        className
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-gray-400">📅</span>
        <time dateTime={publishDate} itemProp="datePublished">
          Published: {new Date(publishDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </time>
      </div>
      
      <div className="flex items-center gap-2">
        <span className="text-gray-400">🔄</span>
        <time dateTime={lastUpdated} itemProp="dateModified">
          Last Updated: {new Date(lastUpdated).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </time>
      </div>
      
      {nextReview && (
        <div className="flex items-center gap-2">
          <span className="text-gray-400">🔍</span>
          <span>
            Next Review: {new Date(nextReview).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
            })}
          </span>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// EXPERT TIP BOX
// ============================================================================

interface ExpertTipProps {
  tip: string;
  title?: string;
  className?: string;
}

export function ExpertTip({ tip, title = 'Expert Tip', className }: ExpertTipProps) {
  return (
    <div
      className={cn(
        'rounded-lg border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 my-6',
        className
      )}
      role="complementary"
    >
      <div className="flex items-start gap-3">
        <span className="flex-shrink-0 text-2xl">💡</span>
        <div>
          <p className="text-sm font-bold text-yellow-900 dark:text-yellow-100 mb-1">
            {title}
          </p>
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            {tip}
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// AT A GLANCE BOX
// ============================================================================

interface AtAGlanceProps {
  items: Array<{
    label: string;
    value: string | number;
  }>;
  className?: string;
}

export function AtAGlance({ items, className }: AtAGlanceProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-gray-200 dark:border-gray-800 bg-gradient-to-br from-primary/5 to-primary/10 p-6 my-8',
        className
      )}
    >
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <span className="text-2xl">👁️</span>
        At a Glance
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex justify-between items-center p-3 rounded bg-white dark:bg-gray-900"
          >
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {item.label}
            </span>
            <span className="text-sm font-bold text-primary">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export const AIComponents = {
  QuickAnswer,
  KeyStats,
  ComparisonTable,
  DefinitionBox,
  CitationBox,
  FactCheckBadge,
  ContentFreshness,
  ExpertTip,
  AtAGlance,
};

export default AIComponents;

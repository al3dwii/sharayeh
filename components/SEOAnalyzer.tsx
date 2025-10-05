'use client';

import { useState } from 'react';

interface SEOAnalysis {
  score: number;
  issues: string[];
  warnings: string[];
  passed: string[];
}

export default function SEOAnalyzer() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<SEOAnalysis | null>(null);

  const analyzePage = async () => {
    if (!url) return;
    
    setLoading(true);
    try {
      // Fetch the page HTML
      const response = await fetch(url);
      const html = await response.text();
      
      // Parse and analyze
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      const issues: string[] = [];
      const warnings: string[] = [];
      const passed: string[] = [];
      
      // Check title
      const title = doc.querySelector('title')?.textContent || '';
      if (!title) {
        issues.push('Missing <title> tag');
      } else if (title.length < 30) {
        warnings.push(`Title too short (${title.length} chars, recommended: 50-60)`);
      } else if (title.length > 60) {
        warnings.push(`Title too long (${title.length} chars, recommended: 50-60)`);
      } else {
        passed.push('Title length is optimal');
      }
      
      // Check meta description
      const description = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
      if (!description) {
        issues.push('Missing meta description');
      } else if (description.length < 120) {
        warnings.push(`Description too short (${description.length} chars, recommended: 150-160)`);
      } else if (description.length > 160) {
        warnings.push(`Description too long (${description.length} chars, recommended: 150-160)`);
      } else {
        passed.push('Meta description length is optimal');
      }
      
      // Check canonical
      const canonical = doc.querySelector('link[rel="canonical"]');
      if (!canonical) {
        issues.push('Missing canonical URL');
      } else {
        passed.push('Canonical URL present');
      }
      
      // Check Open Graph
      const ogTitle = doc.querySelector('meta[property="og:title"]');
      const ogDescription = doc.querySelector('meta[property="og:description"]');
      const ogImage = doc.querySelector('meta[property="og:image"]');
      
      if (!ogTitle || !ogDescription || !ogImage) {
        warnings.push('Incomplete Open Graph tags');
      } else {
        passed.push('Open Graph tags present');
      }
      
      // Check structured data
      const jsonLd = doc.querySelectorAll('script[type="application/ld+json"]');
      if (jsonLd.length === 0) {
        warnings.push('No structured data found');
      } else {
        passed.push(`${jsonLd.length} structured data blocks found`);
      }
      
      // Check headings
      const h1 = doc.querySelectorAll('h1');
      if (h1.length === 0) {
        issues.push('No H1 heading found');
      } else if (h1.length > 1) {
        warnings.push(`Multiple H1 headings found (${h1.length})`);
      } else {
        passed.push('Single H1 heading present');
      }
      
      // Check images
      const images = doc.querySelectorAll('img');
      let imagesWithoutAlt = 0;
      images.forEach((img) => {
        if (!img.getAttribute('alt')) {
          imagesWithoutAlt++;
        }
      });
      
      if (imagesWithoutAlt > 0) {
        issues.push(`${imagesWithoutAlt} images missing alt text`);
      } else if (images.length > 0) {
        passed.push('All images have alt text');
      }
      
      // Check robots meta
      const robots = doc.querySelector('meta[name="robots"]')?.getAttribute('content') || '';
      if (robots.includes('noindex')) {
        warnings.push('Page is set to noindex');
      } else {
        passed.push('Page is indexable');
      }
      
      // Check hreflang
      const hreflang = doc.querySelectorAll('link[rel="alternate"][hreflang]');
      if (hreflang.length === 0) {
        warnings.push('No hreflang tags found (important for bilingual sites)');
      } else {
        passed.push(`${hreflang.length} hreflang tags found`);
      }
      
      // Calculate score
      const totalChecks = issues.length + warnings.length + passed.length;
      const score = Math.round((passed.length / totalChecks) * 100);
      
      setAnalysis({
        score,
        issues,
        warnings,
        passed,
      });
    } catch (error) {
      console.error('Error analyzing page:', error);
      setAnalysis({
        score: 0,
        issues: ['Failed to fetch or parse the page'],
        warnings: [],
        passed: [],
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-3xl font-bold">SEO Analyzer</h1>
      
      <div className="mb-6 flex gap-4">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://sharayeh.com/en/tools/word-to-pdf"
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2"
        />
        <button
          onClick={analyzePage}
          disabled={loading || !url}
          className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Analyzing...' : 'Analyze'}
        </button>
      </div>

      {analysis && (
        <div className="space-y-6">
          {/* Score */}
          <div className="rounded-lg border border-gray-200 p-6 text-center">
            <div className="mb-2 text-5xl font-bold">
              <span
                className={
                  analysis.score >= 80
                    ? 'text-green-600'
                    : analysis.score >= 60
                    ? 'text-yellow-600'
                    : 'text-red-600'
                }
              >
                {analysis.score}
              </span>
              <span className="text-2xl text-gray-500">/100</span>
            </div>
            <p className="text-gray-600">SEO Score</p>
          </div>

          {/* Issues */}
          {analysis.issues.length > 0 && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-6">
              <h2 className="mb-4 flex items-center text-xl font-semibold text-red-800">
                <span className="mr-2">🔴</span>
                Critical Issues ({analysis.issues.length})
              </h2>
              <ul className="space-y-2">
                {analysis.issues.map((issue, i) => (
                  <li key={i} className="text-red-700">
                    • {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Warnings */}
          {analysis.warnings.length > 0 && (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6">
              <h2 className="mb-4 flex items-center text-xl font-semibold text-yellow-800">
                <span className="mr-2">⚠️</span>
                Warnings ({analysis.warnings.length})
              </h2>
              <ul className="space-y-2">
                {analysis.warnings.map((warning, i) => (
                  <li key={i} className="text-yellow-700">
                    • {warning}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Passed */}
          {analysis.passed.length > 0 && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-6">
              <h2 className="mb-4 flex items-center text-xl font-semibold text-green-800">
                <span className="mr-2">✅</span>
                Passed Checks ({analysis.passed.length})
              </h2>
              <ul className="space-y-2">
                {analysis.passed.map((check, i) => (
                  <li key={i} className="text-green-700">
                    • {check}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Quick Tips */}
      <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-6">
        <h2 className="mb-4 text-xl font-semibold text-blue-800">💡 SEO Quick Tips</h2>
        <ul className="space-y-2 text-blue-700">
          <li>• Title: 50-60 characters with primary keyword</li>
          <li>• Description: 150-160 characters, compelling & informative</li>
          <li>• One H1 per page, use H2-H6 for structure</li>
          <li>• All images need descriptive alt text</li>
          <li>• Canonical URL should match the actual URL</li>
          <li>• Include Open Graph for social sharing</li>
          <li>• Add structured data for rich results</li>
          <li>• Use hreflang for multilingual content</li>
        </ul>
      </div>
    </div>
  );
}

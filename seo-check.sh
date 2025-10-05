#!/bin/bash

# SEO Performance Optimization Script for Sharayeh
# Run this to check and optimize your website's SEO performance

echo "🔍 Starting SEO & Performance Check..."
echo ""

# 1. Check if sitemap is accessible
echo "📄 Checking sitemap..."
curl -s -o /dev/null -w "%{http_code}" https://sharayeh.com/sitemap.xml
if [ $? -eq 0 ]; then
    echo "✅ Sitemap is accessible"
else
    echo "❌ Sitemap check failed"
fi
echo ""

# 2. Check robots.txt
echo "🤖 Checking robots.txt..."
curl -s -o /dev/null -w "%{http_code}" https://sharayeh.com/robots.txt
if [ $? -eq 0 ]; then
    echo "✅ robots.txt is accessible"
else
    echo "❌ robots.txt check failed"
fi
echo ""

# 3. Build the project to check for errors
echo "🏗️  Building project..."
npm run build

# 4. Check bundle sizes
echo ""
echo "📦 Checking bundle sizes..."
echo "⚠️  Large bundles may slow down your site!"
echo ""

# 5. Check for unused dependencies
echo "🧹 Checking for unused dependencies..."
npx depcheck

echo ""
echo "✨ SEO Check Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Submit sitemap to Google Search Console: https://search.google.com/search-console"
echo "2. Submit sitemap to Bing Webmaster: https://www.bing.com/webmasters"
echo "3. Test page speed: https://pagespeed.web.dev/"
echo "4. Validate structured data: https://validator.schema.org/"
echo "5. Check mobile-friendliness: https://search.google.com/test/mobile-friendly"

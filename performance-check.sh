#!/bin/bash

# Performance Optimization Script for Sharayeh
# Run this to check and optimize your website's performance

echo "🚀 Sharayeh Performance Optimization Script"
echo "==========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if commands exist
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}❌ $1 is not installed${NC}"
        return 1
    fi
    echo -e "${GREEN}✓ $1 is installed${NC}"
    return 0
}

echo "📋 Checking prerequisites..."
check_command node
check_command npm
echo ""

# 1. Bundle Size Analysis
echo "📦 Analyzing bundle size..."
if [ "$ANALYZE" = "true" ]; then
    npm run build
else
    echo -e "${YELLOW}⚠️  Skipping bundle analysis. Run with ANALYZE=true for detailed analysis.${NC}"
fi
echo ""

# 2. Find unoptimized images
echo "🖼️  Checking for unoptimized images..."
LARGE_IMAGES=$(find public -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" \) -size +500k 2>/dev/null)
if [ -z "$LARGE_IMAGES" ]; then
    echo -e "${GREEN}✓ No large images found${NC}"
else
    echo -e "${YELLOW}⚠️  Found large images (>500KB):${NC}"
    echo "$LARGE_IMAGES"
    echo ""
    echo "Consider optimizing these images:"
    echo "  npx @squoosh/cli --resize '{\"width\":1200}' --webp '{\"quality\":85}' public/*.jpg"
fi
echo ""

# 3. Check for unused dependencies
echo "📦 Checking for unused dependencies..."
if check_command depcheck; then
    npx depcheck --ignores="@types/*,eslint-*"
else
    echo -e "${YELLOW}⚠️  Install depcheck: npm install -g depcheck${NC}"
fi
echo ""

# 4. Check image usage
echo "🎨 Checking image optimization in code..."
IMG_COUNT=$(grep -r "<img" app components --include="*.tsx" --include="*.jsx" 2>/dev/null | wc -l)
NEXT_IMAGE_COUNT=$(grep -r "next/image" app components --include="*.tsx" --include="*.jsx" 2>/dev/null | wc -l)

echo "  <img> tags found: $IMG_COUNT"
echo "  Next.js Image components: $NEXT_IMAGE_COUNT"

if [ $IMG_COUNT -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Found $IMG_COUNT <img> tags. Consider replacing with Next.js Image component.${NC}"
    echo ""
    echo "Locations:"
    grep -r "<img" app components --include="*.tsx" --include="*.jsx" -n | head -n 10
fi
echo ""

# 5. Check for console.log statements
echo "🐛 Checking for console.log statements (should be removed in production)..."
CONSOLE_LOGS=$(grep -r "console\.log\|console\.warn\|console\.error" app components lib --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" 2>/dev/null | grep -v "// console" | wc -l)
if [ $CONSOLE_LOGS -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Found $CONSOLE_LOGS console statements${NC}"
    grep -r "console\.log\|console\.warn\|console\.error" app components lib --include="*.ts" --include="*.tsx" -n | head -n 5
else
    echo -e "${GREEN}✓ No console statements found${NC}"
fi
echo ""

# 6. Check build output
echo "🏗️  Build size summary..."
if [ -d ".next" ]; then
    echo "Next.js build directory size:"
    du -sh .next
    echo ""
    echo "Largest chunks:"
    find .next -type f -name "*.js" -exec ls -lh {} \; | sort -k5 -hr | head -n 5
else
    echo -e "${YELLOW}⚠️  No .next directory found. Run 'npm run build' first.${NC}"
fi
echo ""

# 7. Performance recommendations
echo "💡 Performance Recommendations:"
echo ""
echo "1. Images:"
echo "   - Convert JPG/PNG to WebP format"
echo "   - Use Next.js Image component with loading='lazy'"
echo "   - Add width and height attributes"
echo ""
echo "2. Code Splitting:"
echo "   - Use dynamic imports for heavy components"
echo "   - Example: const Heavy = dynamic(() => import('./Heavy'))"
echo ""
echo "3. Caching:"
echo "   - Add Cache-Control headers in next.config.mjs"
echo "   - Use revalidate in API routes"
echo ""
echo "4. Fonts:"
echo "   - Use next/font for automatic optimization"
echo "   - Set display: 'swap' to prevent layout shift"
echo ""
echo "5. Third-party Scripts:"
echo "   - Load analytics async"
echo "   - Defer non-critical scripts"
echo ""

# 8. Quick wins
echo "⚡ Quick Performance Wins:"
echo ""
echo "Run these commands:"
echo "  npm run build          # Check build size"
echo "  npx lighthouse https://sharayeh.com --view"
echo "  npx @next/bundle-analyzer"
echo ""

# 9. Core Web Vitals check
echo "🎯 Core Web Vitals Targets:"
echo "  ✓ LCP (Largest Contentful Paint): < 2.5s"
echo "  ✓ FID (First Input Delay): < 100ms"
echo "  ✓ CLS (Cumulative Layout Shift): < 0.1"
echo ""
echo "Test at: https://pagespeed.web.dev/"
echo ""

# 10. Summary
echo "✨ Summary:"
echo "==========="
echo "Total issues found: $(($IMG_COUNT + $CONSOLE_LOGS))"
echo ""
echo "Priority actions:"
echo "1. Replace <img> tags with Next.js Image"
echo "2. Optimize large images"
echo "3. Remove console.log statements"
echo "4. Run Lighthouse audit"
echo "5. Implement lazy loading"
echo ""

echo "📚 Next Steps:"
echo "1. Review TOP_3_SEO_UPDATES.md for detailed instructions"
echo "2. Implement RelatedTools component on tool pages"
echo "3. Create first long-form content piece"
echo "4. Monitor Google Search Console"
echo ""

echo "✅ Performance check complete!"

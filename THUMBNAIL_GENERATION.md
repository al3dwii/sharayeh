# 🖼️ PowerPoint Template Thumbnail Generation

This guide explains how to automatically generate thumbnail previews for PowerPoint templates stored in S3.

## 📋 Overview

The thumbnail generation system:
- ✅ Scans S3 bucket for `.pptx` files
- ✅ Extracts the first slide's image
- ✅ Generates 800x600px PNG thumbnails
- ✅ Uploads thumbnails to S3 with same name but `.png` extension
- ✅ Falls back to placeholder if extraction fails
- ✅ Skips files that already have thumbnails

## 🚀 Quick Start

### 1. Generate Thumbnails for All Templates

```bash
npm run generate-thumbnails
```

### 2. Generate for Specific Category

```bash
npm run generate-thumbnails -- --category=business
npm run generate-thumbnails -- --category=education
npm run generate-thumbnails -- --category=children
npm run generate-thumbnails -- --category=collection
```

### 3. Dry Run (Test Without Uploading)

```bash
npm run generate-thumbnails -- --dry-run
```

## 📁 How It Works

### File Structure

**Before:**
```
s3://isharayeh/
  business/
    template1.pptx
    template2.pptx
  education/
    lesson1.pptx
```

**After:**
```
s3://isharayeh/
  business/
    template1.pptx
    template1.png      ← Generated thumbnail
    template2.pptx
    template2.png      ← Generated thumbnail
  education/
    lesson1.pptx
    lesson1.png        ← Generated thumbnail
```

### Thumbnail Generation Process

1. **Extract Image**: Opens PPTX file (it's a ZIP), looks for first slide image in `ppt/media/`
2. **Resize**: Resizes to 800x600px with white background, maintaining aspect ratio
3. **Fallback**: If no image found, creates colored placeholder with template name
4. **Upload**: Saves as PNG to S3 with same path but `.png` extension

### API Integration

The API (`/api/templates`) automatically:
- ✅ Checks for thumbnail file (`.png`) for each `.pptx`
- ✅ Returns signed URL to thumbnail if it exists
- ✅ Falls back to `/logo.png` if thumbnail doesn't exist

## 🎨 Placeholder Thumbnails

If a PPTX file has no extractable images, a colored placeholder is generated:

| Category   | Color  |
|------------|--------|
| business   | Blue   |
| education  | Green  |
| children   | Amber  |
| collection | Purple |

## ⚙️ Configuration

Edit `scripts/generate-thumbnails.ts`:

```typescript
const THUMBNAIL_WIDTH = 800;   // Default: 800px
const THUMBNAIL_HEIGHT = 600;  // Default: 600px
```

## 🔧 Troubleshooting

### Thumbnails Not Showing Up

1. **Check if thumbnails exist in S3:**
   ```bash
   aws s3 ls s3://isharayeh/business/ --recursive | grep .png
   ```

2. **Check API response:**
   ```bash
   curl https://sharayeh.com/ar/api/templates | jq '.templates[0].preview'
   ```

3. **Check Next.js Image domains** in `next.config.mjs`:
   ```javascript
   images: {
     domains: ['isharayeh.s3.eu-north-1.amazonaws.com'],
   }
   ```

### Re-generate Specific Thumbnails

Delete the `.png` file from S3, then run:
```bash
npm run generate-thumbnails -- --category=business
```

### Check Logs

The script outputs detailed logs:
- 📄 File being processed
- 📥 Download progress
- 🖼️ Extraction status
- ✂️ Thumbnail generation
- 📤 Upload status

## 📊 Best Practices

1. **Run after uploading new templates:**
   ```bash
   # Upload new PPTX files to S3
   aws s3 cp new-template.pptx s3://isharayeh/business/
   
   # Generate thumbnail
   npm run generate-thumbnails -- --category=business
   ```

2. **Automate with CI/CD:** Add to your deployment pipeline
3. **Monitor S3 costs:** Thumbnails are small (~50-200KB each)
4. **Use CloudFront:** For faster thumbnail delivery (optional)

## 🔐 Required Permissions

Ensure your AWS credentials have:
- `s3:GetObject` - Download PPTX files
- `s3:PutObject` - Upload thumbnails
- `s3:ListBucket` - List templates

## 📝 Example Output

```
🚀 PowerPoint Template Thumbnail Generator
==========================================

📦 Bucket: isharayeh
🌍 Region: eu-north-1
📐 Thumbnail Size: 800x600px

📂 Found 4 categories: business, education, children, collection

📁 Processing category: business
──────────────────────────────────────────────────
  Found 5 PPTX files

📄 Processing: business/template1.pptx
  📥 Downloading PPTX...
  🖼️  Extracting first slide...
  ✂️  Generating thumbnail...
  📤 Uploading thumbnail to: business/template1.png
  ✅ Thumbnail uploaded successfully!

...

✨ Thumbnail Generation Complete!
=================================
📊 Total Processed: 20
✅ Successful: 20
❌ Failed: 0
```

## 🆘 Support

If you encounter issues:
1. Check AWS credentials in `.env`
2. Verify S3 bucket access permissions
3. Ensure PPTX files are valid PowerPoint files
4. Check Node.js version (requires Node 18+)

---

**Last Updated:** October 7, 2025

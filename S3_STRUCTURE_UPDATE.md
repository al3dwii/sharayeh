# 🔄 S3 Template Structure Update

## ✅ Changes Made

### Old Structure (Tier-Based):
```
s3://isharayeh/
├── free/
│   ├── business/
│   ├── education/
│   └── children/
├── standard/
│   ├── business/
│   └── education/
└── premium/
    └── business/
```

### New Structure (Category-Based):
```
s3://isharayeh/
├── business/
│   ├── template1.pptx
│   ├── template2.pptx
│   └── template3.pptx
├── education/
│   ├── template1.pptx
│   └── template2.pptx
├── children/
│   ├── template1.pptx
│   └── template2.pptx
└── collection/
    ├── template1.pptx
    └── template2.pptx
```

---

## 📋 What Changed

### 1. API Code (`app/(public)/[locale]/api/templates/route.ts`)
- ✅ Removed tier-based folder logic
- ✅ Removed `getHighestUserTier` import
- ✅ Removed `Tier` type definition
- ✅ Now lists category folders at root level
- ✅ All users see all templates (no restrictions)

**Before:**
```typescript
// User tier determines which folder to access
const folderPrefix = FOLDER_PREFIXES[userTier]; // 'free', 'standard', or 'premium'
Prefix: `${folderPrefix}/`, // e.g., 'free/'
```

**After:**
```typescript
// All users see all templates from root level
Delimiter: '/', // Lists folders at root: business/, education/, etc.
```

### 2. Environment Variables (`.env`)
**Removed:**
```bash
FREE_TEMPLATES_FOLDER=free
STANDARD_TEMPLATES_FOLDER=standard
PREMIUM_TEMPLATES_FOLDER=premium
```

**Kept:**
```bash
AWS_REGION=eu-north-1
AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_ACCESS_KEY
AWS_S3_BUCKET_NAME=isharayeh
```

---

## 🗂️ S3 Bucket Setup Instructions

### Step 1: Reorganize Your S3 Bucket

You need to move all templates from tier folders to category folders:

#### Option A: Manual Move (AWS Console)
1. Go to AWS S3 Console: https://s3.console.aws.amazon.com/s3/buckets/isharayeh
2. Create new folders at root level:
   - `business/`
   - `education/`
   - `children/`
   - `collection/`
3. Move templates from old structure to new:
   - `free/business/template1.pptx` → `business/template1.pptx`
   - `free/education/template1.pptx` → `education/template1.pptx`
   - `standard/business/template2.pptx` → `business/template2.pptx`
   - etc.
4. Delete old empty folders: `free/`, `standard/`, `premium/`

#### Option B: AWS CLI (Automated)
```bash
# Copy all templates to new structure
aws s3 cp s3://isharayeh/free/business/ s3://isharayeh/business/ --recursive
aws s3 cp s3://isharayeh/free/education/ s3://isharayeh/education/ --recursive
aws s3 cp s3://isharayeh/standard/business/ s3://isharayeh/business/ --recursive
aws s3 cp s3://isharayeh/premium/business/ s3://isharayeh/business/ --recursive

# Delete old tier folders (after verifying new structure)
aws s3 rm s3://isharayeh/free/ --recursive
aws s3 rm s3://isharayeh/standard/ --recursive
aws s3 rm s3://isharayeh/premium/ --recursive
```

### Step 2: Verify New Structure
```bash
# List all folders at root level
aws s3 ls s3://isharayeh/

# Expected output:
#                            PRE business/
#                            PRE children/
#                            PRE collection/
#                            PRE education/
```

### Step 3: Check Templates in Each Category
```bash
# List templates in business category
aws s3 ls s3://isharayeh/business/

# Expected output:
# 2025-01-07 10:30:45    1234567 template1.pptx
# 2025-01-07 10:31:22    2345678 template2.pptx
```

---

## 🚀 Deployment Updates

### Production Environment Variables (Vercel)

**Remove these variables** (if they exist):
- ❌ `FREE_TEMPLATES_FOLDER`
- ❌ `STANDARD_TEMPLATES_FOLDER`
- ❌ `PREMIUM_TEMPLATES_FOLDER`

**Keep these variables**:
- ✅ `AWS_REGION=eu-north-1`
- ✅ `AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY_ID`
- ✅ `AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_ACCESS_KEY`
- ✅ `AWS_S3_BUCKET_NAME=isharayeh`

### How to Remove Variables from Vercel:
1. Go to https://vercel.com/dashboard
2. Select your project
3. Settings → Environment Variables
4. Find `FREE_TEMPLATES_FOLDER`, `STANDARD_TEMPLATES_FOLDER`, `PREMIUM_TEMPLATES_FOLDER`
5. Click **Delete** for each
6. **Redeploy** your application

---

## ✅ Benefits of New Structure

### 1. **Simpler Architecture**
- No tier logic in the code
- Easier to maintain
- Fewer environment variables

### 2. **Better User Experience**
- All users see all templates
- No confusion about access levels
- Easier template discovery

### 3. **Easier Content Management**
- Single location for each category
- No duplicate templates across tiers
- Simpler folder structure

### 4. **Future-Proof**
- Can add tier restrictions later if needed
- Can add new categories easily
- Can implement filtering by category

---

## 🧪 Testing

### Test Locally:
```bash
npm run dev
```

Then open: http://localhost:3000/en/tools/convert-image-to-pptx

Click "Choose Template" and verify:
- ✅ All 4 categories show: business, education, children, collection
- ✅ Templates load from each category
- ✅ No errors in console

### Test API Directly:
```bash
curl http://localhost:3000/api/templates | jq .
```

Expected response:
```json
{
  "templates": [
    {
      "id": "business/template1.pptx",
      "name": "template1",
      "preview": "https://isharayeh.s3.amazonaws.com/...",
      "category": "business"
    },
    {
      "id": "education/template1.pptx",
      "name": "template1",
      "preview": "https://isharayeh.s3.amazonaws.com/...",
      "category": "education"
    }
  ]
}
```

---

## 🎯 Next Steps

1. ✅ **Update S3 bucket structure** (move files to new folders)
2. ✅ **Remove old environment variables** from production
3. ✅ **Redeploy** application
4. ✅ **Test** on live site
5. ✅ **Delete old tier folders** from S3 (after confirming new structure works)

---

## 📊 Migration Checklist

- [ ] Created new folders at root: `business/`, `education/`, `children/`, `collection/`
- [ ] Moved all templates to category folders
- [ ] Verified templates in each category
- [ ] Removed `FREE_TEMPLATES_FOLDER` from Vercel
- [ ] Removed `STANDARD_TEMPLATES_FOLDER` from Vercel
- [ ] Removed `PREMIUM_TEMPLATES_FOLDER` from Vercel
- [ ] Kept AWS credentials in Vercel
- [ ] Redeployed application
- [ ] Tested API endpoint locally
- [ ] Tested API endpoint on live site
- [ ] Verified templates load in UI
- [ ] Deleted old `free/`, `standard/`, `premium/` folders from S3

---

## 🔄 Rollback Plan

If something goes wrong, you can rollback:

1. **Restore old API code** from git:
   ```bash
   git log --oneline  # Find commit before changes
   git checkout <commit-hash> -- app/(public)/[locale]/api/templates/route.ts
   ```

2. **Re-add environment variables** to Vercel:
   - `FREE_TEMPLATES_FOLDER=free`
   - `STANDARD_TEMPLATES_FOLDER=standard`
   - `PREMIUM_TEMPLATES_FOLDER=premium`

3. **Restore old S3 structure** (if you backed up files)

---

Need help with the migration? Let me know! 🚀

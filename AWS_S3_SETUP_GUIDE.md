# AWS S3 Setup Guide for Sharayeh Templates

## ✅ Migration Complete!

Your code has been updated to use AWS S3 instead of Google Drive for storing PowerPoint templates.

---

## 📋 Required: AWS Credentials Setup

You need to add your AWS credentials to the `.env` file:

### Step 1: Get Your AWS Credentials

1. **Log in to AWS Console**: https://console.aws.amazon.com/
2. **Go to IAM (Identity and Access Management)**
3. **Create a new user** (or use existing):
   - User name: `sharayeh-s3-access` (or any name)
   - Access type: ✅ Programmatic access
4. **Attach policies**:
   - ✅ `AmazonS3ReadOnlyAccess` (minimum)
   - ✅ `AmazonS3FullAccess` (if you need upload/delete)
5. **Download credentials**:
   - Access Key ID
   - Secret Access Key

### Step 2: Update `.env` File

Replace these placeholder values in your `.env` file:

```bash
# AWS S3 Configuration
AWS_REGION=us-east-1  # Change if your bucket is in a different region
AWS_ACCESS_KEY_ID=your-access-key-id  # ⬅️ REPLACE THIS
AWS_SECRET_ACCESS_KEY=your-secret-access-key  # ⬅️ REPLACE THIS
AWS_S3_BUCKET_NAME=isharayeh  # ✅ Already set

# S3 Template Folder Paths
FREE_TEMPLATES_FOLDER=free  # ✅ Already set
STANDARD_TEMPLATES_FOLDER=standard  # ✅ Already set
PREMIUM_TEMPLATES_FOLDER=premium  # ✅ Already set
```

---

## 📁 Expected S3 Folder Structure

Your S3 bucket `s3://isharayeh` should have this structure:

```
isharayeh/
├── free/
│   ├── business/
│   │   ├── template1.pptx
│   │   ├── template2.pptx
│   │   └── template3.pptx
│   ├── education/
│   │   ├── template1.pptx
│   │   └── template2.pptx
│   └── creative/
│       └── template1.pptx
├── standard/
│   ├── business/
│   │   ├── premium-template1.pptx
│   │   └── premium-template2.pptx
│   └── marketing/
│       └── template1.pptx
└── premium/
    ├── business/
    │   ├── elite-template1.pptx
    │   └── elite-template2.pptx
    └── enterprise/
        └── template1.pptx
```

**Structure Rules:**
- **Tier folders**: `free/`, `standard/`, `premium/`
- **Category subfolders**: Any name (e.g., `business`, `education`, `marketing`)
- **Template files**: `.pptx` or `.ppt` files inside category folders

---

## 🔐 S3 Bucket Permissions

Make sure your S3 bucket has the correct permissions:

### Option 1: Public Read Access (Easiest)
Add this bucket policy to allow public read:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::isharayeh/*"
    }
  ]
}
```

### Option 2: Private with Signed URLs (More Secure - Current Implementation)
Your current code uses **signed URLs** which expire after 1 hour. This is more secure.

IAM policy needed:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::isharayeh",
        "arn:aws:s3:::isharayeh/*"
      ]
    }
  ]
}
```

---

## 🧪 Testing

After updating `.env` with your AWS credentials:

1. **Restart the dev server**:
   ```bash
   npm run dev
   ```

2. **Test the API endpoint**:
   ```bash
   curl http://localhost:3001/api/templates
   ```

3. **Expected response**:
   ```json
   {
     "templates": [
       {
         "id": "free/business/template1.pptx",
         "name": "template1",
         "preview": "https://isharayeh.s3.amazonaws.com/...",
         "category": "business"
       }
     ]
   }
   ```

---

## 🚀 What Changed?

### Files Modified:
1. **`.env`** - Added AWS credentials configuration
2. **`app/(public)/[locale]/api/templates/route.ts`** - Replaced Google Drive API with AWS S3 SDK

### New Dependencies:
- `@aws-sdk/client-s3` - S3 client
- `@aws-sdk/s3-request-presigner` - For generating signed URLs

### Key Features:
- ✅ Lists templates from S3 by tier (free/standard/premium)
- ✅ Generates secure signed URLs (1-hour expiry)
- ✅ Supports category folders
- ✅ Works with guest users (defaults to free tier)
- ✅ Filters only `.pptx` and `.ppt` files

---

## ❓ Troubleshooting

### Error: "Credentials not found"
- Make sure `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` are set in `.env`
- Restart the dev server after updating `.env`

### Error: "Access Denied"
- Check IAM user has S3 read permissions
- Check bucket policy allows access

### Error: "No such bucket"
- Verify bucket name is `isharayeh`
- Check `AWS_REGION` matches your bucket's region

### Templates not showing
- Check folder structure matches the expected format
- Verify files are `.pptx` or `.ppt` format
- Check category folders exist (e.g., `free/business/`)

---

## 📊 Cost Estimation

AWS S3 pricing for `isharayeh` bucket:

- **Storage**: $0.023/GB/month
- **GET requests**: $0.0004 per 1,000 requests
- **Data transfer**: $0.09/GB (after first 100GB free)

**Example**: 10GB templates + 10,000 requests/month = ~$0.27/month

Much cheaper than Google Drive API limits! 🎉

---

## 🔄 Migration from Google Drive

If you need help migrating existing templates from Google Drive to S3, I can create a migration script. Let me know!

---

## ✅ Next Steps

1. ⬜ Add your AWS credentials to `.env`
2. ⬜ Verify S3 folder structure
3. ⬜ Set bucket permissions
4. ⬜ Test the API endpoint
5. ⬜ Test template selection in the UI

**After completing these steps, your templates will be served from AWS S3!** 🚀

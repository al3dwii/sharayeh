# 🚀 Deploy AWS Credentials to Production

## ⚠️ Issue
Your live website is getting a **500 error** when fetching templates because AWS credentials are not configured in production.

**Error**: `GET https://sharayeh.com/ar/api/templates 500 (Internal Server Error)`

---

## ✅ Solution: Add Environment Variables to Production

### For Vercel (Recommended Platform):

#### Step 1: Go to Vercel Dashboard
1. Visit: https://vercel.com/dashboard
2. Log in with your account
3. Find and click on your project (`sharayeh` or `shraih`)

#### Step 2: Navigate to Environment Variables
1. Click on **Settings** (top menu)
2. Click on **Environment Variables** (left sidebar)

#### Step 3: Add AWS Credentials
Add each of these variables one by one:

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `AWS_REGION` | `eu-north-1` | Production, Preview, Development |
| `AWS_ACCESS_KEY_ID` | `YOUR_AWS_ACCESS_KEY_ID` | Production, Preview, Development |
| `AWS_SECRET_ACCESS_KEY` | `YOUR_AWS_SECRET_ACCESS_KEY` | Production, Preview, Development |
| `AWS_S3_BUCKET_NAME` | `isharayeh` | Production, Preview, Development |

**How to add each variable:**
1. Click "Add New" button
2. Enter the **Variable Name** (e.g., `AWS_REGION`)
3. Enter the **Value** (e.g., `eu-north-1`)
4. Select environments: ☑️ Production ☑️ Preview ☑️ Development
5. Click "Save"
6. Repeat for all 4 variables

**Note:** Template folders (business, education, children, collection) are now at the root level of the S3 bucket, so no folder path variables are needed.

#### Step 4: Redeploy
After adding all variables, you MUST redeploy:

**Option A: Automatic Redeploy**
1. Go to **Deployments** tab
2. Click on the latest deployment
3. Click the **⋮** (three dots) menu
4. Click **Redeploy**
5. Click **Redeploy** again to confirm

**Option B: Git Push** (if you made code changes)
```bash
git add .
git commit -m "Add S3 integration"
git push origin main
```

Vercel will automatically redeploy on push.

---

### For Other Hosting Platforms:

#### Netlify:
1. Go to **Site settings** → **Build & deploy** → **Environment**
2. Click **Edit variables**
3. Add all 7 AWS variables listed above
4. Click **Save**
5. Go to **Deploys** → Click **Trigger deploy** → **Deploy site**

#### Railway:
1. Select your project
2. Click **Variables** tab
3. Click **+ New Variable**
4. Add all 7 AWS variables
5. Railway will auto-redeploy

#### Heroku:
1. Go to your app dashboard
2. Click **Settings** tab
3. Click **Reveal Config Vars**
4. Add all 7 AWS variables
5. App will restart automatically

#### Custom VPS/Server:
1. SSH into your server
2. Edit your environment file (usually `.env` or export in shell config)
3. Add the AWS variables
4. Restart your application:
   ```bash
   pm2 restart all
   # or
   systemctl restart your-app-name
   ```

---

## 🧪 Testing After Deployment

### 1. Check if Variables are Set
After redeployment, check your build logs for:
```
⚠️ AWS Credentials configured: true
```

If it says `false`, the variables weren't loaded properly.

### 2. Test the API Endpoint
Open your browser console on your live site and run:
```javascript
fetch('https://sharayeh.com/ar/api/templates')
  .then(r => r.json())
  .then(d => console.log(d))
```

**Expected result:**
```json
{
  "templates": [
    {
      "id": "free/business/template1.pptx",
      "name": "template1",
      "preview": "https://...",
      "category": "business"
    }
  ]
}
```

**If still error:**
```json
{
  "error": "Internal server error"
}
```
Check the server logs in Vercel dashboard.

### 3. Check Server Logs
**Vercel:**
1. Go to your project
2. Click **Deployments**
3. Click on the latest deployment
4. Click **Functions** tab
5. Find `/api/templates` and click to see logs

Look for these log messages:
- ✅ `🔍 Incoming GET request to /api/templates`
- ✅ `🟢 Resolved User Tier: free`
- ✅ `🔍 Resolved S3 Folder Prefix: free`
- ✅ `📂 Retrieved Categories: [...]`
- ✅ `📊 Total Templates Retrieved: X`

**If you see:**
- ❌ `⚠️ AWS Credentials configured: false` → Variables not loaded
- ❌ `InvalidAccessKeyId` → Wrong AWS_ACCESS_KEY_ID
- ❌ `SignatureDoesNotMatch` → Wrong AWS_SECRET_ACCESS_KEY
- ❌ `NoSuchBucket` → Wrong AWS_S3_BUCKET_NAME or region
- ❌ `AccessDenied` → IAM user doesn't have S3 permissions

---

## 🔒 Security Note

The AWS credentials you're deploying have access to your S3 bucket. Make sure:
- ✅ IAM user has only S3 permissions (not full AWS access)
- ✅ Bucket policy restricts access to specific operations
- ✅ Never commit credentials to git (they're in `.gitignore`)
- ✅ Rotate keys regularly (every 90 days recommended)

---

## 📞 Troubleshooting

### Error: "Missing credentials in config"
**Solution**: Make sure ALL environment variables are added, including:
- `AWS_REGION`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

### Error: "Region is missing"
**Solution**: Add `AWS_REGION=eu-north-1` to environment variables

### Error: "Cannot find bucket"
**Solution**: 
1. Check bucket name is exactly `isharayeh` (no typos)
2. Check region matches your bucket region (`eu-north-1`)
3. Verify bucket exists in AWS Console

### Templates not loading but no error
**Solution**:
1. Check S3 bucket has the folder structure: `free/`, `standard/`, `premium/`
2. Check folders have .pptx or .ppt files
3. Check IAM user has `s3:ListBucket` and `s3:GetObject` permissions

---

## ✅ Checklist

- [ ] Added `AWS_REGION` to production environment
- [ ] Added `AWS_ACCESS_KEY_ID` to production environment
- [ ] Added `AWS_SECRET_ACCESS_KEY` to production environment
- [ ] Added `AWS_S3_BUCKET_NAME` to production environment
- [ ] Added `FREE_TEMPLATES_FOLDER` to production environment
- [ ] Added `STANDARD_TEMPLATES_FOLDER` to production environment
- [ ] Added `PREMIUM_TEMPLATES_FOLDER` to production environment
- [ ] Selected "Production, Preview, Development" for all variables
- [ ] Clicked "Save" for each variable
- [ ] Redeployed the application
- [ ] Waited for deployment to complete
- [ ] Tested the API endpoint on live site
- [ ] Checked server logs for errors
- [ ] Verified templates load in the UI

Once all checked, your live site should work! 🎉

---

## 📸 Visual Guide

### Vercel Environment Variables Page:
```
┌─────────────────────────────────────────────┐
│  Environment Variables                      │
├─────────────────────────────────────────────┤
│  AWS_REGION                    [Edit] [Delete]
│  Value: eu-north-1
│  Environments: Production, Preview, Development
│
│  AWS_ACCESS_KEY_ID             [Edit] [Delete]
│  Value: AKIAXJMC...
│  Environments: Production, Preview, Development
│
│  AWS_SECRET_ACCESS_KEY         [Edit] [Delete]
│  Value: ••••••••••••
│  Environments: Production, Preview, Development
│
│  [+ Add New]
└─────────────────────────────────────────────┘
```

---

Need help? Let me know which hosting platform you're using and I can provide more specific instructions!

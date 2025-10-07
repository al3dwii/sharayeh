# How to Get AWS Access Keys

## Step-by-Step Guide

### Step 1: Log in to AWS Console
1. Go to: https://console.aws.amazon.com/
2. Sign in with your AWS account credentials
3. Make sure you're in the correct region (top-right corner)

---

### Step 2: Navigate to IAM (Identity and Access Management)
1. In the AWS Console search bar (top), type **IAM**
2. Click on **IAM** (Identity and Access Management)
3. Or go directly to: https://console.aws.amazon.com/iam/

---

### Step 3: Create a New User (or Use Existing)

#### Option A: Create New User
1. In the left sidebar, click **Users**
2. Click **Add users** (or **Create user**)
3. Enter a username: `sharayeh-s3-user` (or any name you prefer)
4. Click **Next**

#### Option B: Use Your Root Account (NOT RECOMMENDED for production)
- You can use your root account credentials, but this is less secure
- Better to create a dedicated IAM user

---

### Step 4: Set Permissions
1. Click **Attach policies directly**
2. Search for and select one of these policies:
   - ✅ **AmazonS3FullAccess** (recommended - full S3 access)
   - OR **AmazonS3ReadOnlyAccess** (if you only need to read templates)
3. Click **Next**

---

### Step 5: Review and Create
1. Review the user details
2. Click **Create user**
3. ✅ User created successfully!

---

### Step 6: Create Access Keys
1. Click on the newly created user name
2. Go to the **Security credentials** tab
3. Scroll down to **Access keys** section
4. Click **Create access key**
5. Select use case: **Other** or **Application running outside AWS**
6. Click **Next**
7. (Optional) Add a description tag
8. Click **Create access key**

---

### Step 7: Download & Save Your Credentials

⚠️ **IMPORTANT**: This is your ONLY chance to see the secret key!

You'll see:
```
Access key ID: AKIAIOSFODNN7EXAMPLE
Secret access key: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

1. Click **Download .csv file** (recommended)
2. OR copy both values somewhere safe
3. Click **Done**

---

### Step 8: Add to Your .env File

Open `/Users/omair/sharayeh/.env` and replace these lines:

```bash
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE  # ⬅️ Paste your Access Key ID here
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY  # ⬅️ Paste your Secret Key here
```

---

## ⚠️ Security Best Practices

### DO:
- ✅ Store credentials in `.env` file (already in `.gitignore`)
- ✅ Create a dedicated IAM user (not root account)
- ✅ Use minimal permissions (only S3 access)
- ✅ Rotate keys regularly
- ✅ Delete keys if compromised

### DON'T:
- ❌ Commit `.env` to git
- ❌ Share credentials publicly
- ❌ Use root account credentials
- ❌ Give more permissions than needed
- ❌ Hardcode keys in your code

---

## 🔧 Alternative: AWS CLI Method

If you have AWS CLI installed, you can also get credentials this way:

### 1. Install AWS CLI (if not installed)
```bash
# macOS
brew install awscli

# Or download from:
# https://aws.amazon.com/cli/
```

### 2. Configure AWS CLI
```bash
aws configure
```

It will ask for:
- AWS Access Key ID: [Enter your key]
- AWS Secret Access Key: [Enter your secret]
- Default region name: us-east-1
- Default output format: json

### 3. Find Your Credentials
```bash
# View your credentials
cat ~/.aws/credentials
```

You'll see:
```
[default]
aws_access_key_id = AKIAIOSFODNN7EXAMPLE
aws_secret_access_key = wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

Copy these values to your `.env` file!

---

## 🧪 Test Your Credentials

After adding credentials to `.env`, test them:

```bash
# Restart your dev server
npm run dev

# In another terminal, test the API
curl http://localhost:3001/api/templates
```

If credentials work, you should see templates listed (or an empty array if bucket is empty).

---

## ❓ Troubleshooting

### Error: "InvalidAccessKeyId"
- Double-check you copied the entire Access Key ID
- No extra spaces before/after the key
- Key should start with `AKIA...`

### Error: "SignatureDoesNotMatch"
- Check Secret Access Key is correct
- No extra spaces or newlines
- Secret key is case-sensitive

### Error: "Access Denied"
- User doesn't have S3 permissions
- Attach `AmazonS3FullAccess` policy to the IAM user
- Check bucket policy allows access

### Can't Find IAM in Console
- Make sure you're logged into the correct AWS account
- Check you have permissions to view IAM (you might need admin access)
- Try this direct link: https://console.aws.amazon.com/iam/home#/users

---

## 📞 Need Help?

If you get stuck:
1. Check you're logged into the correct AWS account
2. Verify the S3 bucket `isharayeh` exists in your account
3. Make sure IAM user has S3 permissions
4. Try using AWS CLI to test credentials work

---

## ✅ Checklist

- [ ] Logged into AWS Console
- [ ] Created IAM user or using existing credentials
- [ ] Attached S3 permissions policy
- [ ] Created access key
- [ ] Downloaded/copied Access Key ID
- [ ] Downloaded/copied Secret Access Key
- [ ] Added both to `.env` file
- [ ] Restarted dev server
- [ ] Tested API endpoint

Once all checked, your S3 integration should work! 🎉

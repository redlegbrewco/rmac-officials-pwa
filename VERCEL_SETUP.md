# Adding Google Cloud Credentials to Vercel

## 🚀 Vercel Environment Variables Setup

### Step 1: Go to Your Vercel Project
1. Visit [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your `rmac-officials-pwa` project
3. Go to **Settings** > **Environment Variables**

### Step 2: Add These Variables

Click "Add" for each variable:

**Variable 1:**
- Name: `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- Value: `your-service-account@your-project.iam.gserviceaccount.com`
- Environment: `Production`, `Preview`, `Development`

**Variable 2:**
- Name: `GOOGLE_PRIVATE_KEY` 
- Value: `"-----BEGIN PRIVATE KEY-----\nYour-Full-Private-Key\n-----END PRIVATE KEY-----"`
- Environment: `Production`, `Preview`, `Development`

**Variable 3:**
- Name: `RMAC_MASTER_SHEET_ID`
- Value: `your-google-sheet-id-from-url`
- Environment: `Production`, `Preview`, `Development`

**Variable 4:**
- Name: `RMAC_INTELLIGENCE_DOC_ID`
- Value: `your-google-doc-id-from-url`
- Environment: `Production`, `Preview`, `Development`

### Step 3: Redeploy
After adding variables, Vercel will automatically redeploy your app.

## 🔄 Development vs Production

```
Local Development (.env.local)     →     Production (Vercel Dashboard)
├── GOOGLE_SERVICE_ACCOUNT_EMAIL   →     Same variable in Vercel
├── GOOGLE_PRIVATE_KEY            →     Same variable in Vercel  
├── RMAC_MASTER_SHEET_ID          →     Same variable in Vercel
└── RMAC_INTELLIGENCE_DOC_ID      →     Same variable in Vercel
```

## ✅ What Your package.json Already Has

Your `package.json` is perfect - it already includes:
- `googleapis: ^155.0.1` ✅ (for Google Sheets API)
- All other dependencies needed ✅

The credentials are **environment variables**, not package dependencies!

## 🧪 Testing

**Local:** Use the `.env.local` file I created
**Production:** Add to Vercel dashboard

Both use the same credential values from your Google Cloud service account JSON file.

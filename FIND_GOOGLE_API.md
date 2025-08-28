# Finding Your Existing Google Sheets API Credentials

## Step 1: Locate Your Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Look at the project dropdown (top left)
3. Find the project that has your Google Sheets API enabled

## Step 2: Check Enabled APIs

1. In Google Cloud Console, go to "APIs & Services" > "Enabled APIs"
2. Look for:
   - Google Sheets API ✅ (you mentioned this exists)
   - Google Drive API (you'll need this too)
   - Google Docs API (for intelligence reports)

## Step 3: Find or Create Service Account

### Option A: Find Existing Service Account
1. Go to "IAM & Admin" > "Service Accounts"
2. Look for any existing service accounts
3. If you find one, click on it and go to "Keys" tab

### Option B: Create New Service Account (Recommended)
1. Go to "IAM & Admin" > "Service Accounts"
2. Click "Create Service Account"
3. Name: `rmac-officials-service`
4. Grant roles: "Editor" (or specific roles like "Storage Admin")

## Step 4: Generate JSON Key

1. Click on your service account
2. Go to "Keys" tab
3. Click "Add Key" > "Create New Key"
4. Choose "JSON" format
5. Download the file (keep it safe!)

## Step 5: Extract Credentials

Open the downloaded JSON file - it looks like this:
```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "key-id-here",
  "private_key": "-----BEGIN PRIVATE KEY-----\nYOUR-ACTUAL-PRIVATE-KEY\n-----END PRIVATE KEY-----",
  "client_email": "rmac-officials@your-project.iam.gserviceaccount.com",
  "client_id": "client-id-number",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token"
}
```

## Step 6: Add to Your .env.local

Copy these values to your `.env.local` file:
```bash
GOOGLE_SERVICE_ACCOUNT_EMAIL=rmac-officials@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR-FULL-PRIVATE-KEY-HERE\n-----END PRIVATE KEY-----"
```

## Step 7: Create Your Google Sheets

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it "RMAC Officials Master Data"
4. Copy the Sheet ID from the URL:
   `https://docs.google.com/spreadsheets/d/COPY-THIS-LONG-ID/edit`

## Step 8: Share Sheet with Service Account

1. Click "Share" in your Google Sheet
2. Add your service account email (from step 6)
3. Give it "Editor" permissions
4. Click "Send"

## Step 9: Add Sheet ID to Environment

```bash
RMAC_MASTER_SHEET_ID=your-sheet-id-from-step-7
```

## Step 10: Test Your Setup

Run this command to test:
```bash
npm run dev
```

Then try the "Sync to Google Sheets" button in your PWA.

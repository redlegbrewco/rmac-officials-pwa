# Google Cloud Setup Guide for RMAC Officials PWA

## 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the following APIs:
   - Google Sheets API
   - Google Drive API  
   - Google Docs API
   - Gmail API (for email reports)
   - Cloud Storage API (optional for file backups)

## 2. Create Service Account

1. Navigate to IAM & Admin > Service Accounts
2. Click "Create Service Account"
3. Name: `rmac-officials-service`
4. Description: `Service account for RMAC Officials PWA`
5. Grant roles:
   - Editor (for Sheets/Docs/Drive access)
   - Storage Admin (if using Cloud Storage)

## 3. Generate Service Account Key

1. Click on your service account
2. Go to "Keys" tab
3. Click "Add Key" > "Create New Key"
4. Choose JSON format
5. Download the key file (keep it secure!)

## 4. Create Google Sheets

Create these sheets in your Google account:

### Master RMAC Data Sheet
- Sheet ID: Copy from URL after creating
- Tabs needed:
  - `Penalties` (for all penalty data)
  - `Games` (for game information)  
  - `Crews` (for crew assignments)
  - `Intelligence` (for shared observations)

### Weekly Intelligence Document
- Google Doc for weekly intelligence reports
- Document ID needed from URL

## 5. Share Resources with Service Account

1. Share your Google Sheets with the service account email
2. Grant "Editor" permissions
3. Share any Google Docs with the service account

## 6. Environment Variables Setup

Copy `.env.local.example` to `.env.local` and fill in:

```bash
# Required for Google Sheets/Drive/Docs API
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Full-Private-Key\n-----END PRIVATE KEY-----"

# Sheet and Document IDs
RMAC_MASTER_SHEET_ID=your-sheet-id-from-url
RMAC_INTELLIGENCE_DOC_ID=your-doc-id-from-url

# Optional: For OAuth-based features
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# For Vercel deployment
NEXTAUTH_SECRET=your-secure-random-string
PRODUCTION_URL=https://your-vercel-app-url.vercel.app
```

## 7. API Endpoints You Have Active

Your PWA currently has these API routes set up:

### `/api/update-rmac-intelligence`
- Updates weekly intelligence document
- Syncs penalty data across crews
- Generates weather forecasts

### `/api/generate-scouting-report`  
- Creates team scouting reports
- Analyzes penalty patterns
- Shares with other crews

### `/api/email-qwikref-report`
- Sends post-game reports
- Includes penalty summaries
- Attaches scouting data

### `/api/backup-to-drive`
- Backs up game data to Google Drive
- Stores penalty reports
- Archives crew assignments

## 8. Database Schema (Google Sheets)

### Penalties Sheet Columns:
A: Game Date
B: Week Number  
C: Home Team
D: Away Team
E: Crew
F: Quarter
G: Time
H: Team (O/D)
I: Player Number
J: Penalty Code
K: Penalty Description
L: Yards
M: Down & Distance
N: Field Position
O: Calling Official
P: Accept/Decline
Q: Voice Note
R: Timestamp

### Games Sheet Columns:
A: Date
B: Week
C: Home Team
D: Away Team  
E: Location
F: Crew Assigned
G: Status
H: Weather
I: Temperature

### Intelligence Sheet Columns:
A: Date
B: Contributing Crew
C: Team Observed
D: Intelligence Type
E: Details
F: Game Context
G: Timestamp

## 9. Testing Your Setup

1. Start your dev server: `npm run dev`
2. Add a penalty in the PWA
3. Click "Sync to Google Sheets"
4. Check your Google Sheet for new data
5. Try contributing intelligence
6. Verify data appears in shared documents

## 10. Deployment to Vercel

1. Push code to GitHub
2. Connect Vercel to your repository
3. Add all environment variables in Vercel dashboard
4. Deploy and test production URLs

## Security Notes

- Never commit your `.env.local` file
- Keep service account keys secure
- Regularly rotate service account keys
- Use Vercel's secure environment variable storage
- Consider IP restrictions for production APIs

## Troubleshooting

- Check API quotas in Google Cloud Console
- Verify sheet/document sharing permissions  
- Ensure service account has proper roles
- Check network connectivity for API calls
- Monitor Vercel logs for deployment issues
```

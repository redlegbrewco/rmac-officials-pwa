# Google Cloud Setup Script for RMAC Officials PWA (PowerShell)
# Run this after creating your Google Cloud project and installing gcloud CLI

param(
    [Parameter(Mandatory=$true)]
    [string]$ProjectId
)

Write-Host "🚀 Setting up Google Cloud for RMAC Officials PWA..." -ForegroundColor Green
Write-Host "Project ID: $ProjectId" -ForegroundColor Yellow

# Set the project
gcloud config set project $ProjectId

Write-Host "📋 Enabling required APIs..." -ForegroundColor Cyan

# Enable required APIs
$apis = @(
    "sheets.googleapis.com",
    "drive.googleapis.com",
    "docs.googleapis.com", 
    "gmail.googleapis.com",
    "storage-api.googleapis.com",
    "iam.googleapis.com"
)

foreach ($api in $apis) {
    Write-Host "  Enabling $api..." -ForegroundColor Gray
    gcloud services enable $api
}

Write-Host "🔑 Creating service account..." -ForegroundColor Cyan

# Create service account
gcloud iam service-accounts create rmac-officials-service `
    --description="Service account for RMAC Officials PWA" `
    --display-name="RMAC Officials Service Account"

# Get the service account email
$serviceAccountEmail = "rmac-officials-service@${ProjectId}.iam.gserviceaccount.com"

Write-Host "🛡️ Assigning roles to service account..." -ForegroundColor Cyan

# Assign roles
gcloud projects add-iam-policy-binding $ProjectId `
    --member="serviceAccount:${serviceAccountEmail}" `
    --role="roles/editor"

gcloud projects add-iam-policy-binding $ProjectId `
    --member="serviceAccount:${serviceAccountEmail}" `
    --role="roles/storage.admin"

Write-Host "📥 Creating and downloading service account key..." -ForegroundColor Cyan

# Create and download key
gcloud iam service-accounts keys create ".\rmac-service-account-key.json" `
    --iam-account=$serviceAccountEmail

Write-Host ""
Write-Host "✅ Google Cloud setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Yellow
Write-Host "1. Copy the contents of rmac-service-account-key.json"
Write-Host "2. Add the private key to your .env.local file" 
Write-Host "3. Add the service account email: $serviceAccountEmail"
Write-Host "4. Create your Google Sheets and share them with the service account"
Write-Host "5. Copy the Sheet IDs to your environment variables"
Write-Host ""
Write-Host "⚠️  IMPORTANT:" -ForegroundColor Red
Write-Host "   - Keep the key file secure and never commit it to version control!"
Write-Host "   - Delete the key file after copying to .env.local:"
Write-Host "   - Remove-Item .\rmac-service-account-key.json"
Write-Host ""
Write-Host "🔗 Useful links:" -ForegroundColor Cyan
Write-Host "   - Google Cloud Console: https://console.cloud.google.com"
Write-Host "   - Create Google Sheets: https://sheets.google.com"
Write-Host "   - Vercel Dashboard: https://vercel.com/dashboard"

# Open the key file in notepad for easy copying
if (Test-Path ".\rmac-service-account-key.json") {
    Write-Host ""
    Write-Host "Opening service account key file..." -ForegroundColor Gray
    Start-Process notepad ".\rmac-service-account-key.json"
}

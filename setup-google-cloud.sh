#!/bin/bash
# Google Cloud Setup Script for RMAC Officials PWA
# Run this after creating your Google Cloud project

# Set your project ID here
PROJECT_ID="your-project-id-here"

echo "🚀 Setting up Google Cloud for RMAC Officials PWA..."
echo "Project ID: $PROJECT_ID"

# Set the project
gcloud config set project $PROJECT_ID

echo "📋 Enabling required APIs..."

# Enable required APIs
gcloud services enable sheets.googleapis.com
gcloud services enable drive.googleapis.com  
gcloud services enable docs.googleapis.com
gcloud services enable gmail.googleapis.com
gcloud services enable storage-api.googleapis.com
gcloud services enable iam.googleapis.com

echo "🔑 Creating service account..."

# Create service account
gcloud iam service-accounts create rmac-officials-service \
    --description="Service account for RMAC Officials PWA" \
    --display-name="RMAC Officials Service Account"

# Get the service account email
SERVICE_ACCOUNT_EMAIL="rmac-officials-service@${PROJECT_ID}.iam.gserviceaccount.com"

echo "🛡️ Assigning roles to service account..."

# Assign roles
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
    --role="roles/editor"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
    --role="roles/storage.admin"

echo "📥 Creating and downloading service account key..."

# Create and download key
gcloud iam service-accounts keys create ./rmac-service-account-key.json \
    --iam-account=$SERVICE_ACCOUNT_EMAIL

echo "✅ Google Cloud setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Copy the contents of rmac-service-account-key.json"
echo "2. Add the private key to your .env.local file"
echo "3. Add the service account email: $SERVICE_ACCOUNT_EMAIL"
echo "4. Create your Google Sheets and share them with the service account"
echo "5. Copy the Sheet IDs to your environment variables"
echo ""
echo "⚠️  IMPORTANT: Keep the key file secure and never commit it to version control!"
echo "🗑️  Delete the key file after copying to .env.local: rm rmac-service-account-key.json"

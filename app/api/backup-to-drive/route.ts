import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { fileName, folderName, gameData, metadata } = await request.json();
    
    // Since you already have Google Drive API setup, use existing credentials
    const fileContent = JSON.stringify({
      gameData,
      metadata,
      backupVersion: '1.0',
      timestamp: new Date().toISOString()
    }, null, 2);

    // Create or get crew folder
    const folderId = await createOrGetFolder(folderName);
    
    // Upload file to Google Drive
    const fileId = await uploadToGoogleDrive(fileName, fileContent, folderId);
    
    return NextResponse.json({
      success: true,
      fileId,
      fileName,
      folderName,
      message: 'Game data backed up successfully'
    });
    
  } catch (error) {
    console.error('Drive backup error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to backup to Google Drive' },
      { status: 500 }
    );
  }
}

async function createOrGetFolder(folderName: string): Promise<string> {
  // Implementation would use your existing Google Drive API setup
  // This is a placeholder for the actual Google Drive folder creation
  try {
    // Search for existing folder
    const searchResponse = await fetch(`https://www.googleapis.com/drive/v3/files?q=name='${folderName}' and mimeType='application/vnd.google-apps.folder'`, {
      headers: {
        'Authorization': `Bearer ${process.env.GOOGLE_ACCESS_TOKEN}`,
      }
    });
    
    const searchResult = await searchResponse.json();
    
    if (searchResult.files && searchResult.files.length > 0) {
      return searchResult.files[0].id;
    }
    
    // Create new folder
    const createResponse = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GOOGLE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder'
      })
    });
    
    const folder = await createResponse.json();
    return folder.id;
    
  } catch (error) {
    console.error('Folder creation error:', error);
    throw error;
  }
}

async function uploadToGoogleDrive(fileName: string, content: string, folderId: string): Promise<string> {
  try {
    const metadata = {
      name: fileName,
      parents: [folderId]
    };
    
    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', new Blob([content], { type: 'application/json' }));
    
    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GOOGLE_ACCESS_TOKEN}`,
      },
      body: form
    });
    
    const file = await response.json();
    return file.id;
    
  } catch (error) {
    console.error('File upload error:', error);
    throw error;
  }
}

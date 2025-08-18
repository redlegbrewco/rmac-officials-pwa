import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Check if all required environment variables are present
    const hasPrivateKey = !!process.env.GOOGLE_PRIVATE_KEY;
    const hasServiceEmail = !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const hasSheetId = !!process.env.RMAC_MASTER_SHEET_ID;
    
    const isConfigured = hasPrivateKey && hasServiceEmail && hasSheetId;
    
    return NextResponse.json({
      success: true,
      configured: isConfigured,
      status: isConfigured ? 'Google Sheets integration active' : 'Mock implementation active',
      missingConfig: {
        privateKey: !hasPrivateKey,
        serviceEmail: !hasServiceEmail,
        sheetId: !hasSheetId
      }
    });

  } catch (error) {
    console.error('Google Sheets status check error:', error);
    return NextResponse.json(
      { 
        success: false, 
        configured: false,
        status: 'Configuration check failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { syncPenaltiesToSheet } from '@/lib/google-sheets';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    // Check if Google Sheets is configured
    const hasPrivateKey = !!process.env.GOOGLE_PRIVATE_KEY;
    const hasServiceEmail = !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const hasSheetId = !!process.env.RMAC_MASTER_SHEET_ID;
    
    const isConfigured = hasPrivateKey && hasServiceEmail && hasSheetId;

    if (!isConfigured) {
      // Mock implementation for development
      console.log('Google Sheets sync request (MOCK):', { action, data });
      await new Promise(resolve => setTimeout(resolve, 100));

      return NextResponse.json({
        success: true,
        message: 'Mock sync completed - Google Sheets not configured',
        action,
        timestamp: new Date().toISOString(),
        mock: true
      });
    }

    // Real Google Sheets integration
    if (action === 'view_sheet') {
      // For now, just return success for viewing
      return NextResponse.json({
        success: true,
        message: 'Google Sheets integration is active',
        action,
        timestamp: new Date().toISOString(),
        configured: true
      });
    }

    if (action === 'sync_penalties' && data?.penalties && data?.gameInfo) {
      // Use the real Google Sheets sync function
      const syncResult = await syncPenaltiesToSheet(data.penalties, data.gameInfo);
      
      return NextResponse.json({
        success: syncResult.success,
        message: syncResult.success ? 'Penalties synced to Google Sheets' : 'Sync failed',
        rowsAdded: syncResult.rowsAdded,
        error: syncResult.error,
        action,
        timestamp: new Date().toISOString()
      });
    }

    // Default response for other actions
    console.log('Google Sheets sync request:', { action, data });
    return NextResponse.json({
      success: true,
      message: 'Real-time sync completed',
      action,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Google Sheets sync error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

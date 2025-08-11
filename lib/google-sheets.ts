import { google, sheets_v4 } from 'googleapis';

// Interfaces for the function parameters
interface Penalty {
  id: number;
  code: string;
  name: string;
  yards: number;
  team: string;
  player: string;
  description: string;
  quarter: string;
  time: string;
  down: string;
  callingOfficial: string;
  fieldPosition?: number;
  voiceNote?: string;
  timestamp: string;
}

interface GameInfo {
  date: string;
  week: number;
  homeTeam: string;
  awayTeam: string;
  crew: string;
  location: string;
}

interface SyncResult {
  success: boolean;
  rowsAdded?: number;
  error?: string;
}

export async function syncPenaltiesToSheet(
  penalties: Penalty[],
  gameInfo: GameInfo
): Promise<SyncResult> {
  try {
    // Validate environment variables
    if (!process.env.GOOGLE_PRIVATE_KEY || !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
      throw new Error('Missing required Google Sheets environment variables: GOOGLE_PRIVATE_KEY and GOOGLE_SERVICE_ACCOUNT_EMAIL');
    }

    // Initialize Google Sheets API with simplified auth
    const auth = new google.auth.GoogleAuth({
      credentials: {
        type: 'service_account',
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.RMAC_MASTER_SHEET_ID;

    if (!spreadsheetId) {
      throw new Error('RMAC_MASTER_SHEET_ID not configured');
    }

    // Prepare the data for Google Sheets
    const headerRow = [
      'Date',
      'Week',
      'Home Team',
      'Away Team',
      'Crew',
      'Location',
      'Quarter',
      'Time',
      'Down & Distance',
      'Field Position',
      'Penalty Code',
      'Penalty Name',
      'Yards',
      'Team',
      'Player #',
      'Calling Official',
      'Description',
      'Timestamp'
    ];

    // Convert penalties to rows
    const penaltyRows = penalties.map(penalty => [
      gameInfo.date,
      gameInfo.week.toString(),
      gameInfo.homeTeam,
      gameInfo.awayTeam,
      gameInfo.crew,
      gameInfo.location,
      penalty.quarter,
      penalty.time,
      penalty.down,
      penalty.fieldPosition?.toString() || '',
      penalty.code,
      penalty.name,
      penalty.yards.toString(),
      penalty.team === 'O' ? 'Offense' : 'Defense',
      penalty.player,
      penalty.callingOfficial,
      penalty.description || '',
      penalty.timestamp
    ]);

    // Get the sheet name
    const sheetName = await ensurePenaltiesSheet(sheets, spreadsheetId);

    // Check if headers exist
    try {
      const headerResponse = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A1:R1`,
      });

      if (!headerResponse.data.values || headerResponse.data.values.length === 0) {
        // Add headers if they don't exist
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `${sheetName}!A1:R1`,
          valueInputOption: 'RAW',
          requestBody: {
            values: [headerRow],
          },
        });
      }
    } catch (error) {
      // Add headers anyway
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A1:R1`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [headerRow],
        },
      });
    }

    // Append the penalty data
    const appendResponse = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A:R`,
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: penaltyRows,
      },
    });

    const updatedRows = appendResponse.data.updates?.updatedRows || 0;

    return {
      success: true,
      rowsAdded: updatedRows,
    };

  } catch (error) {
    console.error('Error syncing to Google Sheets:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

// Helper function to get or create the penalties sheet
async function ensurePenaltiesSheet(sheets: sheets_v4.Sheets, spreadsheetId: string): Promise<string> {
  const sheetName = 'RMAC Penalties';
  
  try {
    // Try to get the spreadsheet info
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId,
    });

    // Check if our sheet exists
    const sheetExists = spreadsheet.data.sheets?.some(
      (sheet: sheets_v4.Schema$Sheet) => sheet.properties?.title === sheetName
    );

    if (!sheetExists) {
      // Create the sheet
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: sheetName,
                },
              },
            },
          ],
        },
      });
    }

    return sheetName;
  } catch (error) {
    console.error('Error ensuring sheet exists:', error);
    throw error;
  }
}

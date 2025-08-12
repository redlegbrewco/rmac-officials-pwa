// app/api/generate-scouting-report/route.ts
import { google } from 'googleapis';
import { NextResponse } from 'next/server';

// Initialize Google APIs
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: [
    'https://www.googleapis.com/auth/documents',
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/spreadsheets.readonly'
  ],
});

const docs = google.docs({ version: 'v1', auth });
const sheets = google.sheets({ version: 'v4', auth });
const drive = google.drive({ version: 'v3', auth });

export async function POST(request: Request) {
  try {
    const { crew, week, gameInfo } = await request.json();
    
    // 1. Pull data from your master sheet
    const sheetData = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.RMAC_MASTER_SHEET_ID,
      range: 'Penalties!A:Z',
    });
    
    const penalties = sheetData.data.values || [];
    
    // 2. Analyze team tendencies
    const homeTendencies = analyzeTeam(penalties, gameInfo.homeTeam);
    const awayTendencies = analyzeTeam(penalties, gameInfo.awayTeam);
    
    // 3. Create the Google Doc
    const doc = await docs.documents.create({
      requestBody: {
        title: `RMAC ${crew} - Week ${week} Scouting Report`,
      },
    });
    
    const documentId = doc.data.documentId!;
    
    // 4. Build the document content
    const requests = [
      // Header
      {
        insertText: {
          location: { index: 1 },
          text: `RMAC ${crew.toUpperCase()} - WEEK ${week} SCOUTING REPORT\n${'='.repeat(50)}\n\n`
        }
      },
      // Game Info
      {
        insertText: {
          location: { index: 1 },
          text: `Game: ${gameInfo.homeTeam} vs ${gameInfo.awayTeam}\n` +
                `Date: ${gameInfo.date}\n` +
                `Location: ${gameInfo.location}\n` +
                `Kickoff: ${gameInfo.time}\n\n`
        }
      },
      // Style the header
      {
        updateTextStyle: {
          range: { startIndex: 1, endIndex: 50 },
          textStyle: {
            bold: true,
            fontSize: { magnitude: 16, unit: 'PT' }
          },
          fields: 'bold,fontSize'
        }
      }
    ];
    
    // Add team analysis sections
    let currentIndex = 200; // Approximate index after header
    
    // Home Team Section
    requests.push({
      insertText: {
        location: { index: currentIndex },
        text: `\n${gameInfo.homeTeam.toUpperCase()} TENDENCIES:\n${'─'.repeat(30)}\n`
      }
    });
    
    currentIndex += 50;
    
    // Add home team stats
    requests.push({
      insertText: {
        location: { index: currentIndex },
        text: formatTeamAnalysis(homeTendencies)
      }
    });
    
    // Away Team Section
    currentIndex += 300;
    requests.push({
      insertText: {
        location: { index: currentIndex },
        text: `\n\n${gameInfo.awayTeam.toUpperCase()} TENDENCIES:\n${'─'.repeat(30)}\n`
      }
    });
    
    currentIndex += 50;
    requests.push({
      insertText: {
        location: { index: currentIndex },
        text: formatTeamAnalysis(awayTendencies)
      }
    });
    
    // Key Players to Watch
    currentIndex += 300;
    requests.push({
      insertText: {
        location: { index: currentIndex },
        text: '\n\nKEY PLAYERS TO WATCH:\n' + '─'.repeat(30) + '\n'
      }
    });
    
    // Update the document
    await docs.documents.batchUpdate({
      documentId,
      requestBody: { requests }
    });
    
    // 5. Share with crew
    await drive.permissions.create({
      fileId: documentId,
      requestBody: {
        role: 'writer',
        type: 'anyone', // Or specific email
      }
    });
    
    // 6. Get shareable link
    const file = await drive.files.get({
      fileId: documentId,
      fields: 'webViewLink'
    });
    
    return NextResponse.json({
      success: true,
      documentId,
      documentUrl: file.data.webViewLink,
      message: `Scouting report created for ${crew} Week ${week}`
    });
    
  } catch (error) {
    console.error('Report generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}

// Helper function to analyze team penalties
function analyzeTeam(penalties: any[][], teamName: string) {
  const teamPenalties = penalties.filter(row => 
    row[2] === teamName || row[3] === teamName
  );
  
  // Count penalty types
  const penaltyCounts: Record<string, number> = {};
  const playerPenalties: Record<string, { count: number; types: string[] }> = {};
  
  teamPenalties.forEach(penalty => {
    const code = penalty[6]; // Penalty code column
    const player = penalty[5]; // Player number
    
    penaltyCounts[code] = (penaltyCounts[code] || 0) + 1;
    
    if (!playerPenalties[player]) {
      playerPenalties[player] = { count: 0, types: [] };
    }
    playerPenalties[player].count++;
    playerPenalties[player].types.push(code);
  });
  
  // Find repeat offenders
  const repeatOffenders = Object.entries(playerPenalties)
    .filter(([_, data]) => data.count >= 2)
    .sort((a, b) => b[1].count - a[1].count);
  
  return {
    totalPenalties: teamPenalties.length,
    penaltyCounts,
    repeatOffenders,
    avgPenaltiesPerGame: (teamPenalties.length / 7).toFixed(1) // Assuming 7 games
  };
}

// Format analysis for the document
function formatTeamAnalysis(analysis: any): string {
  let text = `• Total Penalties This Season: ${analysis.totalPenalties}\n`;
  text += `• Average Per Game: ${analysis.avgPenaltiesPerGame}\n\n`;
  
  text += 'Most Common Penalties:\n';
  Object.entries(analysis.penaltyCounts)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .slice(0, 5)
    .forEach(([code, count]) => {
      text += `  - ${code}: ${count} times\n`;
    });
  
  text += '\nRepeat Offenders:\n';
  analysis.repeatOffenders.slice(0, 5).forEach(([player, data]: [string, any]) => {
    text += `  - #${player}: ${data.count} penalties (${data.types.join(', ')})\n`;
  });
  
  return text;
}
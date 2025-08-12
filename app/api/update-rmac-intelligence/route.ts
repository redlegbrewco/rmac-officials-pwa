// app/api/update-rmac-intelligence/route.ts
import { google } from 'googleapis';
import { NextResponse } from 'next/server';

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: [
    'https://www.googleapis.com/auth/documents',
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/gmail.send'
  ],
});

const docs = google.docs({ version: 'v1', auth });
const sheets = google.sheets({ version: 'v4', auth });
const drive = google.drive({ version: 'v3', auth });
const gmail = google.gmail({ version: 'v1', auth });

// ONE master document for ALL crews
const RMAC_INTELLIGENCE_DOC_ID = process.env.RMAC_INTELLIGENCE_DOC_ID || '';

export async function POST(request: Request) {
  try {
    const { week, reportingCrew, gameData } = await request.json();
    
    // 1. Get or create the RMAC Master Intelligence Document
    const documentId = await getOrCreateMasterDocument();
    
    // 2. Pull ALL data from master sheet (from all crews)
    const sheetData = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.RMAC_MASTER_SHEET_ID,
      range: 'Penalties!A:Z',
    });
    
    const allPenalties = sheetData.data.values || [];
    
    // 3. Get this week's games for ALL crews
    const weeklyGames = await getWeeklySchedule(week);
    
    // 4. Analyze ALL teams playing this week
    const weeklyIntelligence = analyzeWeeklyIntelligence(allPenalties, weeklyGames, week);
    
    // 5. Get weather for all game locations
    const weatherForecasts = await getWeeklyWeatherForecasts(weeklyGames);
    
    // 6. Update the master document
    await updateMasterIntelligence(documentId, week, weeklyIntelligence, weatherForecasts, reportingCrew);
    
    // 7. Send notification to ALL crew chiefs
    await notifyAllCrews(week, documentId);
    
    // 8. Get shareable link
    const file = await drive.files.get({
      fileId: documentId,
      fields: 'webViewLink'
    });
    
    return NextResponse.json({
      success: true,
      documentId,
      documentUrl: file.data.webViewLink,
      message: `Week ${week} intelligence updated by ${reportingCrew}`
    });
    
  } catch (error) {
    console.error('Intelligence update error:', error);
    return NextResponse.json(
      { error: 'Failed to update intelligence' },
      { status: 500 }
    );
  }
}

async function getOrCreateMasterDocument(): Promise<string> {
  // Check if master doc exists
  if (RMAC_INTELLIGENCE_DOC_ID) {
    return RMAC_INTELLIGENCE_DOC_ID;
  }
  
  // Create the master intelligence document
  const doc = await docs.documents.create({
    requestBody: {
      title: `RMAC Officials Intelligence Network - 2025 Season`,
    },
  });
  
  const documentId = doc.data.documentId!;
  
  // Initialize with header
  await docs.documents.batchUpdate({
    documentId,
    requestBody: {
      requests: [{
        insertText: {
          location: { index: 1 },
          text: `🏈 RMAC OFFICIALS INTELLIGENCE NETWORK 🏈\n` +
                `${'═'.repeat(60)}\n\n` +
                `Central Intelligence Hub for All RMAC Officials\n` +
                `Accessible by: All 5 Crews + Coordinator\n` +
                `Last Updated: ${new Date().toLocaleString()}\n\n` +
                `📋 HOW TO USE THIS DOCUMENT:\n` +
                `• Each crew contributes after their games\n` +
                `• Review before your games\n` +
                `• Add notes in the crew intelligence section\n` +
                `• Star ⭐ critical items for emphasis\n\n`
        }
      }]
    }
  });
  
  // Share with all crews (make it public to RMAC domain or specific emails)
  await drive.permissions.create({
    fileId: documentId,
    requestBody: {
      role: 'writer',
      type: 'anyone', // Or domain-specific
    }
  });
  
  // Save ID for future use
  console.log(`Created RMAC Master Intelligence Doc: ${documentId}`);
  console.log(`ADD TO ENV: RMAC_INTELLIGENCE_DOC_ID=${documentId}`);
  
  return documentId;
}

async function getWeeklySchedule(week: number) {
  // Pull from your schedule sheet or database
  const scheduleData = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.RMAC_MASTER_SHEET_ID,
    range: 'Schedule!A:F',
  });
  
  const games = scheduleData.data.values?.filter(row => row[0] === week.toString()) || [];
  
  return games.map(game => ({
    week: game[0],
    date: game[1],
    homeTeam: game[2],
    awayTeam: game[3],
    crew: game[4],
    location: game[5]
  }));
}

function analyzeWeeklyIntelligence(penalties: any[][], games: any[], week: number) {
  const intelligence: Record<string, any> = {};
  
  // Get all teams playing this week
  const teamsThisWeek = new Set<string>();
  games.forEach(game => {
    teamsThisWeek.add(game.homeTeam);
    teamsThisWeek.add(game.awayTeam);
  });
  
  // Analyze each team
  teamsThisWeek.forEach(team => {
    const teamPenalties = penalties.filter(row => 
      row[2] === team || row[3] === team
    );
    
    // Recent form (last 3 games)
    const recentPenalties = teamPenalties.slice(-30); // Approximate last 3 games
    
    // Hot players
    const playerCounts: Record<string, { count: number; penalties: string[] }> = {};
    recentPenalties.forEach(penalty => {
      const player = penalty[5];
      const code = penalty[6];
      if (!playerCounts[player]) {
        playerCounts[player] = { count: 0, penalties: [] };
      }
      playerCounts[player].count++;
      playerCounts[player].penalties.push(code);
    });
    
    const hotPlayers = Object.entries(playerCounts)
      .filter(([_, data]) => data.count >= 2)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 3);
    
    // Penalty patterns
    const penaltyTypes: Record<string, number> = {};
    teamPenalties.forEach(penalty => {
      const code = penalty[6];
      penaltyTypes[code] = (penaltyTypes[code] || 0) + 1;
    });
    
    intelligence[team] = {
      totalSeason: teamPenalties.length,
      avgPerGame: (teamPenalties.length / Math.max(week - 1, 1)).toFixed(1),
      recentForm: recentPenalties.length,
      hotPlayers,
      topPenalties: Object.entries(penaltyTypes)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3),
      trend: calculateTrend(teamPenalties, week)
    };
  });
  
  return intelligence;
}

function calculateTrend(penalties: any[][], currentWeek: number): string {
  if (currentWeek < 3) return '→ Neutral';
  
  const lastWeek = penalties.filter(p => p[1] === (currentWeek - 1).toString()).length;
  const twoWeeksAgo = penalties.filter(p => p[1] === (currentWeek - 2).toString()).length;
  const threeWeeksAgo = penalties.filter(p => p[1] === (currentWeek - 3).toString()).length;
  
  const recent = lastWeek;
  const previous = (twoWeeksAgo + threeWeeksAgo) / 2;
  
  if (recent > previous + 1) return '📈 Getting Worse';
  if (recent < previous - 1) return '📉 Improving';
  return '→ Stable';
}

async function updateMasterIntelligence(
  documentId: string,
  week: number,
  intelligence: any,
  weather: any,
  reportingCrew: string
) {
  const requests = [];
  const insertIndex = 999999; // End of document
  
  // Week header
  requests.push({
    insertText: {
      location: { index: insertIndex },
      text: `\n\n${'═'.repeat(80)}\n` +
            `📅 WEEK ${week} INTELLIGENCE REPORT\n` +
            `Updated: ${new Date().toLocaleString()} by ${reportingCrew}\n` +
            `${'═'.repeat(80)}\n\n`
    }
  });
  
  // This week's games
  requests.push({
    insertText: {
      location: { index: insertIndex },
      text: `🏈 THIS WEEK'S GAMES:\n` +
            `${'─'.repeat(40)}\n`
    }
  });
  
  Object.entries(weather).forEach(([game, forecast]: [string, any]) => {
    requests.push({
      insertText: {
        location: { index: insertIndex },
        text: `• ${game}\n` +
              `  🌤️ ${forecast.temperature}°F, ${forecast.conditions}, Wind: ${forecast.windSpeed}mph\n\n`
      }
    });
  });
  
  // Team Intelligence
  requests.push({
    insertText: {
      location: { index: insertIndex },
      text: `\n📊 TEAM INTELLIGENCE:\n` +
            `${'─'.repeat(40)}\n\n`
    }
  });
  
  Object.entries(intelligence).forEach(([team, data]: [string, any]) => {
    requests.push({
      insertText: {
        location: { index: insertIndex },
        text: `${team.toUpperCase()} ${data.trend}\n` +
              `• Season: ${data.totalSeason} penalties (${data.avgPerGame}/game)\n` +
              `• Last 3 games: ${data.recentForm} penalties\n` +
              `• 🔥 Hot Players:\n` +
              data.hotPlayers.map(([player, info]: [string, any]) => 
                `  - #${player}: ${info.count} penalties (${info.penalties.join(', ')})\n`
              ).join('') +
              `• Common Penalties: ${data.topPenalties.map(([code, count]: [string, number]) => 
                `${code}(${count})`).join(', ')}\n\n`
      }
    });
  });
  
  // Crew Notes Section
  requests.push({
    insertText: {
      location: { index: insertIndex },
      text: `\n💡 CREW INTELLIGENCE NOTES:\n` +
            `${'─'.repeat(40)}\n` +
            `[Crews: Add your observations here]\n\n` +
            `${reportingCrew}:\n` +
            `• \n\n`
    }
  });
  
  await docs.documents.batchUpdate({
    documentId,
    requestBody: { requests }
  });
}

async function notifyAllCrews(week: number, documentId: string) {
  const docUrl = `https://docs.google.com/document/d/${documentId}/edit`;
  
  // Get all crew emails from env or database
  const crewEmails = process.env.CREW_EMAIL_LIST?.split(',') || [];
  
  // Create the email
  const message = Buffer.from(
    `To: ${crewEmails.join(', ')}\r\n` +
    `Subject: RMAC Week ${week} Intelligence Report Updated\r\n` +
    `Content-Type: text/html; charset=utf-8\r\n\r\n` +
    `<html><body>` +
    `<h2>RMAC Intelligence Network Update</h2>` +
    `<p>The Week ${week} intelligence report has been updated.</p>` +
    `<p><a href="${docUrl}" style="background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Intelligence Report</a></p>` +
    `<p>This week's report includes:</p>` +
    `<ul>` +
    `<li>Updated team tendencies for all games</li>` +
    `<li>Hot players to watch</li>` +
    `<li>Weather forecasts for all locations</li>` +
    `<li>Crew intelligence notes</li>` +
    `</ul>` +
    `<p>Please review before your game and add any observations after.</p>` +
    `<p><strong>RMAC Officials Network</strong></p>` +
    `</body></html>`
  ).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  
  try {
    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: message
      }
    });
    console.log('Notification sent to all crews');
  } catch (error) {
    console.error('Gmail send error:', error);
  }
}

async function getWeeklyWeatherForecasts(games: any[]) {
  const forecasts: Record<string, any> = {};
  
  for (const game of games) {
    const key = `${game.homeTeam} vs ${game.awayTeam}`;
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${game.location}&appid=${process.env.WEATHER_API_KEY}&units=imperial`
      );
      const data = await response.json();
      
      forecasts[key] = {
        temperature: Math.round(data.main.temp),
        conditions: data.weather[0].main,
        windSpeed: Math.round(data.wind.speed),
        crew: game.crew
      };
    } catch {
      forecasts[key] = {
        temperature: 65,
        conditions: 'Clear',
        windSpeed: 5,
        crew: game.crew
      };
    }
  }
  
  return forecasts;
}
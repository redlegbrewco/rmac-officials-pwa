import { NextRequest, NextResponse } from 'next/server';

// RMAC League-wide analytics aggregation
export async function GET(request: NextRequest) {
  try {
    // In production, this would aggregate data from Google Sheets across all crews and games
    const rmacAnalytics = {
      seasonStats: {
        totalGames: 64,
        totalPenalties: 768,
        avgPenaltiesPerGame: 12.0,
        totalOfficials: 42,
        activeCrews: 5,
        completedWeeks: 8
      },
      crewRankings: [
        {
          rank: 1,
          crewChief: 'Randy Campbell',
          gamesOfficiated: 12,
          avgPenaltiesPerGame: 11.2,
          rating: 4.5,
          trend: 'up'
        },
        {
          rank: 2,
          crewChief: 'Tom Peterson',
          gamesOfficiated: 10,
          avgPenaltiesPerGame: 11.8,
          rating: 4.1,
          trend: 'stable'
        },
        {
          rank: 3,
          crewChief: 'Mike Johnson',
          gamesOfficiated: 9,
          avgPenaltiesPerGame: 12.5,
          rating: 4.0,
          trend: 'up'
        },
        {
          rank: 4,
          crewChief: 'Dave Wilson',
          gamesOfficiated: 7,
          avgPenaltiesPerGame: 13.8,
          rating: 3.9,
          trend: 'down'
        },
        {
          rank: 5,
          crewChief: 'Steve Anderson',
          gamesOfficiated: 8,
          avgPenaltiesPerGame: 14.2,
          rating: 3.8,
          trend: 'stable'
        }
      ],
      scoutingReports: {
        totalSubmitted: 45,
        pendingReports: 8,
        avgRating: 4.1,
        recentReports: [
          {
            gameInfo: 'Colorado Mesa vs Western Colorado',
            crewChief: 'Randy Campbell',
            rating: 4.5,
            date: '2025-08-23',
            keyFindings: [
              'Excellent game management',
              'Clear communication with players',
              'Penalty calls were accurate and timely'
            ]
          },
          {
            gameInfo: 'Adams State vs Fort Lewis',
            crewChief: 'Tom Peterson',
            rating: 4.2,
            date: '2025-08-22',
            keyFindings: [
              'Good crew coordination',
              'Minor positioning issue on long pass plays',
              'Strong leadership from crew chief'
            ]
          },
          {
            gameInfo: 'CSU Pueblo vs New Mexico Highlands',
            crewChief: 'Mike Johnson',
            rating: 3.8,
            date: '2025-08-21',
            keyFindings: [
              'Delayed flag on obvious holding call',
              'Need improvement in sideline management',
              'Overall fair and consistent officiating'
            ]
          }
        ]
      },
      penaltyTrends: {
        byWeek: [
          { week: 1, totalPenalties: 98, avgPerGame: 12.3 },
          { week: 2, totalPenalties: 95, avgPerGame: 11.9 },
          { week: 3, totalPenalties: 102, avgPerGame: 12.8 },
          { week: 4, totalPenalties: 88, avgPerGame: 11.0 },
          { week: 5, totalPenalties: 96, avgPerGame: 12.0 },
          { week: 6, totalPenalties: 104, avgPerGame: 13.0 },
          { week: 7, totalPenalties: 92, avgPerGame: 11.5 },
          { week: 8, totalPenalties: 93, avgPerGame: 11.6 }
        ],
        byType: [
          { type: 'Holding', count: 156, percentage: 20.3 },
          { type: 'False Start', count: 128, percentage: 16.7 },
          { type: 'Pass Interference', count: 92, percentage: 12.0 },
          { type: 'Offsides', count: 85, percentage: 11.1 },
          { type: 'Personal Foul', count: 76, percentage: 9.9 },
          { type: 'Illegal Formation', count: 68, percentage: 8.9 },
          { type: 'Delay of Game', count: 52, percentage: 6.8 },
          { type: 'Other', count: 111, percentage: 14.5 }
        ]
      },
      officialPerformance: {
        topPerformers: [
          {
            name: 'Randy Campbell',
            position: 'Referee',
            rating: 4.5,
            gamesWorked: 12
          },
          {
            name: 'Tom Peterson',
            position: 'Head Linesman',
            rating: 4.3,
            gamesWorked: 11
          },
          {
            name: 'Mike Johnson',
            position: 'Umpire',
            rating: 4.1,
            gamesWorked: 10
          }
        ],
        improvementNeeded: [
          {
            name: 'Steve Anderson',
            position: 'Field Judge',
            issues: ['Positioning on deep passes', 'Late flag throws'],
            recommendedActions: ['Film study on positioning', 'Practice flag mechanics']
          },
          {
            name: 'Dave Wilson',
            position: 'Side Judge',
            issues: ['Sideline management', 'Clock awareness'],
            recommendedActions: ['Sideline control workshop', 'Clock management review']
          }
        ]
      }
    };

    return NextResponse.json({
      success: true,
      analytics: rmacAnalytics,
      lastUpdated: new Date().toISOString(),
      dataSource: 'Google Sheets Integration'
    });

  } catch (error) {
    console.error('Failed to fetch RMAC analytics:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch RMAC analytics'
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const crewName = url.searchParams.get('crew');
    const week = url.searchParams.get('week');
    
    // Mock RMAC crew analytics data with CLEARLY DYNAMIC values to show API is working
    const currentTime = new Date().getSeconds(); // Use seconds to make it obvious values are changing
    const mockAnalytics = {
      crew: crewName || 'Campbell Crew',
      currentWeek: parseInt(week || '1'),
      crewStats: {
        gamesOfficiated: currentTime % 5 + 7, // 7-11 games based on current second
        totalPenalties: currentTime * 2 + 80, // 80-200+ penalties 
        avgPenaltiesPerGame: Math.round((currentTime % 10 + 8) * 10) / 10, // 8.0-18.0
        accuracy: 95 - (currentTime % 10), // 85-95% accuracy that changes each second
        consistency: Math.round((currentTime % 20 + 75) * 10) / 10, // 75.0-95.0
        improvement: currentTime % 2 === 0 ? `+${currentTime % 5}.0%` : `-${currentTime % 3}.0%`,
        crewRating: Math.round((currentTime % 3 + 3) * 10) / 10 // 3.0-6.0
      },
      rmacOverall: {
        totalGames: 64,
        totalPenalties: 768,
        avgPenaltiesPerGame: 12.0,
        activeCrews: 8,
        topPenalties: [
          { code: 'FST', name: 'False Start', count: 89, percentage: 11.6 },
          { code: 'HLD', name: 'Holding', count: 82, percentage: 10.7 },
          { code: 'OPI', name: 'Offensive Pass Interference', count: 67, percentage: 8.7 },
          { code: 'DPI', name: 'Defensive Pass Interference', count: 58, percentage: 7.5 },
          { code: 'UNS', name: 'Unsportsmanlike Conduct', count: 45, percentage: 5.9 }
        ],
        crewRankings: [
          { crew: 'Campbell Crew', penalties: 96, avg: 12.0, rank: 1 },
          { crew: 'Johnson Crew', penalties: 102, avg: 12.8, rank: 2 },
          { crew: 'Smith Crew', penalties: 108, avg: 13.5, rank: 3 },
          { crew: 'Williams Crew', penalties: 115, avg: 14.4, rank: 4 },
          { crew: 'Davis Crew', penalties: 121, avg: 15.1, rank: 5 },
          { crew: 'Miller Crew', penalties: 128, avg: 16.0, rank: 6 },
          { crew: 'Wilson Crew', penalties: 134, avg: 16.8, rank: 7 },
          { crew: 'Anderson Crew', penalties: 142, avg: 17.8, rank: 8 }
        ]
      },
      recentGames: [
        {
          id: '1',
          date: '2025-08-30',
          homeTeam: 'Colorado State',
          awayTeam: 'Air Force',
          penalties: 11,
          notes: 'Clean game, good crew coordination'
        },
        {
          id: '2', 
          date: '2025-08-23',
          homeTeam: 'Wyoming',
          awayTeam: 'New Mexico',
          penalties: 13,
          notes: 'Chippy game, handled well'
        }
      ],
      scoutingReports: [
        {
          team: 'Colorado State',
          lastGame: '2025-08-30',
          penalties: 5,
          trends: ['Watch for holding on O-line', 'Clean in red zone'],
          discipline: 'High'
        },
        {
          team: 'Air Force',
          lastGame: '2025-08-30', 
          penalties: 6,
          trends: ['False starts on option plays', 'Aggressive secondary'],
          discipline: 'Average'
        }
      ],
      crewRankings: [
        { crewName: 'Flinn Crew', gamesOfficiated: 8, avgPenaltiesPerGame: 12.0, rating: 4.2 },
        { crewName: 'Gray Crew (Michael)', gamesOfficiated: 7, avgPenaltiesPerGame: 11.8, rating: 4.1 },
        { crewName: 'Gray Crew (Rich)', gamesOfficiated: 8, avgPenaltiesPerGame: 12.5, rating: 4.0 },
        { crewName: 'Bloszies Crew', gamesOfficiated: 6, avgPenaltiesPerGame: 13.1, rating: 3.9 },
        { crewName: 'Harrison Crew', gamesOfficiated: 7, avgPenaltiesPerGame: 11.2, rating: 4.3 }
      ]
    };

    return NextResponse.json({ 
      success: true, 
      data: mockAnalytics,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Crew analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch crew analytics' },
      { status: 500 }
    );
  }
}

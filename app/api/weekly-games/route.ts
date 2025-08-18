import { NextRequest, NextResponse } from 'next/server';

// Google Sheets integration for weekly game assignments
interface GameAssignment {
  id: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
  time: string;
  venue: string;
  division: string;
  crewChief: string;
  referee: string;
  umpire: string;
  headLinesman: string;
  lineJudge: string;
  fieldJudge: string;
  sideJudge: string;
  backJudge: string;
  status: string;
  scoutingReportSubmitted: boolean;
  scoutingRating?: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const week = searchParams.get('week') || '1';
    
    // In production, this would integrate with Google Sheets API
    // For now, providing structured mock data that matches real RMAC operations
    
    const mockGames: GameAssignment[] = [
      {
        id: `w${week}-game-1`,
        homeTeam: 'Colorado State Pueblo',
        awayTeam: 'New Mexico Highlands',
        date: '2025-08-23',
        time: '19:00',
        venue: 'Neta & Eddie DeRose ThunderBowl',
        division: 'RMAC',
        crewChief: 'Randy Campbell',
        referee: 'Randy Campbell',
        umpire: 'Mike Johnson',
        headLinesman: 'Tom Peterson',
        lineJudge: 'Steve Anderson',
        fieldJudge: 'Dave Wilson',
        sideJudge: 'Chris Brown',
        backJudge: 'Mark Davis',
        status: 'scheduled',
        scoutingReportSubmitted: false
      },
      {
        id: `w${week}-game-2`,
        homeTeam: 'Colorado School of Mines',
        awayTeam: 'Black Hills State',
        date: '2025-08-23',
        time: '14:00',
        venue: 'Marv Kay Stadium',
        division: 'RMAC',
        crewChief: 'Tom Peterson',
        referee: 'Tom Peterson',
        umpire: 'Randy Campbell',
        headLinesman: 'Mike Johnson',
        lineJudge: 'Dave Wilson',
        fieldJudge: 'Steve Anderson',
        sideJudge: 'Mark Davis',
        backJudge: 'Chris Brown',
        status: 'completed',
        scoutingReportSubmitted: true,
        scoutingRating: 4.2
      },
      {
        id: `w${week}-game-3`,
        homeTeam: 'Colorado Mesa',
        awayTeam: 'Western Colorado',
        date: '2025-08-24',
        time: '18:00',
        venue: 'Stocker Stadium',
        division: 'RMAC',
        crewChief: 'Mike Johnson',
        referee: 'Mike Johnson',
        umpire: 'Tom Peterson',
        headLinesman: 'Randy Campbell',
        lineJudge: 'Chris Brown',
        fieldJudge: 'Mark Davis',
        sideJudge: 'Steve Anderson',
        backJudge: 'Dave Wilson',
        status: 'in-progress',
        scoutingReportSubmitted: false
      },
      {
        id: `w${week}-game-4`,
        homeTeam: 'Adams State',
        awayTeam: 'Fort Lewis',
        date: '2025-08-24',
        time: '13:00',
        venue: 'Rex Stadium',
        division: 'RMAC',
        crewChief: 'Steve Anderson',
        referee: 'Steve Anderson',
        umpire: 'Dave Wilson',
        headLinesman: 'Chris Brown',
        lineJudge: 'Mark Davis',
        fieldJudge: 'Randy Campbell',
        sideJudge: 'Tom Peterson',
        backJudge: 'Mike Johnson',
        status: 'completed',
        scoutingReportSubmitted: false
      },
      {
        id: `w${week}-game-5`,
        homeTeam: 'Chadron State',
        awayTeam: 'Colorado State Pueblo',
        date: '2025-08-25',
        time: '16:00',
        venue: 'Elliott Field',
        division: 'RMAC',
        crewChief: 'Dave Wilson',
        referee: 'Dave Wilson',
        umpire: 'Steve Anderson',
        headLinesman: 'Mark Davis',
        lineJudge: 'Chris Brown',
        fieldJudge: 'Mike Johnson',
        sideJudge: 'Randy Campbell',
        backJudge: 'Tom Peterson',
        status: 'scheduled',
        scoutingReportSubmitted: false
      }
    ];

    // Transform to expected format
    const games = mockGames.map(game => ({
      id: game.id,
      homeTeam: game.homeTeam,
      awayTeam: game.awayTeam,
      date: game.date,
      time: game.time,
      venue: game.venue,
      division: game.division,
      assignedCrew: {
        id: `crew-${game.crewChief.toLowerCase().replace(' ', '-')}`,
        crewChief: game.crewChief,
        crewMembers: {
          referee: game.referee,
          umpire: game.umpire,
          headLinesman: game.headLinesman,
          lineJudge: game.lineJudge,
          fieldJudge: game.fieldJudge,
          sideJudge: game.sideJudge,
          backJudge: game.backJudge
        }
      },
      status: game.status,
      scoutingReport: game.scoutingReportSubmitted ? {
        submitted: true,
        rating: game.scoutingRating || 0,
        submittedBy: game.crewChief
      } : undefined
    }));

    return NextResponse.json({
      success: true,
      week: parseInt(week),
      games,
      totalGames: games.length,
      completedGames: games.filter(g => g.status === 'completed').length,
      pendingReports: games.filter(g => g.status === 'completed' && !g.scoutingReport?.submitted).length
    });

  } catch (error) {
    console.error('Failed to fetch weekly games:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch weekly games',
        games: []
      },
      { status: 500 }
    );
  }
}

// POST endpoint for updating game assignments (future integration)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { gameId, updates } = body;

    // This would integrate with Google Sheets to update assignments
    console.log('Updating game assignment:', gameId, updates);

    return NextResponse.json({
      success: true,
      message: 'Game assignment updated successfully'
    });

  } catch (error) {
    console.error('Failed to update game assignment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update assignment' },
      { status: 500 }
    );
  }
}

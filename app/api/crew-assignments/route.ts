import { NextRequest, NextResponse } from 'next/server';

// Crew assignments and performance data from Google Sheets
interface CrewMember {
  name: string;
  position: string;
  yearsExperience: number;
  rating: number;
}

interface CrewAssignment {
  id: string;
  crewChief: string;
  crewMembers: {
    referee: string;
    umpire: string;
    headLinesman: string;
    lineJudge: string;
    fieldJudge: string;
    sideJudge: string;
    backJudge: string;
  };
  rating: number;
  gamesOfficiated: number;
  avgPenaltiesPerGame: number;
  totalPenalties: number;
  lastGameDate?: string;
  isActive: boolean;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const week = searchParams.get('week') || '1';
    
    // Mock data representing real RMAC crew structure
    // In production, this would pull from Google Sheets with real assignments
    
    const crewAssignments: CrewAssignment[] = [
      {
        id: 'crew-randy-campbell',
        crewChief: 'Randy Campbell',
        crewMembers: {
          referee: 'Randy Campbell',
          umpire: 'Mike Johnson',
          headLinesman: 'Tom Peterson',
          lineJudge: 'Steve Anderson',
          fieldJudge: 'Dave Wilson',
          sideJudge: 'Chris Brown',
          backJudge: 'Mark Davis'
        },
        rating: 4.5,
        gamesOfficiated: 12,
        avgPenaltiesPerGame: 11.2,
        totalPenalties: 134,
        lastGameDate: '2025-08-23',
        isActive: true
      },
      {
        id: 'crew-tom-peterson',
        crewChief: 'Tom Peterson',
        crewMembers: {
          referee: 'Tom Peterson',
          umpire: 'Randy Campbell',
          headLinesman: 'Mike Johnson',
          lineJudge: 'Dave Wilson',
          fieldJudge: 'Steve Anderson',
          sideJudge: 'Mark Davis',
          backJudge: 'Chris Brown'
        },
        rating: 4.1,
        gamesOfficiated: 10,
        avgPenaltiesPerGame: 12.8,
        totalPenalties: 128,
        lastGameDate: '2025-08-23',
        isActive: true
      },
      {
        id: 'crew-mike-johnson',
        crewChief: 'Mike Johnson',
        crewMembers: {
          referee: 'Mike Johnson',
          umpire: 'Tom Peterson',
          headLinesman: 'Randy Campbell',
          lineJudge: 'Chris Brown',
          fieldJudge: 'Mark Davis',
          sideJudge: 'Steve Anderson',
          backJudge: 'Dave Wilson'
        },
        rating: 4.0,
        gamesOfficiated: 9,
        avgPenaltiesPerGame: 13.1,
        totalPenalties: 118,
        lastGameDate: '2025-08-24',
        isActive: true
      },
      {
        id: 'crew-steve-anderson',
        crewChief: 'Steve Anderson',
        crewMembers: {
          referee: 'Steve Anderson',
          umpire: 'Dave Wilson',
          headLinesman: 'Chris Brown',
          lineJudge: 'Mark Davis',
          fieldJudge: 'Randy Campbell',
          sideJudge: 'Tom Peterson',
          backJudge: 'Mike Johnson'
        },
        rating: 3.8,
        gamesOfficiated: 8,
        avgPenaltiesPerGame: 14.2,
        totalPenalties: 114,
        lastGameDate: '2025-08-24',
        isActive: true
      },
      {
        id: 'crew-dave-wilson',
        crewChief: 'Dave Wilson',
        crewMembers: {
          referee: 'Dave Wilson',
          umpire: 'Steve Anderson',
          headLinesman: 'Mark Davis',
          lineJudge: 'Chris Brown',
          fieldJudge: 'Mike Johnson',
          sideJudge: 'Randy Campbell',
          backJudge: 'Tom Peterson'
        },
        rating: 3.9,
        gamesOfficiated: 7,
        avgPenaltiesPerGame: 13.8,
        totalPenalties: 97,
        lastGameDate: '2025-08-25',
        isActive: true
      }
    ];

    // Filter active crews for the requested week
    const activeCrews = crewAssignments.filter(crew => crew.isActive);

    return NextResponse.json({
      success: true,
      week: parseInt(week),
      crews: activeCrews,
      totalCrews: activeCrews.length,
      avgCrewRating: activeCrews.reduce((sum, crew) => sum + crew.rating, 0) / activeCrews.length,
      totalGamesOfficiated: activeCrews.reduce((sum, crew) => sum + crew.gamesOfficiated, 0),
      totalPenaltiesIssued: activeCrews.reduce((sum, crew) => sum + crew.totalPenalties, 0)
    });

  } catch (error) {
    console.error('Failed to fetch crew assignments:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch crew assignments',
        crews: []
      },
      { status: 500 }
    );
  }
}

// POST endpoint for updating crew assignments
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { crewId, updates } = body;

    // This would integrate with Google Sheets to update crew data
    console.log('Updating crew assignment:', crewId, updates);

    return NextResponse.json({
      success: true,
      message: 'Crew assignment updated successfully'
    });

  } catch (error) {
    console.error('Failed to update crew assignment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update crew assignment' },
      { status: 500 }
    );
  }
}

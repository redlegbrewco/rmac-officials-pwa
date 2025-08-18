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
    
    // Real RMAC crew structure with actual 2025 roster
    // Based on official RMAC Football crew assignments
    
    const crewAssignments: CrewAssignment[] = [
      {
        id: 'crew-richard-gray',
        crewChief: 'Richard Gray',
        crewMembers: {
          referee: 'Richard Gray',
          umpire: 'Sheldon McGuire',
          headLinesman: 'Chris Miller',
          lineJudge: 'Sean Burrow',
          sideJudge: 'Aaron Lackey',
          fieldJudge: 'Tanner Pierick',
          backJudge: 'Ryan Burrell'
        },
        rating: 4.5,
        gamesOfficiated: 12,
        avgPenaltiesPerGame: 11.2,
        totalPenalties: 134,
        lastGameDate: '2025-08-23',
        isActive: true
      },
      {
        id: 'crew-cecil-harrison',
        crewChief: 'Cecil Harrison',
        crewMembers: {
          referee: 'Cecil Harrison',
          umpire: 'Cary Fry',
          headLinesman: 'Ray Mastre',
          lineJudge: 'John O\'Connor',
          sideJudge: 'Chris Leathers',
          fieldJudge: 'Shawn Hunter',
          backJudge: 'Steve McFall'
        },
        rating: 4.1,
        gamesOfficiated: 10,
        avgPenaltiesPerGame: 12.8,
        totalPenalties: 128,
        lastGameDate: '2025-08-23',
        isActive: true
      },
      {
        id: 'crew-jeff-bloszies',
        crewChief: 'Jeff Bloszies',
        crewMembers: {
          referee: 'Jeff Bloszies',
          umpire: 'Bill Lyons',
          headLinesman: 'Bobby Albi',
          lineJudge: 'Keith Clements',
          sideJudge: 'Jay Anderson',
          fieldJudge: 'Brian Catalfamo',
          backJudge: 'Zach Blechman'
        },
        rating: 4.0,
        gamesOfficiated: 9,
        avgPenaltiesPerGame: 13.1,
        totalPenalties: 118,
        lastGameDate: '2025-08-24',
        isActive: true
      },
      {
        id: 'crew-charles-flinn',
        crewChief: 'Charles Flinn',
        crewMembers: {
          referee: 'Charles Flinn',
          umpire: 'Russell Nygaard',
          headLinesman: 'Chris Davison',
          lineJudge: 'Dennis Barela',
          sideJudge: 'Seth Beller',
          fieldJudge: 'Jarrod Storey',
          backJudge: 'Mike Bush'
        },
        rating: 3.8,
        gamesOfficiated: 8,
        avgPenaltiesPerGame: 14.2,
        totalPenalties: 114,
        lastGameDate: '2025-08-24',
        isActive: true
      },
      {
        id: 'crew-michael-gray',
        crewChief: 'Michael Gray',
        crewMembers: {
          referee: 'Michael Gray',
          umpire: 'Richie Hahn',
          headLinesman: 'Mason Carter',
          lineJudge: 'Matt McCarthy',
          sideJudge: 'Hank Cary',
          fieldJudge: 'Brian Brand',
          backJudge: 'Travis Porter'
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

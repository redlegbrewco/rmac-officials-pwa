import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Mock RMAC intelligence data
    const intelligenceData = {
      currentFocus: [
        {
          priority: 'high',
          team: 'Colorado Mesa',
          player: '#74',
          issue: 'Excessive holding on sweep plays',
          reportedBy: 'Crew 3',
          timestamp: new Date().toISOString()
        },
        {
          priority: 'medium',
          team: 'Adams State',
          player: 'Team',
          issue: 'High penalty average (8.2/game)',
          reportedBy: 'League Stats',
          timestamp: new Date().toISOString()
        },
        {
          priority: 'medium',
          team: 'Multiple',
          player: 'N/A',
          issue: 'Wind conditions affecting 3 venues',
          reportedBy: 'Weather Service',
          timestamp: new Date().toISOString()
        }
      ],
      weeklyTrends: {
        offensiveHolding: { change: '+23%', direction: 'up' },
        dpi: { change: '-15%', direction: 'down' },
        falseStart: { change: '+8%', direction: 'up' },
        weatherDelays: { count: 4, impact: 'moderate' }
      },
      crewAlerts: [
        'Watch for quick snap counts in red zone',
        'Monitor coach behavior patterns',
        'Enhanced focus on jersey grabbing',
        'Ice conditions at high altitude venues'
      ],
      recentReports: [
        {
          crewId: 'Crew-1',
          report: 'Adams State coach heated about DPI calls - watch for unsportsmanlike',
          time: '2 hours ago'
        },
        {
          crewId: 'Crew-5',
          report: 'Western Colorado using quick snap counts in red zone',
          time: '4 hours ago'
        },
        {
          crewId: 'Crew-3',
          report: 'Colorado Mesa #74 grabbing jerseys on every sweep play',
          time: '6 hours ago'
        }
      ]
    };

    return NextResponse.json({
      success: true,
      data: intelligenceData,
      timestamp: new Date().toISOString(),
      message: 'RMAC intelligence data retrieved successfully'
    });

  } catch (error) {
    console.error('Get RMAC intelligence error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

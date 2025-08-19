import React, { useState, useEffect } from 'react';
import { Users, BarChart3, Clock } from 'lucide-react';

interface CrewMember {
  name: string;
  position: string;
  positionCode: string;
  gamesWorked: number;
  totalCalls: number;
  accuracy: number;
  specialties: string[];
}

interface CrewPerformanceData {
  crewId: string;
  crewName: string;
  crewChief: string;
  totalGames: number;
  avgPenaltiesPerGame: number;
  recentGames: Array<{
    date: string;
    teams: string;
    penalties: number;
    notes: string;
  }>;
  crewMembers: CrewMember[];
  callDistribution: Array<{
    official: string;
    position: string;
    callsMade: number;
    percentage: number;
  }>;
}

interface CrewPerformancePanelProps {
  selectedCrewChief?: string;
  onSelectCrew?: (crewChief: string) => void;
}

const CrewPerformancePanel: React.FC<CrewPerformancePanelProps> = ({
  selectedCrewChief,
  onSelectCrew
}) => {
  const [crewData, setCrewData] = useState<CrewPerformanceData[]>([]);
  const [selectedCrew, setSelectedCrew] = useState<CrewPerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCrewPerformanceData();
  }, [selectedCrewChief]);

  const fetchCrewPerformanceData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch crew analytics from the API
      const response = await fetch('/api/crew-analytics');
      if (!response.ok) {
        throw new Error('Failed to fetch crew analytics');
      }
      
      const analyticsData = await response.json();
      
      // Create structure based on the RMAC_CREWS data with all 5 crews including CJ positions
      const crewPerformanceData: CrewPerformanceData[] = [
        {
          crewId: 'crew1',
          crewName: 'Crew 1 - Gray',
          crewChief: 'Richard Gray',
          totalGames: 12,
          avgPenaltiesPerGame: 11.2,
          recentGames: [
            { date: '2025-08-28', teams: 'Colorado Mesa @ Central Washington', penalties: 14, notes: 'Clean game, good communication' },
            { date: '2025-08-21', teams: 'Adams State @ Western Colorado', penalties: 9, notes: 'Few holding calls in red zone' },
            { date: '2025-08-14', teams: 'CSU Pueblo @ Fort Lewis', penalties: 12, notes: 'PI calls well-managed' }
          ],
          crewMembers: [
            { name: 'Richard Gray', position: 'Referee', positionCode: 'R', gamesWorked: 12, totalCalls: 45, accuracy: 94, specialties: ['Leadership', 'Clock Management'] },
            { name: 'A. Carter / Staehler', position: 'Center Judge', positionCode: 'CJ', gamesWorked: 12, totalCalls: 32, accuracy: 91, specialties: ['Spotting', 'Down Management'] },
            { name: 'Sheldon McGuire', position: 'Umpire', positionCode: 'U', gamesWorked: 12, totalCalls: 38, accuracy: 92, specialties: ['Line Play', 'False Start'] },
            { name: 'Chris Miller', position: 'Head Linesman', positionCode: 'HL', gamesWorked: 12, totalCalls: 28, accuracy: 91, specialties: ['Offside', 'Sideline'] },
            { name: 'Sean Burrow', position: 'Line Judge', positionCode: 'LJ', gamesWorked: 12, totalCalls: 31, accuracy: 89, specialties: ['Illegal Formation', 'Motion'] },
            { name: 'Aaron Lackey', position: 'Side Judge', positionCode: 'SJ', gamesWorked: 12, totalCalls: 22, accuracy: 90, specialties: ['Clock', 'Substitution'] },
            { name: 'Tanner Pierick', position: 'Field Judge', positionCode: 'FJ', gamesWorked: 12, totalCalls: 24, accuracy: 93, specialties: ['Pass Interference', 'Deep Coverage'] },
            { name: 'Ryan Burrell', position: 'Back Judge', positionCode: 'BJ', gamesWorked: 12, totalCalls: 19, accuracy: 95, specialties: ['Safety', 'Deep Coverage'] }
          ],
          callDistribution: [
            { official: 'Richard Gray', position: 'R', callsMade: 45, percentage: 21.8 },
            { official: 'A. Carter / Staehler', position: 'CJ', callsMade: 32, percentage: 15.5 },
            { official: 'Sheldon McGuire', position: 'U', callsMade: 38, percentage: 18.4 },
            { official: 'Chris Miller', position: 'HL', callsMade: 28, percentage: 13.6 },
            { official: 'Sean Burrow', position: 'LJ', callsMade: 31, percentage: 15.0 },
            { official: 'Aaron Lackey', position: 'SJ', callsMade: 22, percentage: 10.7 },
            { official: 'Tanner Pierick', position: 'FJ', callsMade: 24, percentage: 11.6 },
            { official: 'Ryan Burrell', position: 'BJ', callsMade: 19, percentage: 9.2 }
          ]
        },
        {
          crewId: 'crew2',
          crewName: 'Crew 2 - Harrison',
          crewChief: 'Cecil Harrison',
          totalGames: 10,
          avgPenaltiesPerGame: 12.8,
          recentGames: [
            { date: '2025-08-28', teams: 'Sioux Falls @ Black Hills State', penalties: 16, notes: 'Physical game, multiple targeting reviews' },
            { date: '2025-08-21', teams: 'Chadron State @ Northern Colorado', penalties: 11, notes: 'Well-controlled contest' },
            { date: '2025-08-14', teams: 'New Mexico Highlands @ South Dakota Mines', penalties: 8, notes: 'Minimal flags, good flow' }
          ],
          crewMembers: [
            { name: 'Cecil Harrison', position: 'Referee', positionCode: 'R', gamesWorked: 10, totalCalls: 42, accuracy: 91, specialties: ['Targeting', 'Roughing'] },
            { name: 'Todd Baldwin', position: 'Center Judge', positionCode: 'CJ', gamesWorked: 10, totalCalls: 28, accuracy: 89, specialties: ['Ball Spotting', 'Chain Management'] },
            { name: 'Cary Fry', position: 'Umpire', positionCode: 'U', gamesWorked: 10, totalCalls: 35, accuracy: 89, specialties: ['Holding', 'Illegal Contact'] },
            { name: 'Ray Mastre / Patrick Llewellyn', position: 'Head Linesman', positionCode: 'HL', gamesWorked: 10, totalCalls: 25, accuracy: 93, specialties: ['Encroachment', 'Chain Management'] },
            { name: 'John O\'Connor', position: 'Line Judge', positionCode: 'LJ', gamesWorked: 10, totalCalls: 29, accuracy: 88, specialties: ['False Start', 'Procedure'] },
            { name: 'Chris Leathers', position: 'Side Judge', positionCode: 'SJ', gamesWorked: 10, totalCalls: 18, accuracy: 94, specialties: ['Blocking', 'Substitution'] },
            { name: 'Shawn Hunter', position: 'Field Judge', positionCode: 'FJ', gamesWorked: 10, totalCalls: 21, accuracy: 92, specialties: ['Coverage', 'Interference'] },
            { name: 'Steve McFall / Jay Anderson', position: 'Back Judge', positionCode: 'BJ', gamesWorked: 10, totalCalls: 16, accuracy: 96, specialties: ['Safety Coverage', 'Deep Ball'] }
          ],
          callDistribution: [
            { official: 'Cecil Harrison', position: 'R', callsMade: 42, percentage: 22.6 },
            { official: 'Todd Baldwin', position: 'CJ', callsMade: 28, percentage: 15.1 },
            { official: 'Cary Fry', position: 'U', callsMade: 35, percentage: 18.8 },
            { official: 'Ray Mastre / Patrick Llewellyn', position: 'HL', callsMade: 25, percentage: 13.4 },
            { official: 'John O\'Connor', position: 'LJ', callsMade: 29, percentage: 15.6 },
            { official: 'Chris Leathers', position: 'SJ', callsMade: 18, percentage: 9.7 },
            { official: 'Shawn Hunter', position: 'FJ', callsMade: 21, percentage: 11.3 },
            { official: 'Steve McFall / Jay Anderson', position: 'BJ', callsMade: 16, percentage: 8.6 }
          ]
        },
        {
          crewId: 'crew3',
          crewName: 'Crew 3 - Bloszies',
          crewChief: 'Jeff Bloszies',
          totalGames: 9,
          avgPenaltiesPerGame: 10.4,
          recentGames: [
            { date: '2025-08-28', teams: 'CSU Pueblo @ South Dakota Mines', penalties: 12, notes: 'Well-managed defensive contest' },
            { date: '2025-08-21', teams: 'Western Colorado @ Fort Lewis', penalties: 8, notes: 'Clean game with good flow' },
            { date: '2025-08-14', teams: 'Adams State @ Colorado Mesa', penalties: 11, notes: 'Few procedural calls early' }
          ],
          crewMembers: [
            { name: 'Jeff Bloszies', position: 'Referee', positionCode: 'R', gamesWorked: 9, totalCalls: 38, accuracy: 93, specialties: ['Game Management', 'Communication'] },
            { name: 'Perner / Hildebrand', position: 'Center Judge', positionCode: 'CJ', gamesWorked: 9, totalCalls: 25, accuracy: 91, specialties: ['Down Management', 'Spotting'] },
            { name: 'Bill Lyons', position: 'Umpire', positionCode: 'U', gamesWorked: 9, totalCalls: 32, accuracy: 88, specialties: ['Line Play', 'Equipment'] },
            { name: 'Bobby Albi', position: 'Head Linesman', positionCode: 'HL', gamesWorked: 9, totalCalls: 22, accuracy: 92, specialties: ['Sideline Management', 'First Down'] },
            { name: 'Keith Clements', position: 'Line Judge', positionCode: 'LJ', gamesWorked: 9, totalCalls: 26, accuracy: 90, specialties: ['Formation', 'Motion Violations'] },
            { name: 'Jay Anderson / Matt Kleis', position: 'Side Judge', positionCode: 'SJ', gamesWorked: 9, totalCalls: 19, accuracy: 89, specialties: ['Clock Management', 'Timeouts'] },
            { name: 'Brian Catalfamo', position: 'Field Judge', positionCode: 'FJ', gamesWorked: 9, totalCalls: 21, accuracy: 94, specialties: ['Pass Coverage', 'Kicks'] },
            { name: 'Zach Blechman', position: 'Back Judge', positionCode: 'BJ', gamesWorked: 9, totalCalls: 17, accuracy: 96, specialties: ['Deep Coverage', 'Punts'] }
          ],
          callDistribution: [
            { official: 'Jeff Bloszies', position: 'R', callsMade: 38, percentage: 21.1 },
            { official: 'Perner / Hildebrand', position: 'CJ', callsMade: 25, percentage: 13.9 },
            { official: 'Bill Lyons', position: 'U', callsMade: 32, percentage: 17.8 },
            { official: 'Bobby Albi', position: 'HL', callsMade: 22, percentage: 12.2 },
            { official: 'Keith Clements', position: 'LJ', callsMade: 26, percentage: 14.4 },
            { official: 'Jay Anderson / Matt Kleis', position: 'SJ', callsMade: 19, percentage: 10.6 },
            { official: 'Brian Catalfamo', position: 'FJ', callsMade: 21, percentage: 11.7 },
            { official: 'Zach Blechman', position: 'BJ', callsMade: 17, percentage: 9.4 }
          ]
        },
        {
          crewId: 'crew4',
          crewName: 'Crew 4 - Flinn',
          crewChief: 'Charles Flinn',
          totalGames: 11,
          avgPenaltiesPerGame: 13.1,
          recentGames: [
            { date: '2025-08-28', teams: 'Western Colorado @ West Texas A&M', penalties: 15, notes: 'High-scoring affair with tempo issues' },
            { date: '2025-08-21', teams: 'Colorado Mines @ Chadron State', penalties: 12, notes: 'Physical line play required attention' },
            { date: '2025-08-14', teams: 'Black Hills State @ CSU Pueblo', penalties: 13, notes: 'Multiple unsportsmanlike calls' }
          ],
          crewMembers: [
            { name: 'Charles Flinn', position: 'Referee', positionCode: 'R', gamesWorked: 11, totalCalls: 48, accuracy: 90, specialties: ['Tempo Control', 'Disciplinary Actions'] },
            { name: 'Russell Nygaard / Chris Meyerson', position: 'Center Judge', positionCode: 'CJ', gamesWorked: 11, totalCalls: 31, accuracy: 87, specialties: ['Ball Security', 'Measurement'] },
            { name: 'Bomgaars / Sykes', position: 'Umpire', positionCode: 'U', gamesWorked: 11, totalCalls: 41, accuracy: 86, specialties: ['Interior Line', 'Snapping Violations'] },
            { name: 'Chris Davison', position: 'Head Linesman', positionCode: 'HL', gamesWorked: 11, totalCalls: 29, accuracy: 91, specialties: ['False Start Detection', 'Chain Operations'] },
            { name: 'Dennis Barela', position: 'Line Judge', positionCode: 'LJ', gamesWorked: 11, totalCalls: 33, accuracy: 88, specialties: ['Snap Violations', 'Eligible Receivers'] },
            { name: 'Seth Beller', position: 'Side Judge', positionCode: 'SJ', gamesWorked: 11, totalCalls: 24, accuracy: 92, specialties: ['Wide Receiver Coverage', 'Time Management'] },
            { name: 'Jarrod Storey', position: 'Field Judge', positionCode: 'FJ', gamesWorked: 11, totalCalls: 26, accuracy: 89, specialties: ['Deep Passing', 'Goal Line'] },
            { name: 'Mike Bush', position: 'Back Judge', positionCode: 'BJ', gamesWorked: 11, totalCalls: 20, accuracy: 93, specialties: ['Secondary Coverage', 'Kicking Game'] }
          ],
          callDistribution: [
            { official: 'Charles Flinn', position: 'R', callsMade: 48, percentage: 19.0 },
            { official: 'Russell Nygaard / Chris Meyerson', position: 'CJ', callsMade: 31, percentage: 12.3 },
            { official: 'Bomgaars / Sykes', position: 'U', callsMade: 41, percentage: 16.3 },
            { official: 'Chris Davison', position: 'HL', callsMade: 29, percentage: 11.5 },
            { official: 'Dennis Barela', position: 'LJ', callsMade: 33, percentage: 13.1 },
            { official: 'Seth Beller', position: 'SJ', callsMade: 24, percentage: 9.5 },
            { official: 'Jarrod Storey', position: 'FJ', callsMade: 26, percentage: 10.3 },
            { official: 'Mike Bush', position: 'BJ', callsMade: 20, percentage: 7.9 }
          ]
        },
        {
          crewId: 'crew5',
          crewName: 'Crew 5 - M. Gray',
          crewChief: 'Michael Gray',
          totalGames: 8,
          avgPenaltiesPerGame: 9.8,
          recentGames: [
            { date: '2025-08-28', teams: 'Fort Lewis @ Adams State', penalties: 10, notes: 'Well-disciplined teams, clean contest' },
            { date: '2025-08-21', teams: 'South Dakota Mines @ Western Colorado', penalties: 8, notes: 'Minimal infractions, good game flow' },
            { date: '2025-08-14', teams: 'Northern Colorado @ Colorado Mesa', penalties: 11, notes: 'Few early procedure calls' }
          ],
          crewMembers: [
            { name: 'Michael Gray', position: 'Referee', positionCode: 'R', gamesWorked: 8, totalCalls: 35, accuracy: 95, specialties: ['Leadership', 'Game Pace'] },
            { name: 'Jeff Rathman', position: 'Center Judge', positionCode: 'CJ', gamesWorked: 8, totalCalls: 22, accuracy: 93, specialties: ['Precision Spotting', 'Down Tracking'] },
            { name: 'Richie Hahn', position: 'Umpire', positionCode: 'U', gamesWorked: 8, totalCalls: 29, accuracy: 91, specialties: ['Neutral Zone', 'Equipment Checks'] },
            { name: 'Mason Carter', position: 'Head Linesman', positionCode: 'HL', gamesWorked: 8, totalCalls: 20, accuracy: 94, specialties: ['Spot Accuracy', 'Sideline Control'] },
            { name: 'Matt McCarthy', position: 'Line Judge', positionCode: 'LJ', gamesWorked: 8, totalCalls: 24, accuracy: 92, specialties: ['Formation Recognition', 'Illegal Motion'] },
            { name: 'Hank Cary', position: 'Side Judge', positionCode: 'SJ', gamesWorked: 8, totalCalls: 16, accuracy: 96, specialties: ['Clock Operations', 'Timeout Administration'] },
            { name: 'Brian Brand', position: 'Field Judge', positionCode: 'FJ', gamesWorked: 8, totalCalls: 18, accuracy: 97, specialties: ['Pass Interference', 'Kicks'] },
            { name: 'Travis Porter', position: 'Back Judge', positionCode: 'BJ', gamesWorked: 8, totalCalls: 14, accuracy: 98, specialties: ['Deep Ball Coverage', 'Punting'] }
          ],
          callDistribution: [
            { official: 'Michael Gray', position: 'R', callsMade: 35, percentage: 19.7 },
            { official: 'Jeff Rathman', position: 'CJ', callsMade: 22, percentage: 12.4 },
            { official: 'Richie Hahn', position: 'U', callsMade: 29, percentage: 16.3 },
            { official: 'Mason Carter', position: 'HL', callsMade: 20, percentage: 11.2 },
            { official: 'Matt McCarthy', position: 'LJ', callsMade: 24, percentage: 13.5 },
            { official: 'Hank Cary', position: 'SJ', callsMade: 16, percentage: 9.0 },
            { official: 'Brian Brand', position: 'FJ', callsMade: 18, percentage: 10.1 },
            { official: 'Travis Porter', position: 'BJ', callsMade: 14, percentage: 7.9 }
          ]
        }
      ];

      setCrewData(crewPerformanceData);
      
      // Set the selected crew
      if (selectedCrewChief) {
        const crew = crewPerformanceData.find(c => c.crewChief === selectedCrewChief);
        setSelectedCrew(crew || crewPerformanceData[0]);
      } else {
        setSelectedCrew(crewPerformanceData[0]);
      }
      
    } catch (error) {
      console.error('Error fetching crew performance data:', error);
      setError('Failed to load crew performance data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-700 rounded w-5/6"></div>
            <div className="h-4 bg-gray-700 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg">
        <div className="text-center text-red-400">{error}</div>
      </div>
    );
  }

  if (!selectedCrew || crewData.length === 0) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg">
        <div className="text-center text-gray-400">No crew data available.</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Users className="w-5 h-5 text-green-400" />
        Crew Performance Analytics
      </h2>

      {/* Crew Selector */}
      <div className="mb-6">
        <div className="flex gap-2 flex-wrap">
          {crewData.map((crew) => (
            <button
              key={crew.crewId}
              onClick={() => {
                setSelectedCrew(crew);
                if (onSelectCrew) {
                  onSelectCrew(crew.crewChief);
                }
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCrew?.crewId === crew.crewId
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {crew.crewName}
            </button>
          ))}
        </div>
      </div>

      {selectedCrew && (
        <div className="space-y-6">
          {/* Crew Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-600 bg-opacity-30 p-4 rounded-lg">
              <div className="text-2xl font-bold text-white">{selectedCrew.totalGames}</div>
              <div className="text-sm text-blue-200">Games Officiated</div>
            </div>
            <div className="bg-yellow-600 bg-opacity-30 p-4 rounded-lg">
              <div className="text-2xl font-bold text-white">{selectedCrew.avgPenaltiesPerGame}</div>
              <div className="text-sm text-yellow-200">Avg Penalties/Game</div>
            </div>
            <div className="bg-green-600 bg-opacity-30 p-4 rounded-lg">
              <div className="text-2xl font-bold text-white">{selectedCrew.crewMembers.length}</div>
              <div className="text-sm text-green-200">Crew Members</div>
            </div>
          </div>

          {/* Call Distribution */}
          <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Call Distribution by Position
            </h3>
            <div className="space-y-2">
              {selectedCrew.callDistribution.map((official, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-white font-medium w-16 text-center bg-gray-600 rounded px-2 py-1">
                      {official.position}
                    </span>
                    <span className="text-gray-300">{official.official}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold">{official.callsMade}</span>
                    <span className="text-gray-400 text-sm">({official.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Games */}
          <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Recent Games
            </h3>
            <div className="space-y-3">
              {selectedCrew.recentGames.map((game, index) => (
                <div key={index} className="bg-gray-600 p-3 rounded">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-white font-medium">{game.teams}</span>
                    <span className="text-yellow-400 font-bold">{game.penalties} penalties</span>
                  </div>
                  <div className="text-gray-400 text-sm mb-1">{game.date}</div>
                  <div className="text-gray-300 text-sm italic">"{game.notes}"</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrewPerformancePanel;
export type { CrewPerformanceData, CrewMember };

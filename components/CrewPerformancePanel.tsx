import React, { useState, useEffect } from 'react';
import { Users, BarChart3, Award, TrendingUp, TrendingDown, Clock, Target } from 'lucide-react';

interface CrewMember {
  name: string;
  position: string;
  gamesWorked: number;
  totalCalls: number;
  accuracy: number;
  specialties: string[];
}

interface CrewPerformanceData {
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
  onSelectCrew: (crewChief: string) => void;
}

const CrewPerformancePanel: React.FC<CrewPerformancePanelProps> = ({
  selectedCrewChief,
  onSelectCrew
}) => {
  const [crewData, setCrewData] = useState<CrewPerformanceData[]>([]);
  const [selectedCrew, setSelectedCrew] = useState<CrewPerformanceData | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock crew data - in production this would come from your API
  const mockCrewData: CrewPerformanceData[] = [
    {
      crewChief: 'Richard Gray',
      totalGames: 12,
      avgPenaltiesPerGame: 11.2,
      recentGames: [
        { date: '2025-08-28', teams: 'Colorado Mesa @ Central Washington', penalties: 14, notes: 'Clean game, good communication' },
        { date: '2025-08-21', teams: 'Adams State @ Western Colorado', penalties: 9, notes: 'Few holding calls in red zone' },
        { date: '2025-08-14', teams: 'CSU Pueblo @ Fort Lewis', penalties: 12, notes: 'PI calls well-managed' }
      ],
      crewMembers: [
        { name: 'Richard Gray', position: 'Referee', gamesWorked: 12, totalCalls: 45, accuracy: 94, specialties: ['Leadership', 'Clock Management'] },
        { name: 'Sheldon McGuire', position: 'Umpire', gamesWorked: 12, totalCalls: 38, accuracy: 92, specialties: ['Line Play', 'False Start'] },
        { name: 'Chris Miller', position: 'Head Linesman', gamesWorked: 12, totalCalls: 28, accuracy: 91, specialties: ['Offside', 'Sideline'] },
        { name: 'Sean Burrow', position: 'Line Judge', gamesWorked: 12, totalCalls: 31, accuracy: 89, specialties: ['Illegal Formation', 'Motion'] },
        { name: 'Tanner Pierick', position: 'Field Judge', gamesWorked: 12, totalCalls: 24, accuracy: 93, specialties: ['Pass Interference', 'Deep Coverage'] },
        { name: 'Aaron Lackey', position: 'Side Judge', gamesWorked: 12, totalCalls: 22, accuracy: 90, specialties: ['Clock', 'Substitution'] },
        { name: 'Ryan Burrell', position: 'Back Judge', gamesWorked: 12, totalCalls: 19, accuracy: 95, specialties: ['Safety', 'Deep Coverage'] }
      ],
      callDistribution: [
        { official: 'Richard Gray', position: 'R', callsMade: 45, percentage: 21.8 },
        { official: 'Sheldon McGuire', position: 'U', callsMade: 38, percentage: 18.4 },
        { official: 'Chris Miller', position: 'HL', callsMade: 28, percentage: 13.6 },
        { official: 'Sean Burrow', position: 'LJ', callsMade: 31, percentage: 15.0 },
        { official: 'Tanner Pierick', position: 'FJ', callsMade: 24, percentage: 11.6 },
        { official: 'Aaron Lackey', position: 'SJ', callsMade: 22, percentage: 10.7 },
        { official: 'Ryan Burrell', position: 'BJ', callsMade: 19, percentage: 9.2 }
      ]
    },
    {
      crewChief: 'Cecil Harrison',
      totalGames: 10,
      avgPenaltiesPerGame: 12.8,
      recentGames: [
        { date: '2025-08-28', teams: 'Sioux Falls @ Black Hills State', penalties: 16, notes: 'Physical game, multiple targeting reviews' },
        { date: '2025-08-21', teams: 'Chadron State @ Northern Colorado', penalties: 11, notes: 'Well-controlled contest' },
        { date: '2025-08-14', teams: 'New Mexico Highlands @ South Dakota Mines', penalties: 8, notes: 'Minimal flags, good flow' }
      ],
      crewMembers: [
        { name: 'Cecil Harrison', position: 'Referee', gamesWorked: 10, totalCalls: 42, accuracy: 91, specialties: ['Targeting', 'Roughing'] },
        { name: 'Cary Fry', position: 'Umpire', gamesWorked: 10, totalCalls: 35, accuracy: 89, specialties: ['Holding', 'Illegal Contact'] },
        { name: 'Ray Mastre', position: 'Head Linesman', gamesWorked: 10, totalCalls: 25, accuracy: 93, specialties: ['Encroachment', 'Chain Management'] },
        { name: 'John O\'Connor', position: 'Line Judge', gamesWorked: 10, totalCalls: 29, accuracy: 88, specialties: ['False Start', 'Procedure'] },
        { name: 'Shawn Hunter', position: 'Field Judge', gamesWorked: 10, totalCalls: 21, accuracy: 92, specialties: ['Coverage', 'Interference'] },
        { name: 'Chris Leathers', position: 'Side Judge', gamesWorked: 10, totalCalls: 18, accuracy: 94, specialties: ['Blocking', 'Substitution'] },
        { name: 'Steve McFall', position: 'Back Judge', gamesWorked: 10, totalCalls: 16, accuracy: 96, specialties: ['Safety Coverage', 'Deep Ball'] }
      ],
      callDistribution: [
        { official: 'Cecil Harrison', position: 'R', callsMade: 42, percentage: 22.6 },
        { official: 'Cary Fry', position: 'U', callsMade: 35, percentage: 18.8 },
        { official: 'Ray Mastre', position: 'HL', callsMade: 25, percentage: 13.4 },
        { official: 'John O\'Connor', position: 'LJ', callsMade: 29, percentage: 15.6 },
        { official: 'Shawn Hunter', position: 'FJ', callsMade: 21, percentage: 11.3 },
        { official: 'Chris Leathers', position: 'SJ', callsMade: 18, percentage: 9.7 },
        { official: 'Steve McFall', position: 'BJ', callsMade: 16, percentage: 8.6 }
      ]
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setCrewData(mockCrewData);
      if (selectedCrewChief) {
        const crew = mockCrewData.find(c => c.crewChief === selectedCrewChief);
        setSelectedCrew(crew || null);
      } else {
        setSelectedCrew(mockCrewData[0]); // Default to first crew
      }
      setLoading(false);
    }, 1000);
  }, [selectedCrewChief]);

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

  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Users className="w-5 h-5 text-green-400" />
        Crew Performance
      </h2>

      {/* Crew Selector */}
      <div className="mb-6">
        <div className="flex gap-2">
          {crewData.map((crew) => (
            <button
              key={crew.crewChief}
              onClick={() => {
                setSelectedCrew(crew);
                onSelectCrew(crew.crewChief);
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCrew?.crewChief === crew.crewChief
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {crew.crewChief}
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
              Call Distribution
            </h3>
            <div className="space-y-2">
              {selectedCrew.callDistribution.map((official, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-white font-medium w-16">{official.position}</span>
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

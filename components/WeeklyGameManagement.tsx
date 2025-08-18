import React, { useState, useEffect } from 'react';
import { Calendar, Users, BarChart3, FileText, Trophy, AlertCircle } from 'lucide-react';

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
}

interface WeeklyGame {
  id: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
  time: string;
  venue: string;
  division: string;
  assignedCrew?: CrewAssignment;
  status: 'scheduled' | 'in-progress' | 'completed' | 'postponed';
  scoutingReport?: {
    submitted: boolean;
    rating: number;
    submittedBy: string;
  };
}

interface WeeklyGameManagementProps {
  currentWeek: number;
  onSelectGame: (game: WeeklyGame) => void;
  onViewCrewAnalytics: (crewChief: string) => void;
  onViewRMACAnalytics: () => void;
}

export const WeeklyGameManagement: React.FC<WeeklyGameManagementProps> = ({
  currentWeek,
  onSelectGame,
  onViewCrewAnalytics,
  onViewRMACAnalytics
}) => {
  const [selectedWeek, setSelectedWeek] = useState(currentWeek);
  const [weeklyGames, setWeeklyGames] = useState<WeeklyGame[]>([]);
  const [crewAssignments, setCrewAssignments] = useState<CrewAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchWeeklyData(selectedWeek);
  }, [selectedWeek]);

  const fetchWeeklyData = async (week: number) => {
    setIsLoading(true);
    try {
      // Fetch from Google Sheets/Cloud integration
      const [gamesResponse, crewsResponse] = await Promise.all([
        fetch(`/api/weekly-games?week=${week}`),
        fetch(`/api/crew-assignments?week=${week}`)
      ]);
      
      const gamesData = await gamesResponse.json();
      const crewsData = await crewsResponse.json();
      
      setWeeklyGames(gamesData.games || []);
      setCrewAssignments(crewsData.crews || []);
    } catch (error) {
      console.error('Failed to fetch weekly data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-400/20';
      case 'in-progress': return 'text-yellow-400 bg-yellow-400/20';
      case 'scheduled': return 'text-blue-400 bg-blue-400/20';
      case 'postponed': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getCrewRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-400';
    if (rating >= 4.0) return 'text-yellow-400';
    if (rating >= 3.5) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gray-800 rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">RMAC Officials Management</h1>
            <p className="text-gray-400">Week {selectedWeek} • {weeklyGames.length} Games Scheduled</p>
          </div>
          
          <div className="flex gap-3">
            {/* Week Selector */}
            <select 
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(Number(e.target.value))}
              className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600"
            >
              {Array.from({length: 16}, (_, i) => i + 1).map(week => (
                <option key={week} value={week}>Week {week}</option>
              ))}
            </select>
            
            {/* RMAC Analytics Button */}
            <button
              onClick={onViewRMACAnalytics}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <BarChart3 className="w-5 h-5" />
              RMAC Analytics
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-700/50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-blue-400" />
              <span className="text-gray-300">Games This Week</span>
            </div>
            <div className="text-2xl font-bold text-white">{weeklyGames.length}</div>
          </div>
          
          <div className="bg-gray-700/50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-green-400" />
              <span className="text-gray-300">Active Crews</span>
            </div>
            <div className="text-2xl font-bold text-white">{crewAssignments.length}</div>
          </div>
          
          <div className="bg-gray-700/50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-yellow-400" />
              <span className="text-gray-300">Reports Pending</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {weeklyGames.filter(g => g.status === 'completed' && !g.scoutingReport?.submitted).length}
            </div>
          </div>
          
          <div className="bg-gray-700/50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-purple-400" />
              <span className="text-gray-300">Avg Crew Rating</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {crewAssignments.length > 0 
                ? (crewAssignments.reduce((sum, crew) => sum + crew.rating, 0) / crewAssignments.length).toFixed(1)
                : '0.0'
              }
            </div>
          </div>
        </div>
      </div>

      {/* Games and Crew Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Weekly Games List */}
        <div className="lg:col-span-2 bg-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-400" />
            Week {selectedWeek} Games
          </h2>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin text-blue-400">⟳</div>
              <span className="ml-2 text-gray-400">Loading games...</span>
            </div>
          ) : (
            <div className="space-y-3">
              {weeklyGames.map((game) => (
                <div 
                  key={game.id}
                  className="bg-gray-700/50 p-4 rounded-lg hover:bg-gray-700 cursor-pointer transition-colors"
                  onClick={() => onSelectGame(game)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-white">
                        {game.awayTeam} @ {game.homeTeam}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {game.date} • {game.time} • {game.venue}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(game.status)}`}>
                      {game.status.toUpperCase()}
                    </span>
                  </div>
                  
                  {game.assignedCrew && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-300">
                        Crew Chief: {game.assignedCrew.crewChief}
                      </span>
                      <div className="flex items-center gap-2">
                        {game.scoutingReport?.submitted && (
                          <span className="text-green-400 text-xs">✓ Report Filed</span>
                        )}
                        {game.status === 'completed' && !game.scoutingReport?.submitted && (
                          <span className="text-red-400 text-xs flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Report Due
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Crew Analytics Sidebar */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Users className="w-6 h-6 text-green-400" />
            Crew Performance
          </h2>
          
          <div className="space-y-3">
            {crewAssignments.map((crew) => (
              <div 
                key={crew.id}
                className="bg-gray-700/50 p-3 rounded-lg hover:bg-gray-700 cursor-pointer transition-colors"
                onClick={() => onViewCrewAnalytics(crew.crewChief)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-white text-sm">{crew.crewChief}</h4>
                    <p className="text-xs text-gray-400">Chief</p>
                  </div>
                  <span className={`text-sm font-bold ${getCrewRatingColor(crew.rating)}`}>
                    {crew.rating.toFixed(1)}★
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
                  <div>Games: {crew.gamesOfficiated}</div>
                  <div>Avg Pen: {crew.avgPenaltiesPerGame.toFixed(1)}</div>
                </div>
                
                <div className="mt-2 text-xs text-gray-400">
                  <div className="truncate">R: {crew.crewMembers.referee}</div>
                  <div className="truncate">U: {crew.crewMembers.umpire}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyGameManagement;

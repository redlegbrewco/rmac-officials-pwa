import React, { useState, useEffect } from 'react';
import { BarChart3, Users, FileText, TrendingUp, AlertTriangle, Award } from 'lucide-react';

interface RMACAnalytics {
  seasonStats: {
    totalGames: number;
    totalPenalties: number;
    avgPenaltiesPerGame: number;
    totalOfficials: number;
    activeCrews: number;
    completedWeeks: number;
  };
  crewRankings: Array<{
    rank: number;
    crewChief: string;
    gamesOfficiated: number;
    avgPenaltiesPerGame: number;
    trend: 'up' | 'down' | 'stable';
  }>;
  scoutingReports: {
    totalSubmitted: number;
    pendingReports: number;
    recentReports: Array<{
      gameInfo: string;
      crewChief: string;
      date: string;
      keyFindings: string[];
    }>;
  };
  penaltyTrends: {
    byWeek: Array<{
      week: number;
      totalPenalties: number;
      avgPerGame: number;
    }>;
    byType: Array<{
      type: string;
      count: number;
      percentage: number;
    }>;
  };
  officialPerformance: {
    topPerformers: Array<{
      name: string;
      position: string;
      gamesWorked: number;
    }>;
    improvementNeeded: Array<{
      name: string;
      position: string;
      issues: string[];
      recommendedActions: string[];
    }>;
  };
}

interface RMACAnalyticsDashboardProps {
  onClose: () => void;
}

export const RMACAnalyticsDashboard: React.FC<RMACAnalyticsDashboardProps> = ({ onClose }) => {
  const [analytics, setAnalytics] = useState<RMACAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<'overview' | 'crews' | 'scouting' | 'trends' | 'officials'>('overview');

  useEffect(() => {
    fetchRMACAnalytics();
  }, []);

  const fetchRMACAnalytics = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/rmac-analytics');
      const data = await response.json();
      setAnalytics(data.analytics);
    } catch (error) {
      console.error('Failed to fetch RMAC analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'down': return <TrendingUp className="w-4 h-4 text-red-400 rotate-180" />;
      default: return <div className="w-4 h-4 bg-yellow-400 rounded-full" />;
    }
  };

  // Removed rating system - no longer using scoring

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-xl p-8">
          <div className="flex items-center gap-3 text-blue-400">
            <div className="animate-spin">⟳</div>
            <span>Loading RMAC Analytics...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl shadow-xl max-w-7xl w-full max-h-[95vh] overflow-y-auto">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-blue-400" />
              RMAC League Analytics
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg text-gray-400"
            >
              ✕
            </button>
          </div>
          
          {/* Navigation */}
          <div className="flex gap-2 mt-4">
            {[
              { key: 'overview', label: 'Overview', icon: BarChart3 },
              { key: 'crews', label: 'Crew Activity', icon: Users },
              { key: 'scouting', label: 'Scouting Reports', icon: FileText },
              { key: 'trends', label: 'Penalty Trends', icon: TrendingUp },
              { key: 'officials', label: 'Official Performance', icon: Award }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setSelectedView(key as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  selectedView === key 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {analytics && (
            <>
              {/* Overview */}
              {selectedView === 'overview' && (
                <div className="space-y-6">
                  {/* Season Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <div className="bg-gray-700/50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-white">{analytics.seasonStats.totalGames}</div>
                      <div className="text-sm text-gray-400">Total Games</div>
                    </div>
                    <div className="bg-gray-700/50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-white">{analytics.seasonStats.totalPenalties}</div>
                      <div className="text-sm text-gray-400">Total Penalties</div>
                    </div>
                    <div className="bg-gray-700/50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-white">{analytics.seasonStats.avgPenaltiesPerGame.toFixed(1)}</div>
                      <div className="text-sm text-gray-400">Avg/Game</div>
                    </div>
                    <div className="bg-gray-700/50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-white">{analytics.seasonStats.totalOfficials}</div>
                      <div className="text-sm text-gray-400">Officials</div>
                    </div>
                    <div className="bg-gray-700/50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-white">{analytics.seasonStats.activeCrews}</div>
                      <div className="text-sm text-gray-400">Active Crews</div>
                    </div>
                    <div className="bg-gray-700/50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-white">{analytics.seasonStats.completedWeeks}</div>
                      <div className="text-sm text-gray-400">Weeks Completed</div>
                    </div>
                  </div>

                  {/* Quick insights */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-gray-700/30 p-4 rounded-lg">
                      <h3 className="font-bold text-white mb-3">Most Active Crew Chief</h3>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">{analytics.crewRankings[0]?.crewChief}</span>
                        <span className="text-blue-400 font-bold">
                          {analytics.crewRankings[0]?.gamesOfficiated} Games
                        </span>
                      </div>
                    </div>
                    
                    <div className="bg-gray-700/30 p-4 rounded-lg">
                      <h3 className="font-bold text-white mb-3">Scouting Reports</h3>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Total: {analytics.scoutingReports.totalSubmitted}</span>
                        <span className="text-red-400">{analytics.scoutingReports.pendingReports} Pending</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Crew Rankings */}
              {selectedView === 'crews' && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white">Crew Activity Overview</h3>
                  <div className="bg-gray-700/30 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-600">
                        <tr>
                          <th className="text-left p-4 text-gray-300">Rank</th>
                          <th className="text-left p-4 text-gray-300">Crew Chief</th>
                          <th className="text-left p-4 text-gray-300">Games Officiated</th>
                          <th className="text-left p-4 text-gray-300">Avg Penalties/Game</th>
                          <th className="text-left p-4 text-gray-300">Trend</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.crewRankings.map((crew) => (
                          <tr key={crew.rank} className="border-b border-gray-600">
                            <td className="p-4 text-white font-bold">#{crew.rank}</td>
                            <td className="p-4 text-white">{crew.crewChief}</td>
                            <td className="p-4 text-blue-400 font-bold">{crew.gamesOfficiated}</td>
                            <td className="p-4 text-gray-300">{crew.avgPenaltiesPerGame.toFixed(1)}</td>
                            <td className="p-4">{getTrendIcon(crew.trend)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Scouting Reports */}
              {selectedView === 'scouting' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white">Scouting Reports</h3>
                    <div className="flex gap-4 text-sm">
                      <span className="text-green-400">Submitted: {analytics.scoutingReports.totalSubmitted}</span>
                      <span className="text-red-400">Pending: {analytics.scoutingReports.pendingReports}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {analytics.scoutingReports.recentReports.map((report, index) => (
                      <div key={index} className="bg-gray-700/30 p-4 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-bold text-white">{report.gameInfo}</h4>
                            <p className="text-sm text-gray-400">Crew Chief: {report.crewChief}</p>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-blue-400">
                              Report Submitted
                            </div>
                            <div className="text-xs text-gray-400">{report.date}</div>
                          </div>
                        </div>
                        
                        {report.keyFindings.length > 0 && (
                          <div className="mt-3">
                            <h5 className="text-sm font-bold text-gray-300 mb-1">Key Findings:</h5>
                            <ul className="list-disc list-inside text-sm text-gray-400">
                              {report.keyFindings.map((finding, idx) => (
                                <li key={idx}>{finding}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional views would be implemented similarly */}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RMACAnalyticsDashboard;

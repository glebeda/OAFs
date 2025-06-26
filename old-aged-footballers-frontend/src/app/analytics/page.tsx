'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  getPlayerRatings, 
  getBalancingStats,
  PlayerRating, 
  BalancingStats 
} from '@/services/teamBalancingService';
import { FaTrophy, FaUsers, FaChartBar, FaStar } from 'react-icons/fa';
import { Spinner } from '@/components/Spinner';

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playerRatings, setPlayerRatings] = useState<PlayerRating[]>([]);
  const [stats, setStats] = useState<BalancingStats | null>(null);
  const searchParams = useSearchParams();
  const showRatings = searchParams.get('showRatings') === '1';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ratingsData, statsData] = await Promise.all([
        getPlayerRatings(),
        getBalancingStats(),
      ]);
      
      setPlayerRatings(ratingsData.playerRatings);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const getSkillLevel = (rating: number) => {
    if (rating >= 70) return { level: 'Elite', color: 'text-green-600', bg: 'bg-green-50', icon: '⭐' };
    if (rating >= 50) return { level: 'Good', color: 'text-blue-600', bg: 'bg-blue-50', icon: '🔥' };
    if (rating >= 30) return { level: 'Average', color: 'text-yellow-600', bg: 'bg-yellow-50', icon: '⚽' };
    return { level: 'Developing', color: 'text-gray-600', bg: 'bg-gray-50', icon: '🌱' };
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <p className="text-gray-600">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Team Analytics</h1>
        <p className="text-gray-600">Performance insights and team balancing statistics</p>
      </div>

      {/* Overview Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FaTrophy className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Games</p>
                <p className="text-2xl font-bold">{stats.totalGames}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <FaUsers className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Players</p>
                <p className="text-2xl font-bold">{stats.totalPlayers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <FaChartBar className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Goals/Game</p>
                <p className="text-2xl font-bold">{stats.averageGoalsPerGame.toFixed(1)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 rounded-lg">
                <FaStar className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Recent Games</p>
                <p className="text-2xl font-bold">{stats.recentGamesCount}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Player Ratings */}
      {showRatings && (
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Player Performance Ratings</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Player</th>
                  <th className="text-center py-3 px-4 font-medium">Skill Rating</th>
                  <th className="text-center py-3 px-4 font-medium">Goals/Game</th>
                  <th className="text-center py-3 px-4 font-medium">Win Rate</th>
                  <th className="text-center py-3 px-4 font-medium">Games Played</th>
                </tr>
              </thead>
              <tbody>
                {playerRatings
                  .sort((a, b) => b.skillRating - a.skillRating)
                  .map((player) => {
                    const skillLevel = getSkillLevel(player.skillRating);
                    return (
                      <tr key={player.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <span className="text-lg">{skillLevel.icon}</span>
                            <span className="font-medium">{player.name}</span>
                          </div>
                        </td>
                        <td className="text-center py-3 px-4">
                          <span className={`font-bold ${skillLevel.color}`}>
                            {player.skillRating.toFixed(0)}
                          </span>
                        </td>
                        <td className="text-center py-3 px-4">{player.goalsPerGame.toFixed(2)}</td>
                        <td className="text-center py-3 px-4">{(player.winRate * 100).toFixed(1)}%</td>
                        <td className="text-center py-3 px-4">{player.gamesPlayed}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Top Performers */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">Top Scorers (Goals/Game)</h3>
            <div className="space-y-3">
              {stats.topScorers.map((player, index) => (
                <div key={player.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-xs font-bold text-green-600">
                      {index + 1}
                    </div>
                    <span className="font-medium">{player.name}</span>
                  </div>
                  <span className="text-sm text-gray-600">{player.goalsPerGame.toFixed(1)} goals/game</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">Best Win Rates</h3>
            <div className="space-y-3">
              {stats.bestWinRates.map((player, index) => (
                <div key={player.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center text-xs font-bold text-yellow-600">
                      {index + 1}
                    </div>
                    <span className="font-medium">{player.name}</span>
                  </div>
                  <span className="text-sm text-gray-600">{(player.winRate * 100).toFixed(1)}% wins</span>
                </div>
              ))}
            </div>
          </div>

          {/* Best Pairs Widget */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">Best Pairs</h3>
            <div className="space-y-3">
              {stats.bestPairs && stats.bestPairs.length > 0 ? (
                stats.bestPairs.map((pair, index) => (
                  <div key={pair.idA + '-' + pair.idB} className="flex flex-col md:flex-row md:items-center md:justify-between space-y-1 md:space-y-0">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-violet-100 rounded-full flex items-center justify-center text-xs font-bold text-violet-600">
                        {index + 1}
                      </div>
                      <span className="font-medium">{pair.nameA} &amp; {pair.nameB}</span>
                    </div>
                    <span className="text-xs md:text-sm text-gray-600 ml-9 md:ml-2">{pair.winPercent.toFixed(1)}% wins ({pair.gamesWonTogether}/{pair.gamesTogether} games)</span>
                  </div>
                ))
              ) : (
                <div className="text-gray-500">Not enough data yet</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
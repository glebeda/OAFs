'use client';

import { useState, useEffect } from 'react';
import { Game, Player } from '@/types';
import { listGames } from '@/services/gameService';
import { listPlayers } from '@/services/playerService';
import { Tab } from '@headlessui/react';
import { FaTrophy, FaFutbol, FaUsers, FaMedal } from 'react-icons/fa';
import { Spinner } from '@/components/Spinner';

interface PlayerStats {
  id: string;
  name: string;
  totalGoals: number;
  gamesPlayed: number;
  wins: number;
  winRate: number;
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const getMedalColor = (position: number) => {
  switch (position) {
    case 0: return 'text-yellow-400'; // Gold
    case 1: return 'text-slate-400';  // Silver
    case 2: return 'text-amber-600';  // Bronze
    default: return 'text-gray-400';
  }
};

const getPositionBackground = (position: number) => {
  switch (position) {
    case 0: return 'bg-yellow-50 border border-yellow-200';
    case 1: return 'bg-slate-50 border border-slate-200';
    case 2: return 'bg-amber-50 border border-amber-200';
    default: return 'bg-gray-50';
  }
};

export default function LeaderboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playerStats, setPlayerStats] = useState<PlayerStats[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [gamesData, playersData] = await Promise.all([
          listGames(),
          listPlayers(),
        ]);

        // Include both archived and recent games for statistics
        const validGames = gamesData.filter(game => game.status === 'archived' || game.status === 'recent');

        // Calculate statistics
        const stats = calculatePlayerStats(playersData, validGames);
        setPlayerStats(stats);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load leaderboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const calculatePlayerStats = (players: Player[], games: Game[]): PlayerStats[] => {
    const stats = players.map(player => ({
      id: player.id,
      name: player.name,
      totalGoals: 0,
      gamesPlayed: 0,
      wins: 0,
      winRate: 0,
    }));

    games.forEach(game => {
      // Count goals for Team A
      game.teamA.players.forEach(playerId => {
        const playerStat = stats.find(s => s.id === playerId);
        if (playerStat) {
          const goals = game.teamA.playerGoals[playerId] || 0;
          playerStat.totalGoals += goals;
          playerStat.gamesPlayed += 1;
          if (game.teamA.score > game.teamB.score) {
            playerStat.wins += 1;
          }
        }
      });

      // Count goals for Team B
      game.teamB.players.forEach(playerId => {
        const playerStat = stats.find(s => s.id === playerId);
        if (playerStat) {
          const goals = game.teamB.playerGoals[playerId] || 0;
          playerStat.totalGoals += goals;
          playerStat.gamesPlayed += 1;
          if (game.teamB.score > game.teamA.score) {
            playerStat.wins += 1;
          }
        }
      });
    });

    // Calculate win rates
    stats.forEach(stat => {
      stat.winRate = stat.gamesPlayed > 0 
        ? Math.round((stat.wins / stat.gamesPlayed) * 100) 
        : 0;
    });

    return stats;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <p className="text-gray-600">Loading leaderboard data...</p>
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

  const categories = [
    {
      name: 'Top Scorers',
      icon: FaFutbol,
      getData: () => [...playerStats].sort((a, b) => b.totalGoals - a.totalGoals),
      renderStat: (stat: PlayerStats) => `${stat.totalGoals} goals`,
    },
    {
      name: 'Most Wins',
      icon: FaTrophy,
      getData: () => [...playerStats].sort((a, b) => b.winRate - a.winRate),
      renderStat: (stat: PlayerStats) => `${stat.winRate}% (${stat.wins}/${stat.gamesPlayed})`,
    },
    {
      name: 'Most Active',
      icon: FaUsers,
      getData: () => [...playerStats].sort((a, b) => b.gamesPlayed - a.gamesPlayed),
      renderStat: (stat: PlayerStats) => `${stat.gamesPlayed} games`,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Leaderboard</h1>

      <Tab.Group>
        <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
          {categories.map((category) => (
            <Tab
              key={category.name}
              className={({ selected }) =>
                classNames(
                  'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                  'flex items-center justify-center space-x-2',
                  selected
                    ? 'bg-white shadow text-blue-700'
                    : 'text-blue-400 hover:bg-white/[0.12] hover:text-blue-600'
                )
              }
            >
              <category.icon className="h-5 w-5" />
              <span>{category.name}</span>
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className="mt-4">
          {categories.map((category) => (
            <Tab.Panel
              key={category.name}
              className="rounded-xl bg-white p-3 shadow-md"
            >
              <div className="space-y-4">
                {category.getData().map((stat, index) => (
                  <div
                    key={stat.id}
                    className={classNames(
                      'flex items-center justify-between p-3 rounded-lg transition-all duration-200',
                      getPositionBackground(index),
                      index < 3 ? 'transform hover:scale-102 hover:shadow-md' : ''
                    )}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-8 flex justify-center">
                        {index < 3 ? (
                          <FaMedal 
                            className={classNames(
                              'h-6 w-6',
                              getMedalColor(index)
                            )}
                          />
                        ) : (
                          <span className="text-sm font-medium text-gray-400 w-6 text-center">
                            #{index + 1}
                          </span>
                        )}
                      </div>
                      <span className={classNames(
                        'font-medium',
                        index < 3 ? 'text-gray-900' : 'text-gray-600'
                      )}>
                        {stat.name}
                      </span>
                    </div>
                    <span className={classNames(
                      'font-medium',
                      index === 0 ? 'text-yellow-600' :
                      index === 1 ? 'text-slate-600' :
                      index === 2 ? 'text-amber-600' :
                      'text-gray-500'
                    )}>
                      {category.renderStat(stat)}
                    </span>
                  </div>
                ))}
              </div>
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
} 
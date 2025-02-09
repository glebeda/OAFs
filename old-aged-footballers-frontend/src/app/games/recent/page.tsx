'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Game, Player } from '@/types';
import { getRecentGame, updateGame } from '@/services/gameService';
import { listPlayers } from '@/services/playerService';
import toast from 'react-hot-toast';

export default function RecentGamePage() {
  const router = useRouter();
  const [game, setGame] = useState<Game | null>(null);
  const [players, setPlayers] = useState<Record<string, Player>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [gameData, playersData] = await Promise.all([
          getRecentGame(),
          listPlayers(),
        ]);

        if (!gameData) {
          router.push('/games/new');
          return;
        }

        setGame(gameData);
        setPlayers(
          playersData.reduce<Record<string, Player>>(
            (acc: Record<string, Player>, player: Player) => {
              acc[player.id] = player;
              return acc;
            },
            {}
          )
        );
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load game data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleGoalUpdate = async (
    playerId: string,
    team: 'teamA' | 'teamB',
    goals: number
  ) => {
    if (!game) return;

    try {
      setSaving(true);
      const updatedGame = await updateGame(game.id, {
        [team]: {
          ...game[team],
          playerGoals: {
            ...game[team].playerGoals,
            [playerId]: goals,
          },
        },
      });
      setGame(updatedGame);
      toast.success('Goals updated successfully');
    } catch (error) {
      console.error('Error updating goals:', error);
      toast.error('Failed to update goals');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div>Loading game data...</div>
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

  if (!game) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Recent Game Results</h1>
      <div className="mb-4">
        <p className="text-gray-600">Date: {new Date(game.date).toLocaleDateString()}</p>
        {game.notes && <p className="text-gray-600">Notes: {game.notes}</p>}
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* Team A */}
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">
            Team A - {game.teamA.score} goals
          </h2>
          <div className="space-y-4">
            {game.teamA.players.map((playerId) => (
              <div key={playerId} className="flex items-center justify-between">
                <span>{players[playerId]?.name}</span>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="0"
                    value={game.teamA.playerGoals[playerId] || 0}
                    onChange={(e) =>
                      handleGoalUpdate(playerId, 'teamA', parseInt(e.target.value) || 0)
                    }
                    className="w-20 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-500">goals</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team B */}
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">
            Team B - {game.teamB.score} goals
          </h2>
          <div className="space-y-4">
            {game.teamB.players.map((playerId) => (
              <div key={playerId} className="flex items-center justify-between">
                <span>{players[playerId]?.name}</span>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="0"
                    value={game.teamB.playerGoals[playerId] || 0}
                    onChange={(e) =>
                      handleGoalUpdate(playerId, 'teamB', parseInt(e.target.value) || 0)
                    }
                    className="w-20 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-500">goals</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {saving && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-4">Saving changes...</div>
        </div>
      )}
    </div>
  );
} 
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Game, Player } from '@/types';
import { getRecentGame, updateGame } from '@/services/gameService';
import { listPlayers } from '@/services/playerService';
import toast from 'react-hot-toast';
import { GameDisplay } from '@/components/GameDisplay';
import { Spinner } from '@/components/Spinner';
import { FaEdit } from 'react-icons/fa';

export default function RecentGamePage() {
  const router = useRouter();
  const [game, setGame] = useState<Game | null>(null);
  const [players, setPlayers] = useState<Record<string, Player>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    } catch (error) {
      console.error('Error updating goals:', error);
      toast.error('Failed to update goals');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <p className="text-gray-600">Loading recent game...</p>
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

  if (!game) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Recent Game</h1>
        <button
          onClick={() => router.push(`/games/${game.id}/edit`)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <FaEdit className="mr-2" />
          Edit Game
        </button>
      </div>
      <GameDisplay
        game={game}
        players={players}
        onGoalUpdate={handleGoalUpdate}
        isEditable={true}
      />
    </div>
  );
} 
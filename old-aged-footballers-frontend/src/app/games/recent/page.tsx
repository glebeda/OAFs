'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Game, Player } from '@/types';
import { getRecentGame, updateGame } from '@/services/gameService';
import { listPlayers } from '@/services/playerService';
import toast from 'react-hot-toast';
import { GameDisplay } from '@/components/GameDisplay';

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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <GameDisplay
        game={game}
        players={players}
        onGoalUpdate={handleGoalUpdate}
        isEditable={true}
      />

      {saving && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-4">Saving changes...</div>
        </div>
      )}
    </div>
  );
} 
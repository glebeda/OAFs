'use client';

import { useState, useEffect } from 'react';
import { Game, Player } from '@/types';
import { listGames } from '@/services/gameService';
import { listPlayers } from '@/services/playerService';
import toast from 'react-hot-toast';

export default function GamesArchivePage() {
  const [games, setGames] = useState<Game[]>([]);
  const [players, setPlayers] = useState<Record<string, Player>>({});
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [gamesData, playersData] = await Promise.all([
          listGames(),
          listPlayers(),
        ]);

        // Filter for archived games and sort by date (newest first)
        const archivedGames = gamesData
          .filter(game => game.status === 'archived')
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        setGames(archivedGames);
        setPlayers(
          playersData.reduce<Record<string, Player>>(
            (acc, player) => {
              acc[player.id] = player;
              return acc;
            },
            {}
          )
        );
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load games data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div>Loading games data...</div>
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
      <h1 className="text-2xl font-bold mb-8">Games Archive</h1>
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* Games List */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Past Games</h2>
          {games.length === 0 ? (
            <p className="text-gray-500">No archived games found.</p>
          ) : (
            <div className="space-y-4">
              {games.map((game) => (
                <button
                  key={game.id}
                  onClick={() => setSelectedGame(game)}
                  className={`w-full text-left p-4 rounded-lg border transition-colors duration-200 ${
                    selectedGame?.id === game.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">
                        {new Date(game.date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        Team A {game.teamA.score} - {game.teamB.score} Team B
                      </p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {game.teamA.players.length + game.teamB.players.length} players
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Game Details */}
        {selectedGame && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Game Details</h2>
            <div className="mb-4">
              <p className="text-gray-600">
                Date: {new Date(selectedGame.date).toLocaleDateString()}
              </p>
              {selectedGame.notes && (
                <p className="text-gray-600 mt-2">Notes: {selectedGame.notes}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-8">
              {/* Team A */}
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3">
                  Team A - {selectedGame.teamA.score} goals
                </h3>
                <div className="space-y-2">
                  {selectedGame.teamA.players.map((playerId) => (
                    <div key={playerId} className="flex justify-between items-center">
                      <span>{players[playerId]?.name}</span>
                      <span className="text-gray-600">
                        {selectedGame.teamA.playerGoals[playerId] || 0} goals
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Team B */}
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3">
                  Team B - {selectedGame.teamB.score} goals
                </h3>
                <div className="space-y-2">
                  {selectedGame.teamB.players.map((playerId) => (
                    <div key={playerId} className="flex justify-between items-center">
                      <span>{players[playerId]?.name}</span>
                      <span className="text-gray-600">
                        {selectedGame.teamB.playerGoals[playerId] || 0} goals
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
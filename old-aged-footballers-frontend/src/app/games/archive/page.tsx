'use client';

import { useState, useEffect } from 'react';
import { Game, Player } from '@/types';
import { listGames } from '@/services/gameService';
import { listPlayers } from '@/services/playerService';
import { GameDisplay } from '@/components/GameDisplay';
import { CustomSelect } from '@/components/CustomSelect';
import { Spinner } from '@/components/Spinner';

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

        // Select the most recent game by default
        if (archivedGames.length > 0) {
          setSelectedGame(archivedGames[0]);
        }
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
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <p className="text-gray-600">Loading games data...</p>
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

  const gameOptions = games.map(game => ({
    value: game.id,
    label: `${new Date(game.date).toLocaleDateString()} - Bibs ${game.teamA.score} : ${game.teamB.score} Shirts`,
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Games Archive</h1>
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* Games List - Desktop */}
        <div className="hidden md:block bg-white rounded-lg shadow p-6">
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
                        Bibs {game.teamA.score} - {game.teamB.score} Shirts
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

        {/* Games Dropdown - Mobile */}
        <div className="md:hidden mb-6">
          <CustomSelect
            value={selectedGame?.id || ''}
            onChange={(value) => {
              const game = games.find(g => g.id === value);
              if (game) setSelectedGame(game);
            }}
            options={gameOptions}
            label="Select a game"
            placeholder="Choose a game to view"
          />
        </div>

        {/* Game Details */}
        {selectedGame && (
          <div className="md:col-start-2">
            <GameDisplay
              game={selectedGame}
              players={players}
              isEditable={false}
            />
          </div>
        )}
      </div>
    </div>
  );
} 
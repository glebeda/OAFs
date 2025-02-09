import { useState, useEffect } from 'react';
import { Player } from '@/types';
import { listPlayers } from '@/services/playerService';

interface TeamSelectionProps {
  teamAPlayers: string[];
  teamBPlayers: string[];
  onTeamAChange: (players: string[]) => void;
  onTeamBChange: (players: string[]) => void;
}

export default function TeamSelection({
  teamAPlayers,
  teamBPlayers,
  onTeamAChange,
  onTeamBChange,
}: TeamSelectionProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const data = await listPlayers();
        setPlayers(data);
        setError(null);
      } catch (error) {
        console.error('Failed to load players:', error);
        setError('Failed to load players');
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  const handlePlayerSelect = (playerId: string, team: 'A' | 'B') => {
    if (team === 'A') {
      if (teamAPlayers.includes(playerId)) {
        onTeamAChange(teamAPlayers.filter((id) => id !== playerId));
      } else {
        onTeamAChange([...teamAPlayers, playerId]);
      }
    } else {
      if (teamBPlayers.includes(playerId)) {
        onTeamBChange(teamBPlayers.filter((id) => id !== playerId));
      } else {
        onTeamBChange([...teamBPlayers, playerId]);
      }
    }
  };

  if (loading) {
    return <div>Loading players...</div>;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Team A */}
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-medium mb-4">Team A</h3>
        <div className="space-y-2">
          {players.map((player) => (
            <label
              key={`a-${player.id}`}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={teamAPlayers.includes(player.id)}
                onChange={() => handlePlayerSelect(player.id, 'A')}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                disabled={teamBPlayers.includes(player.id)}
              />
              <span>{player.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Available Players */}
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-medium mb-4">Available Players</h3>
        <div className="space-y-2">
          {players.map((player) => (
            <div
              key={player.id}
              className={`p-2 rounded ${
                teamAPlayers.includes(player.id)
                  ? 'bg-blue-100'
                  : teamBPlayers.includes(player.id)
                  ? 'bg-red-100'
                  : 'bg-gray-50'
              }`}
            >
              {player.name}
            </div>
          ))}
        </div>
      </div>

      {/* Team B */}
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-medium mb-4">Team B</h3>
        <div className="space-y-2">
          {players.map((player) => (
            <label
              key={`b-${player.id}`}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={teamBPlayers.includes(player.id)}
                onChange={() => handlePlayerSelect(player.id, 'B')}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                disabled={teamAPlayers.includes(player.id)}
              />
              <span>{player.name}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
} 
import { useState, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import { Player } from '@/types';
import { listPlayers } from '@/services/playerService';
import { FaUsers, FaTshirt, FaVest } from 'react-icons/fa';

interface TeamSelectionProps {
  teamAPlayers: string[];
  teamBPlayers: string[];
  onTeamAChange: (players: string[]) => void;
  onTeamBChange: (players: string[]) => void;
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
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
        // Sort players alphabetically by name
        const sortedPlayers = [...data].sort((a, b) => 
          a.name.localeCompare(b.name)
        );
        setPlayers(sortedPlayers);
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

  const tabs = [
    { name: 'Bibs', icon: FaVest, players: teamAPlayers, team: 'A' as const },
    { name: 'Shirts', icon: FaTshirt, players: teamBPlayers, team: 'B' as const },
    { name: 'Available', icon: FaUsers, players: [] as string[], team: null },
  ] as const;

  // Mobile View
  const renderMobileView = () => (
    <div className="md:hidden">
      <Tab.Group>
        <Tab.List className="flex space-x-1 rounded-xl bg-indigo-900/10 p-1">
          {tabs.map((tab) => (
            <Tab
              key={tab.name}
              className={({ selected }) =>
                classNames(
                  'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                  'flex items-center justify-center space-x-2',
                  selected
                    ? 'bg-white shadow text-indigo-700'
                    : 'text-indigo-500 hover:bg-white/[0.12] hover:text-indigo-600'
                )
              }
            >
              <tab.icon className="h-5 w-5" />
              <span>{tab.name}</span>
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className="mt-4">
          {tabs.map((tab) => (
            <Tab.Panel
              key={tab.name}
              className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-gray-200"
            >
              <div className="space-y-3">
                {players.map((player) => {
                  const isSelected = tab.players.includes(player.id);
                  const isDisabled = tab.team === null 
                    ? teamAPlayers.includes(player.id) || teamBPlayers.includes(player.id)
                    : tab.team === 'A' 
                      ? teamBPlayers.includes(player.id)
                      : teamAPlayers.includes(player.id);

                  return (
                    <div
                      key={player.id}
                      className={classNames(
                        'flex items-center justify-between p-3 rounded-lg',
                        isDisabled ? 'opacity-50' : 'cursor-pointer',
                        isSelected ? 'bg-indigo-50 border border-indigo-200' : 'bg-gray-50'
                      )}
                      onClick={() => {
                        if (!isDisabled && tab.team !== null) {
                          handlePlayerSelect(player.id, tab.team);
                        }
                      }}
                    >
                      <span className="font-medium">{player.name}</span>
                      {tab.team !== null && (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          disabled={isDisabled}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
    </div>
  );

  // Desktop View
  const renderDesktopView = () => (
    <div className="hidden md:grid md:grid-cols-3 gap-8">
      {/* Team A */}
      <div className="bg-white rounded-lg shadow-sm ring-1 ring-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-6">
          <FaVest className="h-6 w-6 text-indigo-600" />
          <h3 className="text-lg font-medium">Bibs</h3>
        </div>
        <div className="space-y-3">
          {players.map((player) => (
            <label
              key={`a-${player.id}`}
              className={classNames(
                'flex items-center justify-between p-4 rounded-lg',
                teamBPlayers.includes(player.id) ? 'opacity-50' : 'cursor-pointer',
                teamAPlayers.includes(player.id) ? 'bg-indigo-50 border border-indigo-200' : 'bg-gray-50'
              )}
            >
              <span className="font-medium">{player.name}</span>
              <input
                type="checkbox"
                checked={teamAPlayers.includes(player.id)}
                onChange={() => handlePlayerSelect(player.id, 'A')}
                className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                disabled={teamBPlayers.includes(player.id)}
              />
            </label>
          ))}
        </div>
      </div>

      {/* Available Players */}
      <div className="bg-white rounded-lg shadow-sm ring-1 ring-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-6">
          <FaUsers className="h-6 w-6 text-indigo-600" />
          <h3 className="text-lg font-medium">Available Players</h3>
        </div>
        <div className="space-y-3">
          {players.map((player) => (
            <div
              key={player.id}
              className={classNames(
                'p-4 rounded-lg',
                teamAPlayers.includes(player.id)
                  ? 'bg-indigo-50 border border-indigo-200'
                  : teamBPlayers.includes(player.id)
                  ? 'bg-rose-50 border border-rose-200'
                  : 'bg-gray-50'
              )}
            >
              {player.name}
            </div>
          ))}
        </div>
      </div>

      {/* Team B */}
      <div className="bg-white rounded-lg shadow-sm ring-1 ring-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-6">
          <FaTshirt className="h-6 w-6 text-indigo-600" />
          <h3 className="text-lg font-medium">Shirts</h3>
        </div>
        <div className="space-y-3">
          {players.map((player) => (
            <label
              key={`b-${player.id}`}
              className={classNames(
                'flex items-center justify-between p-4 rounded-lg',
                teamAPlayers.includes(player.id) ? 'opacity-50' : 'cursor-pointer',
                teamBPlayers.includes(player.id) ? 'bg-rose-50 border border-rose-200' : 'bg-gray-50'
              )}
            >
              <span className="font-medium">{player.name}</span>
              <input
                type="checkbox"
                checked={teamBPlayers.includes(player.id)}
                onChange={() => handlePlayerSelect(player.id, 'B')}
                className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                disabled={teamAPlayers.includes(player.id)}
              />
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {renderMobileView()}
      {renderDesktopView()}
    </>
  );
} 
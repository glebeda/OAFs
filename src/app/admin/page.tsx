'use client';

import { FaUserPlus, FaSearch } from 'react-icons/fa';
import { useState } from 'react';
import { Player } from '@/types';
import { PlayerFormModal } from '@/components/PlayerFormModal';

// Temporary mock data - replace with actual API calls
const mockPlayers: Player[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phoneNumber: '+1234567890',
    isActive: true,
    joinedDate: '2024-01-15',
  },
  // Add more mock players as needed
];

export default function AdminPage() {
  const [players, setPlayers] = useState<Player[]>(mockPlayers);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | undefined>();

  const filteredPlayers = players.filter(player =>
    player.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddPlayer = (playerData: Omit<Player, 'id'>) => {
    const newPlayer: Player = {
      ...playerData,
      id: Date.now().toString(), // Temporary ID generation - replace with proper UUID in production
    };
    setPlayers(prev => [...prev, newPlayer]);
  };

  const handleEditPlayer = (playerData: Omit<Player, 'id'>) => {
    if (!selectedPlayer) return;
    
    setPlayers(prev =>
      prev.map(p =>
        p.id === selectedPlayer.id
          ? { ...playerData, id: selectedPlayer.id }
          : p
      )
    );
  };

  const handleDeletePlayer = (playerId: string) => {
    if (window.confirm('Are you sure you want to delete this player?')) {
      setPlayers(prev => prev.filter(p => p.id !== playerId));
    }
  };

  const openAddModal = () => {
    setSelectedPlayer(undefined);
    setIsModalOpen(true);
  };

  const openEditModal = (player: Player) => {
    setSelectedPlayer(player);
    setIsModalOpen(true);
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Player Management</h1>
          <p className="mt-2 text-sm text-gray-600">Add, edit, or remove players from the system</p>
        </div>

        {/* Action Bar */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Search players..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FaUserPlus className="-ml-1 mr-2 h-5 w-5" />
            Add New Player
          </button>
        </div>

        {/* Players Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined Date
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPlayers.map((player) => (
                <tr key={player.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{player.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{player.email}</div>
                    <div className="text-sm text-gray-500">{player.phoneNumber}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      player.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {player.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(player.joinedDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => openEditModal(player)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeletePlayer(player.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <PlayerFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        player={selectedPlayer}
        onSubmit={selectedPlayer ? handleEditPlayer : handleAddPlayer}
        title={selectedPlayer ? 'Edit Player' : 'Add New Player'}
      />
    </main>
  );
} 
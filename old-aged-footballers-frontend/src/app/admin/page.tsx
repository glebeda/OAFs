'use client';

import { FaUserPlus, FaSearch } from 'react-icons/fa';
import { useState } from 'react';
import { Player, UpdatePlayerDto, CreatePlayerDto } from '@/types';
import { PlayerFormModal } from '@/components/PlayerFormModal';
import { DeleteConfirmationModal } from '@/components/DeleteConfirmationModal';
import { playerApi } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import axios from 'axios';
import { Spinner } from '@/components/Spinner';

export default function AdminPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | undefined>();
  const [playerToDelete, setPlayerToDelete] = useState<Player | undefined>();
  const queryClient = useQueryClient();

  // Fetch players
  const { data: players = [], isLoading, error } = useQuery({
    queryKey: ['players'],
    queryFn: playerApi.getAllPlayers
  });

  // Create player mutation
  const createPlayerMutation = useMutation({
    mutationFn: playerApi.createPlayer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] });
      toast.success('Player created successfully');
      setIsModalOpen(false);
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        toast.error('A player with this name already exists');
      } else {
        toast.error('Failed to create player');
      }
    }
  });

  // Update player mutation
  const updatePlayerMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePlayerDto }) => 
      playerApi.updatePlayer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] });
      toast.success('Player updated successfully');
      setIsModalOpen(false);
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        toast.error('A player with this name already exists');
      } else {
        toast.error('Failed to update player');
      }
    }
  });

  // Delete player mutation
  const deletePlayerMutation = useMutation({
    mutationFn: playerApi.deletePlayer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] });
      toast.success('Player deleted successfully');
      setIsDeleteModalOpen(false);
      setPlayerToDelete(undefined);
    },
    onError: () => {
      toast.error('Failed to delete player');
    }
  });

  const filteredPlayers = players.filter(player =>
    player.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddPlayer = async (playerData: CreatePlayerDto) => {
    createPlayerMutation.mutate(playerData);
  };

  const handleEditPlayer = async (playerData: UpdatePlayerDto) => {
    if (!selectedPlayer) return;
    
    updatePlayerMutation.mutate({
      id: selectedPlayer.id,
      data: playerData
    });
  };

  const handleDeletePlayer = async (player: Player) => {
    setPlayerToDelete(player);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!playerToDelete) return;
    deletePlayerMutation.mutate(playerToDelete.id);
  };

  const openAddModal = () => {
    setSelectedPlayer(undefined);
    setIsModalOpen(true);
  };

  const openEditModal = (player: Player) => {
    setSelectedPlayer(player);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <p className="text-gray-600">Loading player data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Error loading players</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Player Management</h1>
          <p className="mt-2 text-sm text-gray-600">Add, edit, or remove players from the system</p>
        </div>

        {/* Action Bar */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
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
            className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-3 sm:py-2 border border-transparent shadow-sm text-base sm:text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FaUserPlus className="-ml-1 mr-2 h-5 w-5" />
            Add New Player
          </button>
        </div>

        {/* Players List - Responsive Layout */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {/* Desktop Table View */}
          <div className="hidden sm:block">
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
                        onClick={() => handleDeletePlayer(player)}
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

          {/* Mobile Card View */}
          <div className="sm:hidden">
            <ul className="divide-y divide-gray-200">
              {filteredPlayers.map((player) => (
                <li key={player.id} className="p-4 hover:bg-gray-50">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <p className="text-base font-medium text-gray-900">{player.name}</p>
                        {player.email && (
                          <p className="text-sm text-gray-500">{player.email}</p>
                        )}
                        {player.phoneNumber && (
                          <p className="text-sm text-gray-500">{player.phoneNumber}</p>
                        )}
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        player.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {player.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        Joined: {new Date(player.joinedDate).toLocaleDateString()}
                      </span>
                      <div className="flex space-x-4">
                        <button
                          onClick={() => openEditModal(player)}
                          className="inline-flex items-center px-3 py-2 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeletePlayer(player)}
                          className="inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <PlayerFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        player={selectedPlayer}
        onSubmit={(data) => {
          if (selectedPlayer) {
            handleEditPlayer(data as UpdatePlayerDto);
          } else {
            handleAddPlayer(data as CreatePlayerDto);
          }
        }}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setPlayerToDelete(undefined);
        }}
        onConfirm={confirmDelete}
        playerName={playerToDelete?.name || ''}
      />
    </main>
  );
} 
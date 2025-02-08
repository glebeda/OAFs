import axios from 'axios';
import { Player, CreatePlayerDto, UpdatePlayerDto } from '@/types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Player API functions
export const playerApi = {
  // Create a new player
  createPlayer: async (data: CreatePlayerDto) => {
    const response = await api.post<Player>('/players', data);
    return response.data;
  },

  // Get all players
  getAllPlayers: async () => {
    const response = await api.get<Player[]>('/players');
    return response.data;
  },

  // Get player by ID
  getPlayerById: async (id: string) => {
    const response = await api.get<Player>(`/players/id/${id}`);
    return response.data;
  },

  // Get player by name
  getPlayerByName: async (name: string) => {
    const response = await api.get<Player>(`/players/name/${name}`);
    return response.data;
  },

  // Update player
  updatePlayer: async (id: string, data: UpdatePlayerDto) => {
    const response = await api.put<Player>(`/players/${id}`, data);
    return response.data;
  },

  // Delete player
  deletePlayer: async (id: string) => {
    await api.delete(`/players/${id}`);
  },
};

export default api;
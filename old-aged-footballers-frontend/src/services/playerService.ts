import { Player, CreatePlayerDto, UpdatePlayerDto } from '@/types';
import { API_BASE_URL } from '@/config';

export async function createPlayer(data: CreatePlayerDto): Promise<Player> {
  const response = await fetch(`${API_BASE_URL}/players`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to create player');
  }

  return response.json();
}

export async function getPlayer(id: string): Promise<Player> {
  const response = await fetch(`${API_BASE_URL}/players/${id}`);

  if (!response.ok) {
    throw new Error('Failed to get player');
  }

  return response.json();
}

export async function updatePlayer(id: string, data: UpdatePlayerDto): Promise<Player> {
  const response = await fetch(`${API_BASE_URL}/players/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to update player');
  }

  return response.json();
}

export async function deletePlayer(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/players/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete player');
  }
}

export async function listPlayers(): Promise<Player[]> {
  const response = await fetch(`${API_BASE_URL}/players`);

  if (!response.ok) {
    throw new Error('Failed to list players');
  }

  return response.json();
} 
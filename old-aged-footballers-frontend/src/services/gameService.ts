import { Game, CreateGameDto, UpdateGameDto } from '@/types';
import { API_BASE_URL } from '@/config';

export async function createGame(data: CreateGameDto): Promise<Game> {
  const response = await fetch(`${API_BASE_URL}/games`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to create game');
  }

  return response.json();
}

export async function getGame(id: string): Promise<Game> {
  const response = await fetch(`${API_BASE_URL}/games/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch game');
  }

  return response.json();
}

export async function updateGame(id: string, data: UpdateGameDto): Promise<Game> {
  const response = await fetch(`${API_BASE_URL}/games/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to update game');
  }

  return response.json();
}

export async function listGames(): Promise<Game[]> {
  const response = await fetch(`${API_BASE_URL}/games`);

  if (!response.ok) {
    throw new Error('Failed to list games');
  }

  return response.json();
}

export async function getRecentGame(): Promise<Game | null> {
  const response = await fetch(`${API_BASE_URL}/games/recent`);

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error('Failed to get recent game');
  }

  return response.json();
}

export async function archiveGame(id: string): Promise<Game> {
  const response = await fetch(`${API_BASE_URL}/games/${id}/archive`, {
    method: 'PUT',
  });

  if (!response.ok) {
    throw new Error('Failed to archive game');
  }

  return response.json();
} 
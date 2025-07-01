import { API_BASE_URL } from '@/config';

export interface SpondPlayerMatch {
  spondName: string;
  spondId: string;
  oafPlayerId?: string;
  oafPlayerName?: string;
  matched: boolean;
}

export interface SpondImportResult {
  matchedPlayers: SpondPlayerMatch[];
  unmatchedPlayers: string[];
  totalSpondPlayers: number;
  totalMatched: number;
  totalUnmatched: number;
}

export interface RateLimitInfo {
  used: number;
  remaining: number;
  resetTime: string;
}

export interface SpondGame {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  participants: SpondParticipant[];
  groupId: string;
  description?: string;
  location?: string;
}

export interface SpondParticipant {
  id: string;
  name: string;
  status: 'accepted' | 'declined' | 'pending';
  profileId?: string;
  email?: string;
}

/**
 * Test Spond connection
 */
export async function testSpondConnection(): Promise<{ status: string; message: string }> {
  const response = await fetch(`${API_BASE_URL}/spond/test`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to test Spond connection');
  }

  return response.json();
}

/**
 * Get rate limit information
 */
export async function getSpondRateLimit(): Promise<RateLimitInfo> {
  const response = await fetch(`${API_BASE_URL}/spond/rate-limit`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to get rate limit information');
  }

  return response.json();
}

/**
 * Import players from Spond for a specific date
 */
export async function importSpondPlayers(gameDate: string): Promise<SpondImportResult> {
  const response = await fetch(`${API_BASE_URL}/spond/import/${gameDate}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to import players from Spond');
  }

  return response.json();
}

/**
 * Get upcoming games from Spond
 */
export async function getSpondUpcomingGames(): Promise<SpondGame[]> {
  const response = await fetch(`${API_BASE_URL}/spond/games`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch upcoming games from Spond');
  }

  return response.json();
} 
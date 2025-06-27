import { API_BASE_URL } from '@/config';

export interface PlayerRating {
  id: string;
  name: string;
  skillRating: number;
  goalsPerGame: number;
  winRate: number;
  gamesPlayed: number;
  recentForm: number;
  teamChemistry: Record<string, number>;
}

export interface TeamSuggestion {
  teamA: string[];
  teamB: string[];
  balanceScore: number;
  chemistryScore: number;
  rotationScore: number;
  totalScore: number;
  reasoning: string[];
}

export interface TeamBalancingOptions {
  maxTeamSize?: number;
  minTeamSize?: number;
  skillWeight?: number;
  chemistryWeight?: number;
  rotationWeight?: number;
  recentGamesWeight?: number;
  maxSuggestions?: number;
}

export interface BestPair {
  idA: string;
  idB: string;
  nameA: string;
  nameB: string;
  gamesTogether: number;
  gamesWonTogether: number;
  winPercent: number;
}

export interface BalancingStats {
  totalGames: number;
  totalPlayers: number;
  averageGoalsPerGame: number;
  skillDistribution: {
    high: number;
    medium: number;
    low: number;
  };
  mostActivePlayers: Array<{
    id: string;
    name: string;
    gamesPlayed: number;
  }>;
  topScorers: Array<{
    id: string;
    name: string;
    goalsPerGame: number;
  }>;
  bestWinRates: Array<{
    id: string;
    name: string;
    winRate: number;
  }>;
  recentGamesCount: number;
  bestPairs: BestPair[];
}

/**
 * Get team suggestions based on available players
 */
export async function getTeamSuggestions(
  availablePlayers: string[],
  options?: TeamBalancingOptions
): Promise<{
  suggestions: TeamSuggestion[];
  playerRatings: PlayerRating[];
  totalPlayers: number;
  recentGamesCount: number;
}> {
  const response = await fetch(`${API_BASE_URL}/team-balancing/suggestions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      availablePlayers,
      options,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get team suggestions');
  }

  return response.json();
}

/**
 * Get player ratings and statistics
 */
export async function getPlayerRatings(): Promise<{
  playerRatings: PlayerRating[];
  totalPlayers: number;
  totalGames: number;
}> {
  const response = await fetch(`${API_BASE_URL}/team-balancing/ratings`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get player ratings');
  }

  return response.json();
}

/**
 * Get team balancing statistics and insights
 */
export async function getBalancingStats(): Promise<BalancingStats> {
  const response = await fetch(`${API_BASE_URL}/team-balancing/stats`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get balancing statistics');
  }

  return response.json();
} 
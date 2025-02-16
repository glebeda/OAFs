export interface Game {
  id: string;
  date: string;
  notes?: string;
  teamA: TeamInfo;
  teamB: TeamInfo;
  status: 'draft' | 'recent' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface TeamInfo {
  players: string[];
  playerGoals: Record<string, number>;
  score: number;
}

export interface CreateGameDto {
  date: string;
  notes?: string;
  teamA: {
    players: string[];
  };
  teamB: {
    players: string[];
  };
}

export interface UpdateGameDto {
  date?: string;
  notes?: string;
  teamA?: {
    players?: string[];
    score?: number;
    playerGoals?: Record<string, number>;
  };
  teamB?: {
    players?: string[];
    score?: number;
    playerGoals?: Record<string, number>;
  };
  status?: 'draft' | 'recent' | 'archived';
} 
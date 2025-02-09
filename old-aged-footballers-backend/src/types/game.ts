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
  players: string[]; // Player IDs
  score: number;
  playerGoals: Record<string, number>; // Player ID to goals mapping
}

export interface CreateGameDto {
  date: string;
  notes?: string;
  teamA: {
    players: string[];
    score: number;
  };
  teamB: {
    players: string[];
    score: number;
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
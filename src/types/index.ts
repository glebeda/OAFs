export interface Player {
  id: string;
  name: string;
  email?: string;
  phoneNumber?: string;
  isActive: boolean;
  joinedDate: string;
  // Additional fields that might be useful for statistics
  gamesPlayed?: number;
  goalsScored?: number;
}

export interface Game {
  id: string;
  date: string;
  location: string;
  players: string[];
  status: 'upcoming' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}
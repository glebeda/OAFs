export interface Player {
  id: string;
  name: string;
  email?: string;
  phoneNumber?: string;
  isActive: boolean;
  joinedDate: string;
  gamesPlayed?: number;
  goalsScored?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlayerDto {
  name: string;
  email?: string;
  phoneNumber?: string;
  isActive: boolean;
  joinedDate: string;
}

export interface UpdatePlayerDto {
  name?: string;
  email?: string;
  phoneNumber?: string;
  isActive?: boolean;
  joinedDate?: string;
  gamesPlayed?: number;
  goalsScored?: number;
} 
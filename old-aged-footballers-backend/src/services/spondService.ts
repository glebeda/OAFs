import fetch from 'node-fetch';
import { PlayerService } from './playerService';

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

export interface SpondToken {
  token: string;
  expiration: string;
}

export interface SpondAuthResponse {
  accessToken: SpondToken;
  refreshToken: SpondToken;
  passwordToken: SpondToken;
}

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

export class SpondService {
  private baseURL = 'https://api.spond.com/core/v1';
  private authData: SpondAuthResponse | null = null;
  private requestCount = 0;
  private lastRequestTime = 0;
  private readonly MAX_REQUESTS_PER_HOUR = 15;
  private readonly HOUR_IN_MS = 60 * 60 * 1000;

  constructor(
    private email: string,
    private password: string,
    private groupId: string,
    private playerService?: PlayerService
  ) {}

  private checkRateLimit(): boolean {
    const now = Date.now();
    
    // Reset counter if an hour has passed
    if (now - this.lastRequestTime > this.HOUR_IN_MS) {
      this.requestCount = 0;
      this.lastRequestTime = now;
    }

    if (this.requestCount >= this.MAX_REQUESTS_PER_HOUR) {
      return false;
    }

    this.requestCount++;
    return true;
  }

  async authenticate(): Promise<boolean> {
    if (!this.checkRateLimit()) {
      throw new Error('Rate limit exceeded. Maximum 15 requests per hour.');
    }

    try {
      const response = await fetch(`${this.baseURL}/auth2/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        body: JSON.stringify({
          email: this.email,
          password: this.password
        })
      });

      if (!response.ok) {
        console.error('Spond authentication failed:', response.status, response.statusText);
        return false;
      }

      this.authData = await response.json();
      console.log('Spond authentication successful');
      return true;

    } catch (error) {
      console.error('Spond authentication error:', error);
      return false;
    }
  }

  private async ensureValidToken(): Promise<boolean> {
    if (!this.authData?.accessToken?.token) {
      return await this.authenticate();
    }

    // Check if token is expired
    const expirationDate = new Date(this.authData.accessToken.expiration);
    if (new Date() > expirationDate) {
      console.log('Spond token expired, re-authenticating...');
      return await this.authenticate();
    }

    return true;
  }

  async getUpcomingGames(): Promise<SpondGame[]> {
    if (!this.checkRateLimit()) {
      throw new Error('Rate limit exceeded. Maximum 15 requests per hour.');
    }

    const isAuthenticated = await this.ensureValidToken();
    if (!isAuthenticated || !this.authData?.accessToken?.token) {
      throw new Error('Failed to authenticate with Spond');
    }

    try {
      const url = `${this.baseURL}/sponds?includeComments=true&includeHidden=true&addProfileInfo=true&scheduled=true&order=asc&max=20&groupId=${this.groupId}&minEndTimestamp=${new Date().toISOString()}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.authData.accessToken.token}`,
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch games: ${response.status} ${response.statusText}`);
      }

      const gamesData = await response.json();
      return gamesData.map((game: any) => ({
        id: game.id,
        title: game.heading || game.title || 'Untitled Game',
        startTime: game.startTimestamp,
        endTime: game.endTimestamp,
        participants: game.participants || [],
        groupId: game.groupId,
        description: game.description,
        location: game.location
      }));

    } catch (error) {
      console.error('Error fetching Spond games:', error);
      throw error;
    }
  }

  async getGameParticipants(gameId: string): Promise<SpondParticipant[]> {
    if (!this.checkRateLimit()) {
      throw new Error('Rate limit exceeded. Maximum 15 requests per hour.');
    }

    const isAuthenticated = await this.ensureValidToken();
    if (!isAuthenticated || !this.authData?.accessToken?.token) {
      throw new Error('Failed to authenticate with Spond');
    }

    try {
      const url = `${this.baseURL}/sponds/${gameId}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.authData.accessToken.token}`,
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch game participants: ${response.status} ${response.statusText}`);
      }

      const gameData = await response.json();
      return gameData.participants || [];

    } catch (error) {
      console.error('Error fetching Spond game participants:', error);
      throw error;
    }
  }

  async getAcceptedParticipants(gameId: string): Promise<SpondParticipant[]> {
    const participants = await this.getGameParticipants(gameId);
    return participants.filter(p => p.status === 'accepted');
  }

  async getUpcomingGameParticipants(): Promise<SpondParticipant[]> {
    const games = await this.getUpcomingGames();
    if (games.length === 0) {
      return [];
    }

    // Get participants from the next upcoming game
    const nextGame = games[0];
    return await this.getAcceptedParticipants(nextGame.id);
  }

  async getPlayersForDate(gameDate: string): Promise<SpondPlayerMatch[]> {
    if (!this.checkRateLimit()) {
      throw new Error('Rate limit exceeded. Maximum 15 requests per hour.');
    }

    const isAuthenticated = await this.ensureValidToken();
    if (!isAuthenticated || !this.authData?.accessToken?.token) {
      throw new Error('Failed to authenticate with Spond');
    }

    try {
      const url = `${this.baseURL}/sponds?includeComments=true&includeHidden=true&addProfileInfo=true&scheduled=true&order=asc&max=20&groupId=${this.groupId}&minEndTimestamp=${new Date().toISOString()}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.authData.accessToken.token}`,
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch games: ${response.status} ${response.statusText}`);
      }

      const gamesData = await response.json();
      
      // Find game for the specific date
      const targetGame = gamesData.find((game: any) => {
        const gameDateStr = new Date(game.startTimestamp).toISOString().split('T')[0];
        return gameDateStr === gameDate;
      });

      if (!targetGame) {
        return [];
      }

      // Extract accepted players
      const acceptedIds = targetGame.responses?.acceptedIds || [];
      const members = targetGame.recipients?.group?.members || [];

      // Create a map of member ID to name
      const memberMap = new Map();
      members.forEach((member: any) => {
        const fullName = `${member.firstName || ''} ${member.lastName || ''}`.trim();
        memberMap.set(member.id, fullName);
      });

      // Return player matches (will be matched with OAF players later)
      return acceptedIds.map((id: string) => ({
        spondId: id,
        spondName: memberMap.get(id) || 'Unknown Player',
        matched: false
      }));

    } catch (error) {
      console.error('Error fetching Spond players for date:', error);
      throw error;
    }
  }

  async matchPlayersWithOAF(spondPlayers: SpondPlayerMatch[]): Promise<SpondImportResult> {
    if (!this.playerService) {
      throw new Error('PlayerService not initialized');
    }

    const allOAFPlayers = await this.playerService.getAllPlayers();
    const matchedPlayers: SpondPlayerMatch[] = [];
    const unmatchedPlayers: string[] = [];

    for (const spondPlayer of spondPlayers) {
      // Try to find exact match first
      let oafPlayer = allOAFPlayers.find(p => 
        p.name.toLowerCase() === spondPlayer.spondName.toLowerCase()
      );

      // If no exact match, try partial match
      if (!oafPlayer) {
        oafPlayer = allOAFPlayers.find(p => 
          p.name.toLowerCase().includes(spondPlayer.spondName.toLowerCase()) ||
          spondPlayer.spondName.toLowerCase().includes(p.name.toLowerCase())
        );
      }

      if (oafPlayer) {
        matchedPlayers.push({
          ...spondPlayer,
          oafPlayerId: oafPlayer.id,
          oafPlayerName: oafPlayer.name,
          matched: true
        });
      } else {
        unmatchedPlayers.push(spondPlayer.spondName);
      }
    }

    return {
      matchedPlayers,
      unmatchedPlayers,
      totalSpondPlayers: spondPlayers.length,
      totalMatched: matchedPlayers.length,
      totalUnmatched: unmatchedPlayers.length
    };
  }

  async importPlayersForDate(gameDate: string): Promise<SpondImportResult> {
    const spondPlayers = await this.getPlayersForDate(gameDate);
    return await this.matchPlayersWithOAF(spondPlayers);
  }

  getRateLimitInfo(): { used: number; remaining: number; resetTime: Date } {
    const now = Date.now();
    const resetTime = new Date(this.lastRequestTime + this.HOUR_IN_MS);
    
    return {
      used: this.requestCount,
      remaining: Math.max(0, this.MAX_REQUESTS_PER_HOUR - this.requestCount),
      resetTime
    };
  }
} 
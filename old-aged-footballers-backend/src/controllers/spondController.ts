import { Request, Response } from 'express';
import { SpondService } from '../services/spondService';
import { PlayerService } from '../services/playerService';

export class SpondController {
  private spondService: SpondService;
  private playerService: PlayerService;

  constructor() {
    // Initialize with environment variables
    const email = process.env.SPOND_EMAIL;
    const password = process.env.SPOND_PASSWORD;
    const groupId = process.env.SPOND_GROUP_ID;

    if (!email || !password || !groupId) {
      console.error('Missing Spond configuration. Please set SPOND_EMAIL, SPOND_PASSWORD, and SPOND_GROUP_ID environment variables.');
    }

    this.playerService = new PlayerService();
    this.spondService = new SpondService(email || '', password || '', groupId || '', this.playerService);
  }

  /**
   * Get upcoming games from Spond
   */
  async getUpcomingGames(req: Request, res: Response): Promise<void> {
    try {
      const games = await this.spondService.getUpcomingGames();
      res.json(games);
    } catch (error) {
      console.error('Error fetching upcoming games:', error);
      res.status(500).json({
        error: 'Failed to fetch upcoming games from Spond',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get participants for a specific game
   */
  async getGameParticipants(req: Request, res: Response): Promise<void> {
    try {
      const { gameId } = req.params;
      const participants = await this.spondService.getGameParticipants(gameId);
      res.json(participants);
    } catch (error) {
      console.error('Error fetching game participants:', error);
      res.status(500).json({
        error: 'Failed to fetch game participants from Spond',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get accepted participants for a specific game
   */
  async getAcceptedParticipants(req: Request, res: Response): Promise<void> {
    try {
      const { gameId } = req.params;
      const participants = await this.spondService.getAcceptedParticipants(gameId);
      res.json(participants);
    } catch (error) {
      console.error('Error fetching accepted participants:', error);
      res.status(500).json({
        error: 'Failed to fetch accepted participants from Spond',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get participants from the next upcoming game
   */
  async getUpcomingGameParticipants(req: Request, res: Response): Promise<void> {
    try {
      const participants = await this.spondService.getUpcomingGameParticipants();
      res.json(participants);
    } catch (error) {
      console.error('Error fetching upcoming game participants:', error);
      res.status(500).json({
        error: 'Failed to fetch upcoming game participants from Spond',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Import players from Spond for a specific date
   */
  async importPlayersForDate(req: Request, res: Response): Promise<void> {
    try {
      const { gameDate } = req.params;
      
      if (!gameDate) {
        res.status(400).json({
          error: 'Game date is required'
        });
        return;
      }

      const result = await this.spondService.importPlayersForDate(gameDate);
      res.json(result);
    } catch (error) {
      console.error('Error importing players for date:', error);
      res.status(500).json({
        error: 'Failed to import players from Spond',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get rate limit information
   */
  async getRateLimitInfo(req: Request, res: Response): Promise<void> {
    try {
      const rateLimitInfo = this.spondService.getRateLimitInfo();
      res.json(rateLimitInfo);
    } catch (error) {
      console.error('Error getting rate limit info:', error);
      res.status(500).json({
        error: 'Failed to get rate limit information',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Test Spond connection
   */
  async testConnection(req: Request, res: Response): Promise<void> {
    try {
      const isAuthenticated = await this.spondService.authenticate();
      if (isAuthenticated) {
        res.json({ 
          status: 'success', 
          message: 'Successfully connected to Spond API' 
        });
      } else {
        res.status(401).json({ 
          status: 'error', 
          message: 'Failed to authenticate with Spond' 
        });
      }
    } catch (error) {
      console.error('Error testing Spond connection:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to test Spond connection',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
} 
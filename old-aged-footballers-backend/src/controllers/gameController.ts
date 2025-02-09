import { Request, Response } from 'express';
import { GameService } from '../services/gameService';

const gameService = new GameService();

export class GameController {
  async createGame(req: Request, res: Response): Promise<void> {
    try {
      const game = await gameService.createGame(req.body);
      res.status(201).json(game);
    } catch (error) {
      console.error('Error creating game:', error);
      res.status(500).json({ message: 'Error creating game' });
    }
  }

  async getGame(req: Request, res: Response): Promise<void> {
    try {
      const game = await gameService.getGame(req.params.id);
      if (!game) {
        res.status(404).json({ message: 'Game not found' });
        return;
      }
      res.json(game);
    } catch (error) {
      console.error('Error getting game:', error);
      res.status(500).json({ message: 'Error getting game' });
    }
  }

  async updateGame(req: Request, res: Response): Promise<void> {
    try {
      const game = await gameService.updateGame(req.params.id, req.body);
      if (!game) {
        res.status(404).json({ message: 'Game not found' });
        return;
      }
      res.json(game);
    } catch (error) {
      console.error('Error updating game:', error);
      res.status(500).json({ message: 'Error updating game' });
    }
  }

  async listGames(req: Request, res: Response): Promise<void> {
    try {
      const games = await gameService.listGames();
      res.json(games);
    } catch (error) {
      console.error('Error listing games:', error);
      res.status(500).json({ message: 'Error listing games' });
    }
  }

  async getRecentGame(req: Request, res: Response): Promise<void> {
    try {
      const game = await gameService.getRecentGame();
      if (!game) {
        res.status(404).json({ message: 'No recent game found' });
        return;
      }
      res.json(game);
    } catch (error) {
      console.error('Error getting recent game:', error);
      res.status(500).json({ message: 'Error getting recent game' });
    }
  }

  async archiveGame(req: Request, res: Response): Promise<void> {
    try {
      const game = await gameService.archiveGame(req.params.id);
      if (!game) {
        res.status(404).json({ message: 'Game not found' });
        return;
      }
      res.json(game);
    } catch (error) {
      console.error('Error archiving game:', error);
      res.status(500).json({ message: 'Error archiving game' });
    }
  }
} 
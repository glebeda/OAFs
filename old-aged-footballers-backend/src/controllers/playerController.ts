import { Request, Response } from 'express';
import { PlayerService } from '../services/playerService';
import { CreatePlayerDto, UpdatePlayerDto } from '../types/player';

export class PlayerController {
  private playerService: PlayerService;

  constructor() {
    this.playerService = new PlayerService();
  }

  async createPlayer(req: Request, res: Response) {
    try {
      console.log('Creating player with data:', JSON.stringify(req.body, null, 2));
      const playerData: CreatePlayerDto = req.body;
      const player = await this.playerService.createPlayer(playerData);
      res.status(201).json(player);
    } catch (error) {
      console.error('Detailed error in createPlayer:', {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        body: req.body
      });
      
      if (error instanceof Error && error.message === 'Player with this name already exists') {
        res.status(409).json({ message: error.message });
      } else {
        res.status(500).json({ 
          message: 'Error creating player',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  async getPlayer(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const player = await this.playerService.getPlayerById(id);
      if (!player) {
        res.status(404).json({ message: 'Player not found' });
        return;
      }
      res.json(player);
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving player' });
    }
  }

  async getPlayerByName(req: Request, res: Response) {
    try {
      const { name } = req.params;
      const player = await this.playerService.getPlayerByName(name);
      if (!player) {
        res.status(404).json({ message: 'Player not found' });
        return;
      }
      res.json(player);
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving player' });
    }
  }

  async getAllPlayers(req: Request, res: Response) {
    try {
      const players = await this.playerService.getAllPlayers();
      res.json(players);
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving players' });
    }
  }

  async updatePlayer(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData: UpdatePlayerDto = req.body;
      const player = await this.playerService.updatePlayer(id, updateData);
      res.json(player);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Player not found') {
          res.status(404).json({ message: error.message });
        } else if (error.message === 'Player with this name already exists') {
          res.status(409).json({ message: error.message });
        } else {
          res.status(500).json({ message: 'Error updating player' });
        }
      } else {
        res.status(500).json({ message: 'Error updating player' });
      }
    }
  }

  async deletePlayer(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.playerService.deletePlayer(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Error deleting player' });
    }
  }
} 
import { Router } from 'express';
import { PlayerController } from '../controllers/playerController';

const router = Router();
const playerController = new PlayerController();

// Create a new player
router.post('/', (req, res) => playerController.createPlayer(req, res));

// Get all players
router.get('/', (req, res) => playerController.getAllPlayers(req, res));

// Get player by ID
router.get('/id/:id', (req, res) => playerController.getPlayer(req, res));

// Get player by name
router.get('/name/:name', (req, res) => playerController.getPlayerByName(req, res));

// Update player
router.put('/:id', (req, res) => playerController.updatePlayer(req, res));

// Delete player
router.delete('/:id', (req, res) => playerController.deletePlayer(req, res));

export default router; 
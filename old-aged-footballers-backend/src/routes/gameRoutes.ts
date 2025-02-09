import express, { RequestHandler } from 'express';
import { GameController } from '../controllers/gameController';

const router = express.Router();
const gameController = new GameController();

// Get the recent game (must be before /:id route)
const getRecentGame: RequestHandler = (req, res) => gameController.getRecentGame(req, res);
router.get('/recent', getRecentGame);

// Create a new game
const createGame: RequestHandler = (req, res) => gameController.createGame(req, res);
router.post('/', createGame);

// List all games
const listGames: RequestHandler = (req, res) => gameController.listGames(req, res);
router.get('/', listGames);

// Get a specific game
const getGame: RequestHandler = (req, res) => gameController.getGame(req, res);
router.get('/:id', getGame);

// Update a game
const updateGame: RequestHandler = (req, res) => gameController.updateGame(req, res);
router.put('/:id', updateGame);

// Archive a game
const archiveGame: RequestHandler = (req, res) => gameController.archiveGame(req, res);
router.put('/:id/archive', archiveGame);

export default router;

 
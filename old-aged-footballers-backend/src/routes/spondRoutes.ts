import { Router } from 'express';
import { SpondController } from '../controllers/spondController';

const router = Router();
let spondController: SpondController | null = null;

// Lazy initialization of SpondController after environment variables are loaded
const getSpondController = () => {
  if (!spondController) {
    spondController = new SpondController();
  }
  return spondController;
};

// Test Spond connection
router.get('/test', (req, res) => getSpondController().testConnection(req, res));

// Get rate limit information
router.get('/rate-limit', (req, res) => getSpondController().getRateLimitInfo(req, res));

// Get upcoming games from Spond
router.get('/games', (req, res) => getSpondController().getUpcomingGames(req, res));

// Get participants for a specific game
router.get('/games/:gameId/participants', (req, res) => getSpondController().getGameParticipants(req, res));

// Get accepted participants for a specific game
router.get('/games/:gameId/participants/accepted', (req, res) => getSpondController().getAcceptedParticipants(req, res));

// Get participants from the next upcoming game
router.get('/participants/upcoming', (req, res) => getSpondController().getUpcomingGameParticipants(req, res));

// Import players from Spond for a specific date
router.get('/import/:gameDate', (req, res) => getSpondController().importPlayersForDate(req, res));

export default router; 
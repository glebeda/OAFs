import { Router } from 'express';
import { TeamBalancingController } from '../controllers/teamBalancingController';

const router = Router();
const teamBalancingController = new TeamBalancingController();

// Get team suggestions based on available players
router.post('/suggestions', async (req, res) => {
  await teamBalancingController.getTeamSuggestions(req, res);
});

// Get player ratings and statistics
router.get('/ratings', async (req, res) => {
  await teamBalancingController.getPlayerRatings(req, res);
});

// Get team balancing statistics and insights
router.get('/stats', async (req, res) => {
  await teamBalancingController.getBalancingStats(req, res);
});

export default router; 
import { Request, Response } from 'express';
import { TeamBalancingService, TeamBalancingOptions } from '../services/teamBalancingService';
import { PlayerService } from '../services/playerService';
import { GameService } from '../services/gameService';

export class TeamBalancingController {
  private teamBalancingService: TeamBalancingService;
  private playerService: PlayerService;
  private gameService: GameService;

  constructor() {
    this.teamBalancingService = new TeamBalancingService();
    this.playerService = new PlayerService();
    this.gameService = new GameService();
  }

  /**
   * Get team suggestions based on available players
   */
  async getTeamSuggestions(req: Request, res: Response) {
    try {
      const { availablePlayers, options } = req.body;

      if (!availablePlayers || !Array.isArray(availablePlayers)) {
        return res.status(400).json({
          error: 'availablePlayers array is required'
        });
      }

      // Fetch all players and games
      const [players, games] = await Promise.all([
        this.playerService.getAllPlayers(),
        this.gameService.listGames()
      ]);

      // Calculate player ratings
      const playerRatings = this.teamBalancingService.calculatePlayerRatings(players, games);

      // Get recent games for rotation analysis
      const recentGames = games
        .filter(game => game.status === 'archived' || game.status === 'recent')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10); // Last 10 games

      // Generate team suggestions
      const suggestions = this.teamBalancingService.generateTeamSuggestions(
        availablePlayers,
        playerRatings,
        recentGames,
        options || {}
      );

      res.json({
        suggestions,
        playerRatings: playerRatings.filter(r => availablePlayers.includes(r.id)),
        totalPlayers: availablePlayers.length,
        recentGamesCount: recentGames.length
      });

    } catch (error) {
      console.error('Error generating team suggestions:', error);
      res.status(500).json({
        error: 'Failed to generate team suggestions',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get player ratings and statistics
   */
  async getPlayerRatings(req: Request, res: Response) {
    try {
      const [players, games] = await Promise.all([
        this.playerService.getAllPlayers(),
        this.gameService.listGames()
      ]);

      const playerRatings = this.teamBalancingService.calculatePlayerRatings(players, games);

      res.json({
        playerRatings,
        totalPlayers: players.length,
        totalGames: games.filter(g => g.status === 'archived' || g.status === 'recent').length
      });

    } catch (error) {
      console.error('Error getting player ratings:', error);
      res.status(500).json({
        error: 'Failed to get player ratings',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get team balancing statistics and insights
   */
  async getBalancingStats(req: Request, res: Response) {
    try {
      const [players, games] = await Promise.all([
        this.playerService.getAllPlayers(),
        this.gameService.listGames()
      ]);

      const validGames = games.filter(game => 
        game.status === 'archived' || game.status === 'recent'
      );

      const playerRatings = this.teamBalancingService.calculatePlayerRatings(players, games);

      // Calculate overall statistics
      const totalGoals = validGames.reduce((sum, game) => 
        sum + game.teamA.score + game.teamB.score, 0
      );

      const averageGoalsPerGame = validGames.length > 0 ? totalGoals / validGames.length : 0;

      const skillDistribution = {
        high: playerRatings.filter(p => p.skillRating >= 70).length,
        medium: playerRatings.filter(p => p.skillRating >= 40 && p.skillRating < 70).length,
        low: playerRatings.filter(p => p.skillRating < 40).length,
      };

      const mostActivePlayers = playerRatings
        .sort((a, b) => b.gamesPlayed - a.gamesPlayed)
        .slice(0, 5)
        .map(p => ({ id: p.id, name: p.name, gamesPlayed: p.gamesPlayed }));

      const topScorers = playerRatings
        .sort((a, b) => b.goalsPerGame - a.goalsPerGame)
        .slice(0, 5)
        .map(p => ({ id: p.id, name: p.name, goalsPerGame: p.goalsPerGame }));

      const bestWinRates = playerRatings
        .filter(p => p.gamesPlayed >= 3) // Only players with significant games
        .sort((a, b) => b.winRate - a.winRate)
        .slice(0, 5)
        .map(p => ({ id: p.id, name: p.name, winRate: p.winRate }));

      res.json({
        totalGames: validGames.length,
        totalPlayers: players.length,
        averageGoalsPerGame,
        skillDistribution,
        mostActivePlayers,
        topScorers,
        bestWinRates,
        recentGamesCount: validGames.filter(g => 
          new Date(g.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        ).length
      });

    } catch (error) {
      console.error('Error getting balancing stats:', error);
      res.status(500).json({
        error: 'Failed to get balancing statistics',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
} 
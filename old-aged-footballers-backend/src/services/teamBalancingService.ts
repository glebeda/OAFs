import { Player } from '../types/player';
import { Game } from '../types/game';

export interface PlayerRating {
  id: string;
  name: string;
  skillRating: number;
  goalsPerGame: number;
  winRate: number;
  gamesPlayed: number;
  recentForm: number; // Weighted average of recent performance
  teamChemistry: Record<string, number>; // Player ID to chemistry score
}

export interface TeamSuggestion {
  teamA: string[];
  teamB: string[];
  balanceScore: number;
  chemistryScore: number;
  rotationScore: number;
  totalScore: number;
  reasoning: string[];
}

export interface TeamBalancingOptions {
  maxTeamSize?: number;
  minTeamSize?: number;
  skillWeight?: number;
  chemistryWeight?: number;
  rotationWeight?: number;
  recentGamesWeight?: number;
  maxSuggestions?: number;
}

export class TeamBalancingService {
  private defaultOptions: Required<TeamBalancingOptions> = {
    maxTeamSize: 8,
    minTeamSize: 4,
    skillWeight: 0.4,
    chemistryWeight: 0.3,
    rotationWeight: 0.3,
    recentGamesWeight: 0.7,
    maxSuggestions: 5,
  };

  /**
   * Calculate player ratings based on historical performance
   */
  calculatePlayerRatings(players: Player[], games: Game[]): PlayerRating[] {
    const validGames = games.filter(game => 
      game.status === 'archived' || game.status === 'recent'
    );

    return players.map(player => {
      const playerGames = validGames.filter(game => 
        game.teamA.players.includes(player.id) || game.teamB.players.includes(player.id)
      );

      let totalGoals = 0;
      let wins = 0;
      let recentGoals = 0;
      let recentGames = 0;
      const chemistryScores: Record<string, number> = {};

      playerGames.forEach((game, index) => {
        const isTeamA = game.teamA.players.includes(player.id);
        const team = isTeamA ? game.teamA : game.teamB;
        const goals = team.playerGoals[player.id] || 0;
        
        totalGoals += goals;
        if ((isTeamA && game.teamA.score > game.teamB.score) || 
            (!isTeamA && game.teamB.score > game.teamA.score)) {
          wins++;
        }

        // Calculate recent form (last 5 games weighted more heavily)
        const isRecent = index < 5;
        if (isRecent) {
          recentGoals += goals;
          recentGames++;
        }

        // Calculate chemistry with teammates
        const teammates = isTeamA ? game.teamA.players : game.teamB.players;
        teammates.forEach(teammateId => {
          if (teammateId !== player.id) {
            const teamWon = (isTeamA && game.teamA.score > game.teamB.score) || 
                           (!isTeamA && game.teamB.score > game.teamA.score);
            chemistryScores[teammateId] = (chemistryScores[teammateId] || 0) + (teamWon ? 1 : -0.5);
          }
        });
      });

      const gamesPlayed = playerGames.length;
      const goalsPerGame = gamesPlayed > 0 ? totalGoals / gamesPlayed : 0;
      const winRate = gamesPlayed > 0 ? wins / gamesPlayed : 0;
      const recentForm = recentGames > 0 ? recentGoals / recentGames : goalsPerGame;

      // Calculate skill rating (0-100 scale)
      const skillRating = Math.min(100, Math.max(0, 
        (goalsPerGame * 15) + (winRate * 45) + (recentForm * 20)
      ));

      return {
        id: player.id,
        name: player.name,
        skillRating,
        goalsPerGame,
        winRate,
        gamesPlayed,
        recentForm,
        teamChemistry: chemistryScores,
      };
    });
  }

  /**
   * Generate balanced team suggestions
   */
  generateTeamSuggestions(
    availablePlayers: string[],
    playerRatings: PlayerRating[],
    recentGames: Game[],
    options: TeamBalancingOptions = {}
  ): TeamSuggestion[] {
    const opts = { ...this.defaultOptions, ...options };
    const ratings = playerRatings.filter(r => availablePlayers.includes(r.id));
    
    if (ratings.length < opts.minTeamSize * 2) {
      throw new Error(`Not enough players available. Need at least ${opts.minTeamSize * 2}, got ${ratings.length}`);
    }

    const suggestions: TeamSuggestion[] = [];
    const maxTeamSize = Math.min(opts.maxTeamSize, Math.floor(ratings.length / 2));

    // Generate multiple team combinations
    for (let teamSize = opts.minTeamSize; teamSize <= maxTeamSize; teamSize++) {
      const combinations = this.generateTeamCombinations(ratings, teamSize, opts.maxSuggestions);
      
      combinations.forEach(combination => {
        const suggestion = this.evaluateTeamCombination(
          combination.teamA,
          combination.teamB,
          ratings,
          recentGames,
          opts
        );
        suggestions.push(suggestion);
      });
    }

    // Sort by total score and return top suggestions
    return suggestions
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, opts.maxSuggestions);
  }

  /**
   * Generate different team combinations
   */
  private generateTeamCombinations(
    players: PlayerRating[],
    teamSize: number,
    maxCombinations: number
  ): Array<{ teamA: PlayerRating[], teamB: PlayerRating[] }> {
    const combinations: Array<{ teamA: PlayerRating[], teamB: PlayerRating[] }> = [];
    
    // Sort players by skill rating for better initial distribution
    const sortedPlayers = [...players].sort((a, b) => b.skillRating - a.skillRating);
    
    // Generate combinations using different strategies
    const strategies = [
      this.alternatingSelection,
      this.skillBasedSelection,
      this.randomizedSelection,
    ];

    strategies.forEach(strategy => {
      if (combinations.length < maxCombinations) {
        const combination = strategy(sortedPlayers, teamSize);
        if (combination && !this.isDuplicateCombination(combination, combinations)) {
          combinations.push(combination);
        }
      }
    });

    return combinations;
  }

  /**
   * Strategy 1: Alternating selection (snake draft)
   */
  private alternatingSelection(players: PlayerRating[], teamSize: number) {
    const teamA: PlayerRating[] = [];
    const teamB: PlayerRating[] = [];
    
    for (let i = 0; i < teamSize * 2 && i < players.length; i++) {
      if (i % 2 === 0) {
        teamA.push(players[i]);
      } else {
        teamB.push(players[i]);
      }
    }
    
    return { teamA, teamB };
  }

  /**
   * Strategy 2: Skill-based balanced selection
   */
  private skillBasedSelection(players: PlayerRating[], teamSize: number) {
    const teamA: PlayerRating[] = [];
    const teamB: PlayerRating[] = [];
    const remaining = [...players];
    
    // Alternate between highest and lowest rated players
    while (teamA.length < teamSize && remaining.length > 0) {
      if (remaining.length > 0) {
        teamA.push(remaining.shift()!); // Highest rated
      }
      if (remaining.length > 0) {
        teamB.push(remaining.pop()!); // Lowest rated
      }
      if (teamB.length < teamSize && remaining.length > 0) {
        teamB.push(remaining.shift()!); // Next highest
      }
      if (teamA.length < teamSize && remaining.length > 0) {
        teamA.push(remaining.pop()!); // Next lowest
      }
    }
    
    return { teamA, teamB };
  }

  /**
   * Strategy 3: Randomized selection
   */
  private randomizedSelection(players: PlayerRating[], teamSize: number) {
    const shuffled = [...players].sort(() => Math.random() - 0.5);
    const teamA = shuffled.slice(0, teamSize);
    const teamB = shuffled.slice(teamSize, teamSize * 2);
    
    return { teamA, teamB };
  }

  /**
   * Evaluate a team combination and calculate scores
   */
  private evaluateTeamCombination(
    teamAPlayers: PlayerRating[],
    teamBPlayers: PlayerRating[],
    allRatings: PlayerRating[],
    recentGames: Game[],
    options: Required<TeamBalancingOptions>
  ): TeamSuggestion {
    const teamAIds = teamAPlayers.map(p => p.id);
    const teamBIds = teamBPlayers.map(p => p.id);

    // Calculate skill balance score
    const teamASkill = teamAPlayers.reduce((sum, p) => sum + p.skillRating, 0) / teamAPlayers.length;
    const teamBSkill = teamBPlayers.reduce((sum, p) => sum + p.skillRating, 0) / teamBPlayers.length;
    const skillDifference = Math.abs(teamASkill - teamBSkill);
    const balanceScore = Math.max(0, 100 - skillDifference);

    // Calculate chemistry score
    const chemistryScore = this.calculateChemistryScore(teamAPlayers, teamBPlayers, allRatings);

    // Calculate rotation score (how different from recent teams)
    const rotationScore = this.calculateRotationScore(teamAIds, teamBIds, recentGames);

    // Calculate total score
    const totalScore = 
      (balanceScore * options.skillWeight) +
      (chemistryScore * options.chemistryWeight) +
      (rotationScore * options.rotationWeight);

    // Generate reasoning
    const reasoning = this.generateReasoning(
      teamAPlayers,
      teamBPlayers,
      balanceScore,
      chemistryScore,
      rotationScore
    );

    return {
      teamA: teamAIds,
      teamB: teamBIds,
      balanceScore,
      chemistryScore,
      rotationScore,
      totalScore,
      reasoning,
    };
  }

  /**
   * Calculate chemistry score based on historical team performance
   */
  private calculateChemistryScore(
    teamAPlayers: PlayerRating[],
    teamBPlayers: PlayerRating[],
    allRatings: PlayerRating[]
  ): number {
    const teamAChemistry = this.calculateTeamChemistry(teamAPlayers, allRatings);
    const teamBChemistry = this.calculateTeamChemistry(teamBPlayers, allRatings);
    
    return (teamAChemistry + teamBChemistry) / 2;
  }

  private calculateTeamChemistry(players: PlayerRating[], allRatings: PlayerRating[]): number {
    if (players.length < 2) return 50; // Neutral score for single players

    let totalChemistry = 0;
    let pairCount = 0;

    for (let i = 0; i < players.length; i++) {
      for (let j = i + 1; j < players.length; j++) {
        const player1 = players[i];
        const player2 = players[j];
        
        const chemistry1 = player1.teamChemistry[player2.id] || 0;
        const chemistry2 = player2.teamChemistry[player1.id] || 0;
        
        totalChemistry += (chemistry1 + chemistry2) / 2;
        pairCount++;
      }
    }

    // Convert to 0-100 scale
    return pairCount > 0 ? Math.max(0, Math.min(100, 50 + (totalChemistry / pairCount) * 10)) : 50;
  }

  /**
   * Calculate rotation score based on how different this team is from recent games
   */
  private calculateRotationScore(teamAIds: string[], teamBIds: string[], recentGames: Game[]): number {
    if (recentGames.length === 0) return 50; // Neutral score if no recent games

    const recentTeamCompositions = recentGames.slice(-3).map(game => ({
      teamA: game.teamA.players,
      teamB: game.teamB.players,
    }));

    let totalSimilarity = 0;
    let gameCount = 0;

    recentTeamCompositions.forEach(composition => {
      const teamASimilarity = this.calculateTeamSimilarity(teamAIds, composition.teamA);
      const teamBSimilarity = this.calculateTeamSimilarity(teamBIds, composition.teamB);
      const crossSimilarity1 = this.calculateTeamSimilarity(teamAIds, composition.teamB);
      const crossSimilarity2 = this.calculateTeamSimilarity(teamBIds, composition.teamA);
      
      const maxSimilarity = Math.max(teamASimilarity, teamBSimilarity, crossSimilarity1, crossSimilarity2);
      totalSimilarity += maxSimilarity;
      gameCount++;
    });

    const averageSimilarity = gameCount > 0 ? totalSimilarity / gameCount : 0;
    // Convert to rotation score (higher = more rotation)
    return Math.max(0, 100 - averageSimilarity);
  }

  private calculateTeamSimilarity(team1: string[], team2: string[]): number {
    if (team1.length === 0 || team2.length === 0) return 0;
    
    const commonPlayers = team1.filter(id => team2.includes(id)).length;
    const totalPlayers = Math.max(team1.length, team2.length);
    
    return (commonPlayers / totalPlayers) * 100;
  }

  /**
   * Generate reasoning for team suggestions
   */
  private generateReasoning(
    teamAPlayers: PlayerRating[],
    teamBPlayers: PlayerRating[],
    balanceScore: number,
    chemistryScore: number,
    rotationScore: number
  ): string[] {
    const reasoning: string[] = [];

    // Skill balance reasoning
    if (balanceScore >= 80) {
      reasoning.push("Excellent skill balance between teams");
    } else if (balanceScore >= 60) {
      reasoning.push("Good skill balance with minor differences");
    } else {
      reasoning.push("Teams may be slightly imbalanced - consider manual adjustment");
    }

    // Chemistry reasoning
    if (chemistryScore >= 70) {
      reasoning.push("Strong team chemistry based on historical performance");
    } else if (chemistryScore >= 50) {
      reasoning.push("Mixed team chemistry - some players work well together");
    } else {
      reasoning.push("Limited historical chemistry data - teams may need time to gel");
    }

    // Rotation reasoning
    if (rotationScore >= 70) {
      reasoning.push("Good player rotation - different combinations from recent games");
    } else if (rotationScore >= 50) {
      reasoning.push("Moderate player rotation");
    } else {
      reasoning.push("Similar to recent team compositions - consider more rotation");
    }

    return reasoning;
  }

  /**
   * Check if a combination is duplicate
   */
  private isDuplicateCombination(
    combination: { teamA: PlayerRating[], teamB: PlayerRating[] },
    existing: Array<{ teamA: PlayerRating[], teamB: PlayerRating[] }>
  ): boolean {
    return existing.some(existing => {
      const existingTeamA = existing.teamA.map(p => p.id).sort();
      const existingTeamB = existing.teamB.map(p => p.id).sort();
      const newTeamA = combination.teamA.map(p => p.id).sort();
      const newTeamB = combination.teamB.map(p => p.id).sort();

      return (
        (JSON.stringify(existingTeamA) === JSON.stringify(newTeamA) && 
         JSON.stringify(existingTeamB) === JSON.stringify(newTeamB)) ||
        (JSON.stringify(existingTeamA) === JSON.stringify(newTeamB) && 
         JSON.stringify(existingTeamB) === JSON.stringify(newTeamA))
      );
    });
  }
} 
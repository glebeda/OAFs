import { TeamBalancingService } from '../../services/teamBalancingService';
import { Player } from '../../types/player';
import { Game } from '../../types/game';

describe('TeamBalancingService', () => {
  let service: TeamBalancingService;
  let mockPlayers: Player[];
  let mockGames: Game[];

  beforeEach(() => {
    service = new TeamBalancingService();
    
    // Create mock players (need at least 8 for minimum team size of 4)
    mockPlayers = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        phoneNumber: '1234567890',
        isActive: true,
        joinedDate: '2024-01-01',
        gamesPlayed: 10,
        goalsScored: 15,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        phoneNumber: '0987654321',
        isActive: true,
        joinedDate: '2024-01-01',
        gamesPlayed: 8,
        goalsScored: 12,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: '3',
        name: 'Bob Johnson',
        email: 'bob@example.com',
        phoneNumber: '5555555555',
        isActive: true,
        joinedDate: '2024-01-01',
        gamesPlayed: 12,
        goalsScored: 8,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: '4',
        name: 'Alice Brown',
        email: 'alice@example.com',
        phoneNumber: '1111111111',
        isActive: true,
        joinedDate: '2024-01-01',
        gamesPlayed: 6,
        goalsScored: 5,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: '5',
        name: 'Charlie Wilson',
        email: 'charlie@example.com',
        phoneNumber: '2222222222',
        isActive: true,
        joinedDate: '2024-01-01',
        gamesPlayed: 9,
        goalsScored: 10,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: '6',
        name: 'Diana Davis',
        email: 'diana@example.com',
        phoneNumber: '3333333333',
        isActive: true,
        joinedDate: '2024-01-01',
        gamesPlayed: 7,
        goalsScored: 6,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: '7',
        name: 'Edward Miller',
        email: 'edward@example.com',
        phoneNumber: '4444444444',
        isActive: true,
        joinedDate: '2024-01-01',
        gamesPlayed: 5,
        goalsScored: 3,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: '8',
        name: 'Fiona Garcia',
        email: 'fiona@example.com',
        phoneNumber: '5555555555',
        isActive: true,
        joinedDate: '2024-01-01',
        gamesPlayed: 4,
        goalsScored: 2,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
    ];

    // Create mock games
    mockGames = [
      {
        id: '1',
        date: '2024-01-15',
        teamA: {
          players: ['1', '2', '3', '4'],
          playerGoals: { '1': 2, '2': 1, '3': 0, '4': 0 },
          score: 3,
        },
        teamB: {
          players: ['5', '6', '7', '8'],
          playerGoals: { '5': 1, '6': 0, '7': 0, '8': 0 },
          score: 1,
        },
        status: 'archived',
        createdAt: '2024-01-15T00:00:00Z',
        updatedAt: '2024-01-15T00:00:00Z',
      },
      {
        id: '2',
        date: '2024-01-22',
        teamA: {
          players: ['1', '3', '5', '7'],
          playerGoals: { '1': 1, '3': 2, '5': 0, '7': 0 },
          score: 3,
        },
        teamB: {
          players: ['2', '4', '6', '8'],
          playerGoals: { '2': 1, '4': 1, '6': 0, '8': 0 },
          score: 2,
        },
        status: 'archived',
        createdAt: '2024-01-22T00:00:00Z',
        updatedAt: '2024-01-22T00:00:00Z',
      },
    ];
  });

  describe('calculatePlayerRatings', () => {
    it('should calculate player ratings correctly', () => {
      const ratings = service.calculatePlayerRatings(mockPlayers, mockGames);

      expect(ratings).toHaveLength(8);
      
      // Check that all players have ratings
      ratings.forEach(rating => {
        expect(rating).toHaveProperty('id');
        expect(rating).toHaveProperty('name');
        expect(rating).toHaveProperty('skillRating');
        expect(rating).toHaveProperty('goalsPerGame');
        expect(rating).toHaveProperty('winRate');
        expect(rating).toHaveProperty('gamesPlayed');
        expect(rating).toHaveProperty('recentForm');
        expect(rating).toHaveProperty('teamChemistry');
        
        // Skill rating should be between 0 and 100
        expect(rating.skillRating).toBeGreaterThanOrEqual(0);
        expect(rating.skillRating).toBeLessThanOrEqual(100);
      });
    });

    it('should handle players with no games', () => {
      const newPlayer: Player = {
        id: '9',
        name: 'New Player',
        email: 'new@example.com',
        phoneNumber: '9999999999',
        isActive: true,
        joinedDate: '2024-01-01',
        gamesPlayed: 0,
        goalsScored: 0,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      const ratings = service.calculatePlayerRatings([...mockPlayers, newPlayer], mockGames);
      const newPlayerRating = ratings.find(r => r.id === '9');

      expect(newPlayerRating).toBeDefined();
      expect(newPlayerRating?.gamesPlayed).toBe(0);
      expect(newPlayerRating?.goalsPerGame).toBe(0);
      expect(newPlayerRating?.winRate).toBe(0);
    });
  });

  describe('generateTeamSuggestions', () => {
    it('should generate team suggestions for valid players', () => {
      const ratings = service.calculatePlayerRatings(mockPlayers, mockGames);
      const availablePlayers = mockPlayers.map(p => p.id);

      const suggestions = service.generateTeamSuggestions(availablePlayers, ratings, mockGames);

      expect(suggestions).toBeInstanceOf(Array);
      expect(suggestions.length).toBeGreaterThan(0);

      suggestions.forEach(suggestion => {
        expect(suggestion).toHaveProperty('teamA');
        expect(suggestion).toHaveProperty('teamB');
        expect(suggestion).toHaveProperty('balanceScore');
        expect(suggestion).toHaveProperty('chemistryScore');
        expect(suggestion).toHaveProperty('rotationScore');
        expect(suggestion).toHaveProperty('totalScore');
        expect(suggestion).toHaveProperty('reasoning');

        // Teams should not overlap
        const teamAPlayers = new Set(suggestion.teamA);
        const teamBPlayers = new Set(suggestion.teamB);
        const intersection = new Set([...teamAPlayers].filter(x => teamBPlayers.has(x)));
        expect(intersection.size).toBe(0);

        // All players should be from available players
        suggestion.teamA.forEach(playerId => {
          expect(availablePlayers).toContain(playerId);
        });
        suggestion.teamB.forEach(playerId => {
          expect(availablePlayers).toContain(playerId);
        });
      });
    });

    it('should throw error for insufficient players', () => {
      const ratings = service.calculatePlayerRatings(mockPlayers, mockGames);
      const availablePlayers = ['1', '2']; // Only 2 players

      expect(() => {
        service.generateTeamSuggestions(availablePlayers, ratings, mockGames);
      }).toThrow('Not enough players available');
    });
  });
}); 
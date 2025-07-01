import { GameService } from '../../services/gameService';
import { mockDynamoDb, mockPutCommandOutput, mockGetCommandOutput, mockScanCommandOutput } from '../mocks/dynamodb';
import { dynamoDb } from '../../config/dynamodb';
import { Game, CreateGameDto, UpdateGameDto } from '../../types/game';

let sendSpy: jest.Mock;
let gameService: GameService;

const mockGame: Game = {
  id: 'game-123',
  date: '2024-02-08',
  notes: 'Test game',
  teamA: {
    players: ['player-1', 'player-2'],
    playerGoals: { 'player-1': 2, 'player-2': 1 },
    score: 3,
  },
  teamB: {
    players: ['player-3', 'player-4'],
    playerGoals: { 'player-3': 1, 'player-4': -1 }, // -1 is own goal
    score: 2,
  },
  status: 'draft',
  createdAt: '2024-02-08T00:00:00.000Z',
  updatedAt: '2024-02-08T00:00:00.000Z',
};

const mockCreateGameData: CreateGameDto = {
  date: '2024-02-08',
  notes: 'New game',
  teamA: {
    players: ['player-1', 'player-2'],
  },
  teamB: {
    players: ['player-3', 'player-4'],
  },
};

beforeEach(() => {
  sendSpy = jest.spyOn(dynamoDb, 'send') as unknown as jest.Mock;
  sendSpy.mockClear();
  gameService = new GameService();
});

describe('GameService', () => {
  describe('createGame', () => {
    it('should create a new game successfully', async () => {
      sendSpy.mockResolvedValueOnce(mockPutCommandOutput);

      const result = await gameService.createGame(mockCreateGameData);

      expect(result).toMatchObject({
        ...mockCreateGameData,
        teamA: {
          players: mockCreateGameData.teamA.players,
          playerGoals: {},
          score: 0,
        },
        teamB: {
          players: mockCreateGameData.teamB.players,
          playerGoals: {},
          score: 0,
        },
        status: 'draft',
      });
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
      expect(sendSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          input: {
            TableName: expect.any(String),
            Item: expect.objectContaining({
              id: expect.any(String),
              date: mockCreateGameData.date,
              notes: mockCreateGameData.notes,
            }),
          },
        })
      );
    });

    it('should create a game without notes', async () => {
      const gameDataWithoutNotes = { ...mockCreateGameData };
      delete gameDataWithoutNotes.notes;
      
      sendSpy.mockResolvedValueOnce(mockPutCommandOutput);

      const result = await gameService.createGame(gameDataWithoutNotes);

      expect(result.notes).toBeUndefined();
      expect(result.teamA.score).toBe(0);
      expect(result.teamB.score).toBe(0);
    });
  });

  describe('getGame', () => {
    it('should return game when found', async () => {
      sendSpy.mockResolvedValueOnce({
        ...mockGetCommandOutput,
        Item: mockGame,
      });

      const result = await gameService.getGame('game-123');

      expect(result).toEqual(mockGame);
      expect(sendSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          input: {
            TableName: expect.any(String),
            Key: { id: 'game-123' },
          },
        })
      );
    });

    it('should return null when game not found', async () => {
      sendSpy.mockResolvedValueOnce({ Item: null });

      const result = await gameService.getGame('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('updateGame', () => {
    it('should update game successfully', async () => {
      const updateData: UpdateGameDto = {
        notes: 'Updated notes',
        status: 'recent',
      };

      // Mock getGame to return existing game
      sendSpy.mockResolvedValueOnce({
        ...mockGetCommandOutput,
        Item: mockGame,
      });
      // Mock PutCommand for update
      sendSpy.mockResolvedValueOnce(mockPutCommandOutput);

      const result = await gameService.updateGame('game-123', updateData);

      expect(result.notes).toBe('Updated notes');
      expect(result.status).toBe('recent');
      expect(result.updatedAt).toBeDefined();
      expect(result.updatedAt).not.toBe(mockGame.updatedAt);
    });

    it('should throw error if game not found', async () => {
      sendSpy.mockResolvedValueOnce({ Item: null });

      await expect(gameService.updateGame('non-existent', { notes: 'test' }))
        .rejects
        .toThrow('Game not found');
    });

    it('should update team players and clean up goals', async () => {
      const updateData: UpdateGameDto = {
        teamA: {
          players: ['player-1'], // Remove player-2
        },
      };

      // Mock getGame to return existing game
      sendSpy.mockResolvedValueOnce({
        ...mockGetCommandOutput,
        Item: mockGame,
      });
      // Mock PutCommand for update
      sendSpy.mockResolvedValueOnce(mockPutCommandOutput);

      const result = await gameService.updateGame('game-123', updateData);

      expect(result.teamA.players).toEqual(['player-1']);
      expect(result.teamA.playerGoals).toEqual({ 'player-1': 2 }); // player-2 goals removed
      expect(result.teamB.players).toEqual(mockGame.teamB.players); // unchanged
    });

    it('should recalculate scores when playerGoals are updated', async () => {
      const updateData: UpdateGameDto = {
        teamA: {
          playerGoals: { 'player-1': 3, 'player-2': 2 }, // Updated goals
        },
        teamB: {
          playerGoals: { 'player-3': 1, 'player-4': -2 }, // Own goal increased
        },
      };

      // Mock getGame to return existing game
      sendSpy.mockResolvedValueOnce({
        ...mockGetCommandOutput,
        Item: mockGame,
      });
      // Mock PutCommand for update
      sendSpy.mockResolvedValueOnce(mockPutCommandOutput);

      const result = await gameService.updateGame('game-123', updateData);

      // Team A: 3 + 2 = 5 goals + 2 (own goals from team B) = 7
      expect(result.teamA.score).toBe(7);
      // Team B: 1 (positive) + 0 (own goals from team A) = 1
      expect(result.teamB.score).toBe(1);
    });

    it('should handle negative goals (own goals) correctly', async () => {
      const updateData: UpdateGameDto = {
        teamA: {
          playerGoals: { 'player-1': -1 }, // Own goal
        },
        teamB: {
          playerGoals: { 'player-3': 2 },
        },
      };

      // Mock getGame to return existing game
      sendSpy.mockResolvedValueOnce({
        ...mockGetCommandOutput,
        Item: mockGame,
      });
      // Mock PutCommand for update
      sendSpy.mockResolvedValueOnce(mockPutCommandOutput);

      const result = await gameService.updateGame('game-123', updateData);

      // player-2's goal remains because players are not updated
      // Team A: 0 (no positive goals for player-1) + 1 (player-2's goal) + 0 (no own goals from team B) = 2
      expect(result.teamA.score).toBe(2);
      // Team B: 2 (positive) + 1 (own goal from team A) = 3
      expect(result.teamB.score).toBe(3);
    });
  });

  describe('listGames', () => {
    it('should return all games', async () => {
      sendSpy.mockResolvedValueOnce({
        ...mockScanCommandOutput,
        Items: [mockGame],
      });

      const result = await gameService.listGames();

      expect(result).toEqual([mockGame]);
      expect(sendSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          input: {
            TableName: expect.any(String),
          },
        })
      );
    });

    it('should return empty array when no games exist', async () => {
      sendSpy.mockResolvedValueOnce({ Items: [] });

      const result = await gameService.listGames();

      expect(result).toEqual([]);
    });
  });

  describe('getRecentGame', () => {
    it('should return recent game when found', async () => {
      const recentGame = { ...mockGame, status: 'recent' };
      sendSpy.mockResolvedValueOnce({
        Items: [recentGame],
      });

      const result = await gameService.getRecentGame();

      expect(result).toEqual(recentGame);
      expect(sendSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          input: {
            TableName: expect.any(String),
            FilterExpression: '#status = :status',
            ExpressionAttributeNames: {
              '#status': 'status',
            },
            ExpressionAttributeValues: {
              ':status': 'recent',
            },
          },
        })
      );
    });

    it('should return null when no recent game exists', async () => {
      sendSpy.mockResolvedValueOnce({ Items: [] });

      const result = await gameService.getRecentGame();

      expect(result).toBeNull();
    });
  });

  describe('archiveGame', () => {
    it('should archive game successfully', async () => {
      // Mock getGame to return existing game
      sendSpy.mockResolvedValueOnce({
        ...mockGetCommandOutput,
        Item: mockGame,
      });
      // Mock PutCommand for update
      sendSpy.mockResolvedValueOnce(mockPutCommandOutput);

      const result = await gameService.archiveGame('game-123');

      expect(result).not.toBeNull();
      if (result) {
        expect(result.status).toBe('archived');
        expect(result.updatedAt).toBeDefined();
        expect(result.updatedAt).not.toBe(mockGame.updatedAt);
      }
    });

    it('should return null when game not found', async () => {
      sendSpy.mockResolvedValueOnce({ Item: null });

      await expect(gameService.archiveGame('non-existent'))
        .rejects
        .toThrow('Game not found');
    });
  });

  describe('calculateTeamScore (private method)', () => {
    it('should calculate score correctly with positive goals only', () => {
      const playerGoals = { 'player-1': 2, 'player-2': 1 };
      const oppositeTeamGoals = { 'player-3': 1, 'player-4': 0 };

      // Access private method through the service instance
      const result = (gameService as any).calculateTeamScore(playerGoals, oppositeTeamGoals);

      // 2 + 1 = 3 goals
      expect(result).toBe(3);
    });

    it('should handle own goals (negative values) from opposite team', () => {
      const playerGoals = { 'player-1': 1, 'player-2': 0 };
      const oppositeTeamGoals = { 'player-3': -1, 'player-4': -2 }; // Own goals

      const result = (gameService as any).calculateTeamScore(playerGoals, oppositeTeamGoals);

      // 1 + 0 + 1 + 2 = 4 goals (own goals count for this team)
      expect(result).toBe(4);
    });

    it('should handle mixed positive and negative goals', () => {
      const playerGoals = { 'player-1': 2, 'player-2': -1 }; // Own goal from this team
      const oppositeTeamGoals = { 'player-3': 1, 'player-4': -1 }; // Own goal from opposite team

      const result = (gameService as any).calculateTeamScore(playerGoals, oppositeTeamGoals);

      // 2 + 0 (own goal doesn't count) + 1 (own goal from opposite team) = 3
      expect(result).toBe(3);
    });

    it('should return 0 for empty goals', () => {
      const playerGoals = {};
      const oppositeTeamGoals = {};

      const result = (gameService as any).calculateTeamScore(playerGoals, oppositeTeamGoals);

      expect(result).toBe(0);
    });
  });
}); 
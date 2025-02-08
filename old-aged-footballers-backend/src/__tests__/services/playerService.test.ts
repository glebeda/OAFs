import { PlayerService } from '../../services/playerService';
import { mockDynamoDb, mockPlayer, mockGetCommandOutput, mockPutCommandOutput, mockQueryCommandOutput, mockScanCommandOutput, mockUpdateCommandOutput, mockDeleteCommandOutput } from '../mocks/dynamodb';
import { docClient } from '../../config/dynamodb';

// Mock the DynamoDB client and TableNames
jest.mock('../../config/dynamodb', () => ({
  docClient: {
    send: jest.fn(),
  },
  TableNames: {
    PLAYERS: 'oaf_players',
    GAMES: 'oaf_games',
    SIGNUPS: 'oaf_signups'
  }
}));

describe('PlayerService', () => {
  let playerService: PlayerService;

  beforeEach(() => {
    playerService = new PlayerService();
    jest.clearAllMocks();
  });

  describe('createPlayer', () => {
    const createPlayerData = {
      name: 'John Doe',
      email: 'john@example.com',
      phoneNumber: '+1234567890',
      isActive: true,
      joinedDate: '2024-02-08',
    };

    it('should create a new player successfully', async () => {
      // Mock the getPlayerByName to return null (no existing player)
      (docClient.send as jest.Mock).mockResolvedValueOnce({ Items: [] });
      // Mock the PutCommand
      (docClient.send as jest.Mock).mockResolvedValueOnce(mockPutCommandOutput);

      const result = await playerService.createPlayer(createPlayerData);

      expect(result).toMatchObject({
        ...createPlayerData,
        gamesPlayed: 0,
        goalsScored: 0,
      });
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
    });

    it('should throw error if player with same name exists', async () => {
      // Mock the getPlayerByName to return an existing player
      (docClient.send as jest.Mock).mockResolvedValueOnce(mockQueryCommandOutput);

      await expect(playerService.createPlayer(createPlayerData))
        .rejects
        .toThrow('Player with this name already exists');
    });
  });

  describe('getPlayerById', () => {
    it('should return player when found', async () => {
      (docClient.send as jest.Mock).mockResolvedValueOnce(mockGetCommandOutput);

      const result = await playerService.getPlayerById('123');
      expect(result).toEqual(mockPlayer);
    });

    it('should return null when player not found', async () => {
      (docClient.send as jest.Mock).mockResolvedValueOnce({ Item: null });

      const result = await playerService.getPlayerById('123');
      expect(result).toBeNull();
    });
  });

  describe('getAllPlayers', () => {
    it('should return all players', async () => {
      (docClient.send as jest.Mock).mockResolvedValueOnce(mockScanCommandOutput);

      const result = await playerService.getAllPlayers();
      expect(result).toEqual([mockPlayer]);
    });

    it('should return empty array when no players exist', async () => {
      (docClient.send as jest.Mock).mockResolvedValueOnce({ Items: [] });

      const result = await playerService.getAllPlayers();
      expect(result).toEqual([]);
    });
  });

  describe('updatePlayer', () => {
    const updateData = {
      name: 'John Updated',
      isActive: false,
    };

    it('should update player successfully', async () => {
      // Mock getPlayerById
      (docClient.send as jest.Mock).mockResolvedValueOnce(mockGetCommandOutput);
      // Mock getPlayerByName (for name uniqueness check)
      (docClient.send as jest.Mock).mockResolvedValueOnce({ Items: [] });
      // Mock update command
      (docClient.send as jest.Mock).mockResolvedValueOnce(mockUpdateCommandOutput);

      const result = await playerService.updatePlayer('123', updateData);
      expect(result).toEqual(mockPlayer);
    });

    it('should throw error if player not found', async () => {
      (docClient.send as jest.Mock).mockResolvedValueOnce({ Item: null });

      await expect(playerService.updatePlayer('123', updateData))
        .rejects
        .toThrow('Player not found');
    });

    it('should throw error if new name already exists', async () => {
      // Mock getPlayerById
      (docClient.send as jest.Mock).mockResolvedValueOnce(mockGetCommandOutput);
      // Mock getPlayerByName to return a different player with the same name
      (docClient.send as jest.Mock).mockResolvedValueOnce({
        Items: [{ ...mockPlayer, id: '456' }],
      });

      await expect(playerService.updatePlayer('123', updateData))
        .rejects
        .toThrow('Player with this name already exists');
    });
  });

  describe('deletePlayer', () => {
    it('should delete player successfully', async () => {
      (docClient.send as jest.Mock).mockResolvedValueOnce(mockDeleteCommandOutput);

      await expect(playerService.deletePlayer('123')).resolves.not.toThrow();
    });
  });
}); 
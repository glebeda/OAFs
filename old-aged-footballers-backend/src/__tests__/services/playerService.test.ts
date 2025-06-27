import { PlayerService } from '../../services/playerService';
import { mockDynamoDb, mockPlayer, mockGetCommandOutput, mockPutCommandOutput, mockQueryCommandOutput, mockScanCommandOutput, mockUpdateCommandOutput, mockDeleteCommandOutput } from '../mocks/dynamodb';
import { dynamoDb } from '../../config/dynamodb';

let sendSpy: jest.Mock;
let playerService: PlayerService;

beforeEach(() => {
  sendSpy = jest.spyOn(dynamoDb, 'send') as unknown as jest.Mock;
  sendSpy.mockClear();
  playerService = new PlayerService();
});

describe('PlayerService', () => {
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
      sendSpy.mockResolvedValueOnce({ Items: [] });
      // Mock the PutCommand
      sendSpy.mockResolvedValueOnce(mockPutCommandOutput);

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
      sendSpy.mockResolvedValueOnce(mockQueryCommandOutput);

      await expect(playerService.createPlayer(createPlayerData))
        .rejects
        .toThrow('Player with this name already exists');
    });
  });

  describe('getPlayerById', () => {
    it('should return player when found', async () => {
      sendSpy.mockResolvedValueOnce(mockGetCommandOutput);

      const result = await playerService.getPlayerById('123');
      expect(result).toEqual(mockPlayer);
    });

    it('should return null when player not found', async () => {
      sendSpy.mockResolvedValueOnce({ Item: null });

      const result = await playerService.getPlayerById('123');
      expect(result).toBeNull();
    });
  });

  describe('getAllPlayers', () => {
    it('should return all players', async () => {
      sendSpy.mockResolvedValueOnce(mockScanCommandOutput);

      const result = await playerService.getAllPlayers();
      expect(result).toEqual([mockPlayer]);
    });

    it('should return empty array when no players exist', async () => {
      sendSpy.mockResolvedValueOnce({ Items: [] });

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
      sendSpy.mockResolvedValueOnce(mockGetCommandOutput);
      // Mock getPlayerByName (for name uniqueness check)
      sendSpy.mockResolvedValueOnce({ Items: [] });
      // Mock update command
      sendSpy.mockResolvedValueOnce(mockUpdateCommandOutput);

      const result = await playerService.updatePlayer('123', updateData);
      expect(result).toEqual(mockPlayer);
    });

    it('should throw error if player not found', async () => {
      sendSpy.mockResolvedValueOnce({ Item: null });

      await expect(playerService.updatePlayer('123', updateData))
        .rejects
        .toThrow('Player not found');
    });

    it('should throw error if new name already exists', async () => {
      // Mock getPlayerById
      sendSpy.mockResolvedValueOnce(mockGetCommandOutput);
      // Mock getPlayerByName to return a different player with the same name
      sendSpy.mockResolvedValueOnce({
        Items: [{ ...mockPlayer, id: '456' }],
      });

      await expect(playerService.updatePlayer('123', updateData))
        .rejects
        .toThrow('Player with this name already exists');
    });
  });

  describe('deletePlayer', () => {
    it('should delete player successfully', async () => {
      sendSpy.mockResolvedValueOnce(mockDeleteCommandOutput);

      await expect(playerService.deletePlayer('123')).resolves.not.toThrow();
    });
  });
}); 
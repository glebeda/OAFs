import { SpondService } from '../../services/spondService';
import { PlayerService } from '../../services/playerService';

jest.mock('node-fetch', () => jest.fn());
const fetch = require('node-fetch');

const mockPlayerService = {
  getAllPlayers: jest.fn(),
};

describe('SpondService', () => {
  const email = 'test@example.com';
  const password = 'password';
  const groupId = 'group123';
  let spondService: SpondService;

  beforeEach(() => {
    jest.clearAllMocks();
    spondService = new SpondService(email, password, groupId, mockPlayerService as unknown as PlayerService);
  });

  it('should fail authentication with bad credentials', async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 401, statusText: 'Unauthorized' });
    const result = await spondService.authenticate();
    expect(result).toBe(false);
  });

  it('should succeed authentication with good credentials', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        accessToken: { token: 'abc', expiration: new Date(Date.now() + 10000).toISOString() },
        refreshToken: {},
        passwordToken: {},
      }),
    });
    const result = await spondService.authenticate();
    expect(result).toBe(true);
  });

  it('should enforce rate limiting', async () => {
    fetch.mockResolvedValue({ ok: false, status: 401, statusText: 'Unauthorized' });
    // Call authenticate 15 times to hit the limit
    for (let i = 0; i < 15; i++) {
      await spondService.authenticate();
    }
    // The 16th call should throw
    await expect(spondService.authenticate()).rejects.toThrow('Rate limit exceeded');
  });

  it('should match players with OAF players', async () => {
    const spondPlayers = [
      { spondName: 'John Doe', spondId: '1', matched: false },
      { spondName: 'Jane Smith', spondId: '2', matched: false },
      { spondName: 'Unknown', spondId: '3', matched: false },
    ];
    mockPlayerService.getAllPlayers.mockResolvedValue([
      { id: 'a', name: 'John Doe' },
      { id: 'b', name: 'Jane Smith' },
    ]);
    const result = await spondService.matchPlayersWithOAF(spondPlayers);
    expect(result.matchedPlayers.length).toBe(2);
    expect(result.unmatchedPlayers).toContain('Unknown');
  });
}); 
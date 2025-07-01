import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SpondIntegration from '@/components/SpondIntegration';
import * as spondService from '@/services/spondService';
import toast from 'react-hot-toast';

jest.mock('@/services/spondService');
jest.mock('react-hot-toast');

const mockImportResult = {
  matchedPlayers: [],
  unmatchedPlayers: [],
  totalSpondPlayers: 10,
  totalMatched: 7,
  totalUnmatched: 3,
};

describe('SpondIntegration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (spondService.getSpondRateLimit as jest.Mock).mockResolvedValue({ used: 0, remaining: 15, resetTime: new Date().toISOString() });
    (spondService.importSpondPlayers as jest.Mock).mockResolvedValue(mockImportResult);
  });

  it('renders import button and summary after import', async () => {
    render(<SpondIntegration gameDate="2025-07-02" onPlayersImported={jest.fn()} />);
    const button = screen.getByRole('button', { name: /import players from spond/i });
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    await waitFor(() => {
      expect(screen.getByText('Import Results')).toBeInTheDocument();
      expect(screen.getByText('Matched')).toBeInTheDocument();
      expect(screen.getByText('Not Found')).toBeInTheDocument();
      expect(screen.getByText('Total')).toBeInTheDocument();
    });
  });

  it('disables button if rate limit is reached', async () => {
    (spondService.getSpondRateLimit as jest.Mock).mockResolvedValue({ used: 15, remaining: 0, resetTime: new Date().toISOString() });
    render(<SpondIntegration gameDate="2025-07-02" onPlayersImported={jest.fn()} />);
    const button = await screen.findByRole('button', { name: /import players from spond/i });
    fireEvent.click(button);
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(expect.stringMatching(/rate limit/i));
    });
  });

  it('shows toast on successful import', async () => {
    render(<SpondIntegration gameDate="2025-07-02" onPlayersImported={jest.fn()} />);
    const button = screen.getByRole('button', { name: /import players from spond/i });
    fireEvent.click(button);
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(expect.stringMatching(/imported/i));
    });
  });
}); 
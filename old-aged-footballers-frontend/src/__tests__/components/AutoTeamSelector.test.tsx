import React from 'react';
import { render, screen } from '@testing-library/react';
import AutoTeamSelector from '@/components/AutoTeamSelector';
import * as playerService from '@/services/playerService';
import * as teamBalancingService from '@/services/teamBalancingService';

const baseProps = {
  onTeamSelection: jest.fn(),
  initialTeamA: [],
  initialTeamB: [],
};

jest.mock('@/services/playerService');
jest.mock('@/services/teamBalancingService');

const mockPlayers = [
  { id: '1', name: 'Player 1' },
  { id: '2', name: 'Player 2' },
];

beforeEach(() => {
  (playerService.listPlayers as jest.Mock).mockResolvedValue(mockPlayers);
  (teamBalancingService.getPlayerRatings as jest.Mock).mockResolvedValue({ playerRatings: [] });
});

describe('AutoTeamSelector', () => {
  it('renders without crashing', async () => {
    render(<AutoTeamSelector {...baseProps} />);
    expect(screen.getByText('Loading team balancing data...')).toBeInTheDocument();
  });
}); 
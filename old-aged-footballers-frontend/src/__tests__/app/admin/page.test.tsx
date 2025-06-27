import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AdminPage from '@/app/admin/page';
import { playerApi } from '@/lib/api';

// Mock the API
jest.mock('@/lib/api', () => ({
  playerApi: {
    getAllPlayers: jest.fn(),
    createPlayer: jest.fn(),
    updatePlayer: jest.fn(),
    deletePlayer: jest.fn(),
  },
}));

const mockPlayers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phoneNumber: '1234567890',
    joinedDate: '2024-03-14',
    isActive: true,
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phoneNumber: '0987654321',
    joinedDate: '2024-03-13',
    isActive: false,
  },
];

const renderWithProvider = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
};

describe('AdminPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (playerApi.getAllPlayers as jest.Mock).mockResolvedValue(mockPlayers);
  });

  it('renders the page title and description', async () => {
    await act(async () => {
      renderWithProvider(<AdminPage />);
    });

    await waitFor(() => {
      expect(screen.getByText('Player Management')).toBeInTheDocument();
      expect(screen.getByText(/add, edit, or remove players/i)).toBeInTheDocument();
    });
  });

  it('shows loading state initially', async () => {
    await act(async () => {
      renderWithProvider(<AdminPage />);
    });
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });

  it('shows error state when API fails', async () => {
    (playerApi.getAllPlayers as jest.Mock).mockRejectedValue(new Error('API Error'));
    
    await act(async () => {
      renderWithProvider(<AdminPage />);
    });

    await waitFor(() => {
      expect(screen.getByText('Error loading players')).toBeInTheDocument();
    });
  });

  it('displays list of players', async () => {
    await act(async () => {
      renderWithProvider(<AdminPage />);
    });

    await waitFor(() => {
      expect(screen.getAllByText('John Doe')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Jane Smith')[0]).toBeInTheDocument();
    });
  });

  it('filters players based on search input', async () => {
    await act(async () => {
      renderWithProvider(<AdminPage />);
    });

    await waitFor(() => {
      expect(screen.getAllByText('John Doe')[0]).toBeInTheDocument();
    });

    await act(async () => {
      const searchInput = screen.getByPlaceholderText(/search players/i);
      fireEvent.change(searchInput, { target: { value: 'Jane' } });
    });

    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    expect(screen.getAllByText('Jane Smith')[0]).toBeInTheDocument();
  });

  it('opens add player modal when clicking add button', async () => {
    await act(async () => {
      renderWithProvider(<AdminPage />);
    });

    await waitFor(async () => {
      const addButton = screen.getByRole('button', { name: /add new player/i });
      await act(async () => {
        fireEvent.click(addButton);
      });
    });

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Add New Player' })).toBeInTheDocument();
    });
  });

  it('opens delete confirmation modal when clicking delete button', async () => {
    await act(async () => {
      renderWithProvider(<AdminPage />);
    });

    await waitFor(async () => {
      const deleteButton = screen.getAllByRole('button', { name: /delete/i })[0];
      await act(async () => {
        fireEvent.click(deleteButton);
      });
    });

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Delete Player' })).toBeInTheDocument();
      expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
      expect(screen.getAllByText('John Doe')[0]).toBeInTheDocument();
    });
  });
}); 
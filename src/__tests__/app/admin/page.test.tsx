import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AdminPage from '@/app/admin/page';
import * as playerApi from '@/api/player';

jest.mock('@/api/player');

const mockPlayers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '123-456-7890',
    status: 'active',
    joinedDate: '2024-01-01',
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
    renderWithProvider(<AdminPage />);

    await waitFor(() => {
      expect(screen.getByText('Player Management')).toBeInTheDocument();
      expect(screen.getByText(/add, edit, or remove players/i)).toBeInTheDocument();
    });
  });

  it('shows loading state initially', () => {
    renderWithProvider(<AdminPage />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows error state when API fails', async () => {
    (playerApi.getAllPlayers as jest.Mock).mockRejectedValue(new Error('API Error'));
    renderWithProvider(<AdminPage />);

    await waitFor(() => {
      expect(screen.getByText('Error loading players')).toBeInTheDocument();
    });
  });

  it('displays list of players', async () => {
    renderWithProvider(<AdminPage />);

    await waitFor(() => {
      expect(screen.getAllByText('John Doe')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Jane Smith')[0]).toBeInTheDocument();
    });
  });

  it('filters players based on search input', async () => {
    renderWithProvider(<AdminPage />);

    await waitFor(() => {
      expect(screen.getAllByText('John Doe')[0]).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search players/i);
    fireEvent.change(searchInput, { target: { value: 'Jane' } });

    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    expect(screen.getAllByText('Jane Smith')[0]).toBeInTheDocument();
  });

  it('opens add player modal when clicking add button', async () => {
    renderWithProvider(<AdminPage />);

    await waitFor(() => {
      const addButton = screen.getByRole('button', { name: /add new player/i });
      fireEvent.click(addButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Add New Player')).toBeInTheDocument();
    });
  });

  it('opens edit player modal when clicking edit button', async () => {
    renderWithProvider(<AdminPage />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const editButton = screen.getByRole('button', { name: /edit john doe/i });
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Edit Player' })).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: /name/i })).toHaveValue('John Doe');
    });
  });

  it('opens delete confirmation modal when clicking delete button', async () => {
    renderWithProvider(<AdminPage />);

    await waitFor(() => {
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      fireEvent.click(deleteButtons[0]);
    });

    await waitFor(() => {
      expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
      expect(screen.getByText(/john doe/i)).toBeInTheDocument();
    });
  });
}); 
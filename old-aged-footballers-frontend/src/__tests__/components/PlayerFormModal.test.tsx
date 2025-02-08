import { render, screen, fireEvent } from '@testing-library/react';
import { PlayerFormModal } from '@/components/PlayerFormModal';
import { Player } from '@/types';

describe('PlayerFormModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSubmit = jest.fn();
  const mockPlayer: Player = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phoneNumber: '1234567890',
    isActive: true,
    joinedDate: '2024-03-14',
    gamesPlayed: 0,
    goalsScored: 0,
    createdAt: '2024-03-14T00:00:00.000Z',
    updatedAt: '2024-03-14T00:00:00.000Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the modal with correct title for new player', () => {
    render(
      <PlayerFormModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByText('Add New Player')).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/joined date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
  });

  it('renders the modal with player data for editing', () => {
    render(
      <PlayerFormModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        player={mockPlayer}
      />
    );

    expect(screen.getByText('Edit Player')).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockPlayer.name)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockPlayer.email!)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockPlayer.phoneNumber!)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockPlayer.joinedDate)).toBeInTheDocument();
  });

  it('shows validation error when submitting without a name', () => {
    render(
      <PlayerFormModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    const submitButton = screen.getByText(/create/i);
    fireEvent.click(submitButton);

    expect(screen.getByText('Name is required')).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit with correct data when form is valid', () => {
    render(
      <PlayerFormModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: 'Jane Doe' },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'jane@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/phone number/i), {
      target: { value: '0987654321' },
    });
    fireEvent.change(screen.getByLabelText(/joined date/i), {
      target: { value: '2024-03-14' },
    });

    const submitButton = screen.getByText(/create/i);
    fireEvent.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledWith({
      name: 'Jane Doe',
      email: 'jane@example.com',
      phoneNumber: '0987654321',
      isActive: true,
      joinedDate: '2024-03-14',
    });
  });

  it('calls onClose when cancel button is clicked', () => {
    render(
      <PlayerFormModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    const cancelButton = screen.getByText(/cancel/i);
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });
}); 
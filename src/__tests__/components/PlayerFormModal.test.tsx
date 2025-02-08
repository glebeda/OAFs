import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { PlayerFormModal } from '@/components/PlayerFormModal';
import { Player } from '@/types/player';

describe('PlayerFormModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSubmit = jest.fn();
  const mockPlayer: Player = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phoneNumber: '1234567890',
    joinedDate: '2024-03-14',
    isActive: true,
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
    expect(screen.getByRole('combobox', { name: /status/i })).toBeInTheDocument();
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
    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1234567890')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2024-03-14')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toHaveValue('true');
  });

  it('shows validation error when submitting without a name', async () => {
    render(
      <PlayerFormModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    const submitButton = screen.getByRole('button', { name: /create/i });
    await fireEvent.click(submitButton);

    const errorMessage = screen.getByRole('alert');
    expect(errorMessage).toHaveTextContent('Name is required');
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit with form data when submitting valid form', async () => {
    render(
      <PlayerFormModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: 'John Doe' },
    });
    fireEvent.change(screen.getByLabelText(/joined date/i), {
      target: { value: '2024-03-14' },
    });

    const submitButton = screen.getByRole('button', { name: /create/i });
    await fireEvent.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledWith({
      name: 'John Doe',
      email: '',
      phoneNumber: '',
      joinedDate: '2024-03-14',
      isActive: true,
    });
  });

  it('calls onClose when clicking cancel button', () => {
    render(
      <PlayerFormModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });
}); 
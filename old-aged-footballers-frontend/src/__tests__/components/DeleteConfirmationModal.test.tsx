import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { DeleteConfirmationModal } from '@/components/DeleteConfirmationModal';

describe('DeleteConfirmationModal', () => {
  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();
  const playerName = 'John Doe';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the modal with player name', () => {
    render(
      <DeleteConfirmationModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        playerName={playerName}
      />
    );

    expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
    expect(screen.getByText(playerName)).toBeInTheDocument();
  });

  it('calls onConfirm when delete button is clicked', () => {
    render(
      <DeleteConfirmationModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        playerName={playerName}
      />
    );

    const deleteButton = screen.getByRole('button', { name: `Confirm delete ${playerName}` });
    fireEvent.click(deleteButton);

    expect(mockOnConfirm).toHaveBeenCalled();
  });

  it('calls onClose when cancel button is clicked', () => {
    render(
      <DeleteConfirmationModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        playerName={playerName}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('does not render when isOpen is false', () => {
    render(
      <DeleteConfirmationModal
        isOpen={false}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        playerName={playerName}
      />
    );

    expect(screen.queryByText(/are you sure/i)).not.toBeInTheDocument();
  });
}); 
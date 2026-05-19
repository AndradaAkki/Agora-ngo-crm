import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { useMutation } from '@apollo/client/react';
import AddFirm from '../AddFirm';

vi.mock('@apollo/client', () => ({ gql: vi.fn() }));
vi.mock('@apollo/client/react', () => ({ useMutation: vi.fn() }));

beforeEach(() => vi.clearAllMocks());
afterEach(() => cleanup());

describe('AddFirm', () => {
  test('fills all fields and calls onClose after successful submission', async () => {
    const mockAddFirm = vi.fn().mockResolvedValue({
      data: { addFirm: { id: '1', name: 'Test NGO' } },
    });
    useMutation.mockReturnValue([mockAddFirm, { loading: false, error: null }]);

    const mockOnClose = vi.fn();
    render(<AddFirm onClose={mockOnClose} />);

    const nameInputs = screen.getAllByLabelText('Name');
    fireEvent.change(nameInputs[0], { target: { value: 'Test NGO' } });
    fireEvent.change(nameInputs[1], { target: { value: 'Jane Doe' } });
    fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'Accepted' } });
    fireEvent.change(screen.getByLabelText('Position'), { target: { value: 'Manager' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'contact@testngo.com' } });
    fireEvent.change(screen.getByLabelText('Phone'), { target: { value: '555-0000' } });

    fireEvent.click(screen.getByText('Save Company'));

    await waitFor(() => {
      expect(mockAddFirm).toHaveBeenCalledWith({
        variables: { name: 'Test NGO', email: 'contact@testngo.com', status: 'Accepted' },
      });
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  test('Cancel button calls onClose without submitting', () => {
    useMutation.mockReturnValue([vi.fn(), { loading: false, error: null }]);
    const mockOnClose = vi.fn();
    render(<AddFirm onClose={mockOnClose} />);

    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('does not submit if required fields are empty', async () => {
    const mockAddFirm = vi.fn();
    useMutation.mockReturnValue([mockAddFirm, { loading: false, error: null }]);
    render(<AddFirm onClose={vi.fn()} />);

    fireEvent.click(screen.getByText('Save Company'));

    await new Promise(r => setTimeout(r, 50));
    expect(mockAddFirm).not.toHaveBeenCalled();
  });
});

import { render, screen, fireEvent } from '@testing-library/react';
import { test, expect, vi } from 'vitest';
import AddFirm from './AddFirm';

test('interacts with all fields and creates a firm', () => {
  const mockSetFirms = vi.fn();
  const mockOnClose = vi.fn();

  render(<AddFirm firms={[]} setFirms={mockSetFirms} onClose={mockOnClose} />);

  // Fill all fields
  const nameInputs = screen.getAllByLabelText('Name');
  fireEvent.change(nameInputs[0], { target: { value: 'Test NGO' } }); // Company Name
  fireEvent.change(nameInputs[1], { target: { value: 'Jane Doe' } }); // Contact Name

  fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'Accepted' } });
  fireEvent.change(screen.getByLabelText('Position'), { target: { value: 'Manager' } });
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'contact@testngo.com' } });
  fireEvent.change(screen.getByLabelText('Phone'), { target: { value: '555-0000' } });

  // Submit
  fireEvent.click(screen.getByText('Save Company'));
  expect(mockSetFirms).toHaveBeenCalledTimes(1);
  expect(mockOnClose).toHaveBeenCalledTimes(1);
});
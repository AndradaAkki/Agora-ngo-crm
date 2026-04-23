import { render, screen, fireEvent } from '@testing-library/react';
import { test, expect, vi } from 'vitest';
import EditFirm from './EditFirm';

test('interacts with all fields, CD member dropdown, and alert', () => {
  const mockOnSave = vi.fn();
  const mockFirm = { id: 1, name: 'Old Name', status: 'In Progress', assignedCD: 'nobody' };

  // Intercept the browser alert so it doesn't pause the test
  window.alert = vi.fn();

  render(<EditFirm firm={mockFirm} onSave={mockOnSave} onClose={vi.fn()} />);

  // Change regular fields
  fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'New Name' } });
  fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'Accepted' } });

  // Change CD Member dropdown
  fireEvent.change(screen.getByLabelText('Assign to CD Member'), { target: { value: 'Alex Thompson' } });

  // Click Edit Contacts (triggers alert)
  fireEvent.click(screen.getByText('Edit Contacts'));
  expect(window.alert).toHaveBeenCalledWith('Edit contacts UI will be connected here later.');

  // Save
  fireEvent.click(screen.getByText('Save Changes'));
  expect(mockOnSave).toHaveBeenCalled();
});
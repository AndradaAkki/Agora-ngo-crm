import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { useQuery, useMutation } from '@apollo/client/react';
import EditFirm from '../EditFirm';

vi.mock('@apollo/client', () => ({ gql: vi.fn() }));
vi.mock('@apollo/client/react', () => ({ useQuery: vi.fn(), useMutation: vi.fn() }));

const mockFirm = { id: '1', name: 'Old Name', status: 'In Progress', assignedCD: 'nobody' };

beforeEach(() => {
  vi.clearAllMocks();
  useQuery.mockReturnValue({ data: { getUsers: [] } });
  useMutation.mockReturnValue([vi.fn(), { loading: false, error: null }]);
});

afterEach(() => cleanup());

describe('EditFirm', () => {
  test('pre-fills form with existing firm data', () => {
    render(
      <EditFirm firm={mockFirm} onSave={vi.fn()} onClose={vi.fn()} onOpenContacts={vi.fn()} />
    );
    expect(screen.getByLabelText('Name').value).toBe('Old Name');
    expect(screen.getByLabelText('Status').value).toBe('In Progress');
  });

  test('submits mutation with updated values when Save Changes is clicked', () => {
    const mockUpdateFirm = vi.fn();
    useMutation.mockReturnValue([mockUpdateFirm, { loading: false }]);

    render(
      <EditFirm firm={mockFirm} onSave={vi.fn()} onClose={vi.fn()} onOpenContacts={vi.fn()} />
    );

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'New Name' } });
    fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'Accepted' } });
    fireEvent.click(screen.getByText('Save Changes'));

    expect(mockUpdateFirm).toHaveBeenCalledWith({
      variables: { id: '1', name: 'New Name', status: 'Accepted', assignedCD: 'nobody' },
    });
  });

  test('Edit Contacts button calls onOpenContacts', () => {
    const mockOnOpenContacts = vi.fn();
    render(
      <EditFirm firm={mockFirm} onSave={vi.fn()} onClose={vi.fn()} onOpenContacts={mockOnOpenContacts} />
    );
    fireEvent.click(screen.getByText('Edit Contacts'));
    expect(mockOnOpenContacts).toHaveBeenCalledTimes(1);
  });

  test('Cancel button calls onClose', () => {
    const mockOnClose = vi.fn();
    render(
      <EditFirm firm={mockFirm} onSave={vi.fn()} onClose={mockOnClose} onOpenContacts={vi.fn()} />
    );
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});

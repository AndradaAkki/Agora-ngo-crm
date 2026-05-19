import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { useQuery, useMutation } from '@apollo/client/react';
import Dashboard from '../Dashboard';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('@apollo/client', () => ({ gql: vi.fn() }));
vi.mock('@apollo/client/react', () => ({ useQuery: vi.fn(), useMutation: vi.fn() }));

const mockFirms = Array.from({ length: 11 }, (_, i) => ({
  id: String(i + 1),
  name: `Firm ${i + 1}`,
  email: `firm${i}@test.com`,
  contacts: [],
  firmEventStatuses: [],
  pausedUntil: null,
}));

beforeEach(() => {
  vi.clearAllMocks();
  useQuery.mockReturnValue({ data: { getEvents: [] } });
  useMutation.mockReturnValue([vi.fn(), {}]);
});

afterEach(() => cleanup());

describe('Dashboard', () => {
  test('renders firm list and total count', () => {
    render(
      <BrowserRouter>
        <Dashboard firms={mockFirms} onAddFirm={vi.fn()} />
      </BrowserRouter>
    );
    expect(screen.getByText('Total: 11 companies')).toBeTruthy();
    expect(screen.getByText('Firm 1')).toBeTruthy();
  });

  test('sidebar navigation links call navigate with correct routes', () => {
    render(
      <BrowserRouter>
        <Dashboard firms={mockFirms} onAddFirm={vi.fn()} />
      </BrowserRouter>
    );
    fireEvent.click(screen.getByTitle('Home'));
    expect(mockNavigate).toHaveBeenCalledWith('/');

    fireEvent.click(screen.getByTitle('Events & Stats'));
    expect(mockNavigate).toHaveBeenCalledWith('/stats');
  });

  test('pagination arrows and page numbers navigate between pages', () => {
    render(
      <BrowserRouter>
        <Dashboard firms={mockFirms} onAddFirm={vi.fn()} />
      </BrowserRouter>
    );
    fireEvent.click(screen.getByText('>'));
    fireEvent.click(screen.getByText('<'));
    fireEvent.click(screen.getByText('2'));
  });

  test('clicking Add New Company opens the add firm modal', () => {
    render(
      <BrowserRouter>
        <Dashboard firms={mockFirms} onAddFirm={vi.fn()} />
      </BrowserRouter>
    );
    fireEvent.click(screen.getByRole('button', { name: /add new company/i }));
    expect(screen.getByText('Save Company')).toBeTruthy();
  });

  test('closing the modal hides the form', () => {
    render(
      <BrowserRouter>
        <Dashboard firms={mockFirms} onAddFirm={vi.fn()} />
      </BrowserRouter>
    );
    fireEvent.click(screen.getByRole('button', { name: /add new company/i }));
    fireEvent.click(screen.getByText('✖'));
    expect(screen.queryByText('Save Company')).toBeNull();
  });
});

import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { test, expect, vi } from 'vitest';
import Dashboard from './Dashboard';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

test('dashboard coverage: sidebar, pagination, and modal', () => {
  // Pass 7 firms so pagination creates exactly 2 pages
  const mockFirms = Array.from({ length: 7 }, (_, i) => ({
    id: i + 1, name: `Firm ${i + 1}`, status: 'Accepted', email: `test${i}@test.com`
  }));

  render(
    <BrowserRouter>
      <Dashboard firms={mockFirms} setFirms={vi.fn()} />
    </BrowserRouter>
  );

  // 1. Sidebar Links Coverage
  fireEvent.click(screen.getByTitle('Home'));
  expect(mockNavigate).toHaveBeenCalledWith('/');

  fireEvent.click(screen.getByTitle('Events & Stats'));
  expect(mockNavigate).toHaveBeenCalledWith('/stats');

  // 2. Pagination Coverage (Clicking arrows AND numbers)
  fireEvent.click(screen.getByText('>')); // Go to page 2
  fireEvent.click(screen.getByText('<')); // Go back to page 1
  fireEvent.click(screen.getByText('2')); // Click number 2 directly

  // 3. Add Modal Coverage (Open and Close it)
  fireEvent.click(screen.getByText('Add New Company +'));
  fireEvent.click(screen.getByText('✖'));
});
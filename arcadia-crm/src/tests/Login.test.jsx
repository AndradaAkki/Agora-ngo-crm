import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { useMutation } from '@apollo/client/react';
import Login from '../Login';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

// gql is called at module load time — mock it to avoid Apollo setup overhead
vi.mock('@apollo/client', () => ({ gql: vi.fn() }));

vi.mock('@apollo/client/react', () => ({ useMutation: vi.fn() }));

function renderLogin(onLogin = vi.fn()) {
  return render(
    <BrowserRouter>
      <Login onLogin={onLogin} />
    </BrowserRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

afterEach(() => {
  cleanup();
});

describe('Login', () => {
  test('renders email field, password field, and sign-in button', () => {
    useMutation.mockReturnValue([vi.fn(), { loading: false }]);
    renderLogin();

    expect(screen.getByLabelText(/email/i)).toBeTruthy();
    expect(screen.getByLabelText(/password/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeTruthy();
  });

  test('button is disabled and shows "Signing in…" while mutation is loading', () => {
    useMutation.mockReturnValue([vi.fn(), { loading: true }]);
    renderLogin();

    const btn = screen.getByRole('button', { name: /signing in/i });
    expect(btn.disabled).toBe(true);
  });

  test('successful ADMIN login → stores token + user, calls onLogin, navigates to /dashboard', async () => {
    const adminUser = {
      id: '1', username: 'alice', email: 'alice@ngo.org',
      displayName: 'Alice', avatarUrl: null, role: 'ADMIN', isAdmin: true,
    };
    const mockMutate = vi.fn().mockResolvedValue({ data: { login: { token: 'tok-admin', user: adminUser } } });
    useMutation.mockReturnValue([mockMutate, { loading: false }]);
    const onLogin = vi.fn();
    renderLogin(onLogin);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'alice@ngo.org' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'secret' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({ variables: { email: 'alice@ngo.org', password: 'secret' } });
      expect(localStorage.getItem('arcadia_token')).toBe('tok-admin');
      expect(JSON.parse(localStorage.getItem('arcadia_user')).role).toBe('ADMIN');
      expect(onLogin).toHaveBeenCalledWith(adminUser);
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  test('successful General CD login → navigates to /dashboard', async () => {
    const generalUser = {
      id: '2', username: 'carol', email: 'carol@ngo.org',
      displayName: 'Carol', avatarUrl: null, role: 'General CD', isAdmin: false,
    };
    const mockMutate = vi.fn().mockResolvedValue({ data: { login: { token: 'tok-gcd', user: generalUser } } });
    useMutation.mockReturnValue([mockMutate, { loading: false }]);
    renderLogin();

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'carol@ngo.org' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'pass' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/dashboard'));
  });

  test('successful Externe CD login → navigates to /firms', async () => {
    const externeUser = {
      id: '3', username: 'bob', email: 'bob@ngo.org',
      displayName: 'Bob', avatarUrl: null, role: 'Externe CD', isAdmin: false,
    };
    const mockMutate = vi.fn().mockResolvedValue({ data: { login: { token: 'tok-ext', user: externeUser } } });
    useMutation.mockReturnValue([mockMutate, { loading: false }]);
    renderLogin();

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'bob@ngo.org' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'pass' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/firms'));
  });

  test('server returns null → shows "Invalid email or password." error', async () => {
    const mockMutate = vi.fn().mockResolvedValue({ data: { login: null } });
    useMutation.mockReturnValue([mockMutate, { loading: false }]);
    renderLogin();

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'wrong@ngo.org' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'bad' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid email or password.')).toBeTruthy();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  test('network error → shows "Login failed. Please try again." error', async () => {
    const mockMutate = vi.fn().mockRejectedValue(new Error('Network error'));
    useMutation.mockReturnValue([mockMutate, { loading: false }]);
    renderLogin();

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'user@ngo.org' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'pass' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText('Login failed. Please try again.')).toBeTruthy();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  test('Google OAuth link points to /auth/google', () => {
    useMutation.mockReturnValue([vi.fn(), { loading: false }]);
    renderLogin();
    const link = screen.getByRole('link', { name: /sign in with google/i });
    expect(link.getAttribute('href')).toBe('/auth/google');
  });

  test('GitHub OAuth link points to /auth/github', () => {
    useMutation.mockReturnValue([vi.fn(), { loading: false }]);
    renderLogin();
    const link = screen.getByRole('link', { name: /sign in with github/i });
    expect(link.getAttribute('href')).toBe('/auth/github');
  });

  test('forgot password link points to /forgot-password', () => {
    useMutation.mockReturnValue([vi.fn(), { loading: false }]);
    renderLogin();
    const link = screen.getByRole('link', { name: /forgot your password/i });
    expect(link.getAttribute('href')).toBe('/forgot-password');
  });
});

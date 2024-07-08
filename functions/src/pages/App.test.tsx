import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import App from './_app';
import LoginPage from './login';
import { useAuth } from '../hooks/useAuth';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import HomeGuard from '../components/Homeguard';
import { Box, CircularProgress } from '@mui/material';

// Mock dependencies
jest.mock('../hooks/useAuth');
jest.mock('../components/Homeguard');
jest.mock('./login');
jest.mock('react-query');
jest.mock('@mui/material/styles', () => ({
  ...jest.requireActual('@mui/material/styles'),
  createTheme: jest.fn(),
}));

describe('App Component', () => {
  const mockUser = { uid: '123', displayName: 'Test User' };
  const queryClient = new QueryClient();
  const theme = createTheme();

  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser, loading: false });
    localStorage.clear();
  });

  test('renders loading state', () => {
    (useAuth as jest.Mock).mockReturnValueOnce({ user: null, loading: true });
    render(<App />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('renders login page when user is not authenticated', () => {
    (useAuth as jest.Mock).mockReturnValueOnce({ user: null, loading: false });
    render(<App />);
    expect(screen.getByText(/Login/i)).toBeInTheDocument();
  });

  test('renders login page when token is not present', () => {
    render(<App />);
    expect(screen.getByText(/Login/i)).toBeInTheDocument();
  });

  test('renders HomeGuard when user is authenticated and token is present', () => {
    localStorage.setItem('token', 'mockToken');
    render(<App />);
    expect(screen.getByText(/HomeGuard/i)).toBeInTheDocument();
  });

  test('handles logout correctly', async () => {
    localStorage.setItem('token', 'mockToken');
    render(<App />);
    const homeGuardProps = (HomeGuard as jest.Mock).mock.calls[0][0];
    homeGuardProps.onLogout();
    await waitFor(() => expect(localStorage.getItem('token')).toBeNull());
    expect(screen.getByText(/Login/i)).toBeInTheDocument();
  });
});
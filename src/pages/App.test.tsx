import React from 'react';
import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import '@testing-library/jest-dom/extend-expect';
import App from './_app';
import { useAuth } from '../hooks/useAuth';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';

jest.mock('../hooks/useAuth');
jest.mock('../pages/auth/login', () => () => <div>LoginPage</div>);
jest.mock('../components/Homeguard', () => () => <div>HomeGuard</div>);

describe('App Component', () => {
  const mockUseAuth = useAuth as jest.Mock;
  const queryClient = new QueryClient();
  const theme = createTheme();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('displays loading spinner when loading is true', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: true });
    render(
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <App />
        </ThemeProvider>
      </QueryClientProvider>
    );
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('renders LoginPage when user is null', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false });
    render(
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <App />
        </ThemeProvider>
      </QueryClientProvider>
    );
    expect(screen.getByText('LoginPage')).toBeInTheDocument();
  });

  test('renders LoginPage when token is null', () => {
    mockUseAuth.mockReturnValue({ user: { id: '123' }, loading: false });
    jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
    render(
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <App />
        </ThemeProvider>
      </QueryClientProvider>
    );
    expect(screen.getByText('LoginPage')).toBeInTheDocument();
  });

  test('renders HomeGuard when user and token are present', () => {
    mockUseAuth.mockReturnValue({ user: { id: '123' }, loading: false });
    jest.spyOn(Storage.prototype, 'getItem').mockReturnValue('token');
    render(
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <App />
        </ThemeProvider>
      </QueryClientProvider>
    );
    expect(screen.getByText('HomeGuard')).toBeInTheDocument();
  });

  test('handleLogout removes token and sets token to null', () => {
    mockUseAuth.mockReturnValue({ user: { id: '123' }, loading: false });
    jest.spyOn(Storage.prototype, 'getItem').mockReturnValue('token');
    const { getByText } = render(
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <App />
        </ThemeProvider>
      </QueryClientProvider>
    );

    const logoutButton = getByText('Logout');
    logoutButton.click();

    expect(localStorage.removeItem).toHaveBeenCalledWith('token');
    expect(screen.getByText('LoginPage')).toBeInTheDocument();
  });
});
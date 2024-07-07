import LoginPage from './login';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useEffect, useState } from 'react';
import ThemeProvider from '@mui/material/styles/ThemeProvider';
import CssBaseline from '@mui/material/CssBaseline';
import HomeGuard from '../components/Homeguard';
import React from 'react';
import { createTheme } from '@mui/material/styles';
import { useAuth } from '../hooks/useAuth';
import { Box, CircularProgress } from '@mui/material';

const queryClient = new QueryClient();
const theme = createTheme();

function App() {
  const { user, loading } = useAuth();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  if (loading) {
    return (
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
            <CircularProgress />
        </Box>
    );
}

if (!user) {
    return <LoginPage />;
}

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  if (!token) {
    return <LoginPage />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <HomeGuard onLogout={handleLogout} />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
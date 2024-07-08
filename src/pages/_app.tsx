import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import ThemeProvider from '@mui/material/styles/ThemeProvider';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme } from '@mui/material/styles';
import { Box, CircularProgress } from '@mui/material';
import LoginPage from './auth/login';
import HomeGuard from '../components/Homeguard';
import { useAuth } from '../hooks/useAuth';
import ReCAPTCHA from 'react-google-recaptcha';

const queryClient = new QueryClient();
const theme = createTheme();

function App() {
  const { user, loading } = useAuth();
  const [, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const handleRecaptchaChange = (value: string | null) => {
    console.log('Captcha value:', value);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return (
      <div>
        <LoginPage />
        <ReCAPTCHA
          sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
          onChange={handleRecaptchaChange}
        />
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <HomeGuard
          isAuthenticated={!!user}
          user={user}
          onLogout={handleLogout}
        />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
import { CssBaseline, ThemeProvider } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { loginUser, logoutUser } from '@/types/features/authentification/authSlice';
import HomeGuard from '@/components/Homeguard';
import LoginPage from './pages/LoginPage';
import { getProfile } from './features/profileSlice';
import { fetchEnrollments } from './features/enrollmentSlice';
import type { RootState } from './app/store';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    error: {
      main: '#f44336',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    h4: {
      fontWeight: 'bold',
    },
    body2: {
      fontSize: '1rem',
    },
    caption: {
      fontSize: '0.875rem',
      color: '#757575',
    },
  },
});

function App() {
  const [token, setToken] = useState<string | null>(null);
  const dispatch = useDispatch();
  const authState = useSelector((state: RootState) => state.auth);
  const userProfile = useSelector((state: RootState) => state.profile.profile);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      dispatch(loginUser({ access: storedToken }));
      dispatch(getProfile());
      dispatch(fetchEnrollments());
    }
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logoutUser());
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    // Redirect to login page or any other desired location
  };

  if (!authState.isAuthenticated && !token) {
    return <LoginPage />;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <HomeGuard onLogout={handleLogout} />
    </ThemeProvider>
  );
}

export default App;

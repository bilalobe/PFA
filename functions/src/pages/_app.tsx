import { loginUser } from '@/types/features/authentication/authSlice'; // Corrected path if necessary
import LoginPage from '@/pages/LoginPage'; // Corrected path
import { getProfile } from '@/features/profileSlice'; // Corrected path
import { fetchEnrollments } from '@/features/enrollmentSlice'; // Corrected path
import type { RootState } from '@/app/store'; // Corrected path

// Added React Query setup
import { QueryClient, QueryClientProvider } from 'react-query';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ThemeProvider from '@mui/material/styles/ThemeProvider';
import CssBaseline from '@mui/material/CssBaseline';
import HomeGuard from '@/components/Homeguard';
import React from 'react';

const queryClient = new QueryClient();

function App() {
  const [token, setToken] = useState<string | null>(null);
  const dispatch = useDispatch();
  const authState = useSelector((state: RootState) => state.auth);

  // Corrected dispatch call to match expected parameters of loginUser
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      // Assuming loginUser expects a token directly or adjust accordingly
      dispatch(loginUser(storedToken));
      dispatch(getProfile());
      dispatch(fetchEnrollments());
    }
  }, [dispatch]);

  // Assuming HomeGuard component is updated to accept onLogout prop
  // or create a wrapper component that handles logout functionality

  // Use userProfile or remove if unnecessary
  // const userProfile = useSelector((state: RootState) => state.profile.profile);

  if (!authState.isAuthenticated && !token) {
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
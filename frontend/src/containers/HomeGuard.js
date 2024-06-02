import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../hooks/useAuth'; // Ensure you have this hook implemented
import { fetchUserProfile } from '../actions/userActions'; // Ensure you have this action implemented
import { Navigate, Outlet } from 'react-router-dom';
import { Box, Container, CircularProgress, Typography, Button } from '@mui/material';
import Navbar from '../components/Common/Navbar'; // Ensure the path is correct
import Footer from '../components/Common/Footer'; // Ensure the path is correct

function HomeGuard() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const dispatch = useDispatch();
  const userProfile = useSelector((state) => state.user.profile);
  const userLoading = useSelector((state) => state.user.loading);
  const error = useSelector((state) => state.user.error);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchUserProfile());
    }
  }, [isAuthenticated, dispatch]);

  const retryFetchProfile = () => {
    dispatch(fetchUserProfile());
  };

  if (authLoading || userLoading) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
        <Typography variant="body1" mt={2}>
          Loading authentication status...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#f0f0f0">
        <Typography variant="h6" color="error" mt={2}>
          An error occurred: {error}
        </Typography>
        <Button variant="contained" color="primary" onClick={retryFetchProfile} sx={{ mt: 2 }}>
          Retry
        </Button>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (userProfile) {
    if (userProfile.role === 'teacher') {
      return <Navigate to="/teacher/dashboard" />;
    } else if (userProfile.role === 'student') {
      return <Navigate to="/student/dashboard" />;
    } else if (userProfile.role !== 'admin') {
      return (
        <Container>
          <Navbar />
          <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="50vh">
            <Typography variant="h6" color="error" align="center" mt={5}>
              You do not have the necessary permissions to view this content.
            </Typography>
          </Box>
          <Footer />
        </Container>
      );
    }
  }

  return (
    <Container>
      <Navbar />
      <Outlet />
      <Footer />
    </Container>
  );
}

export default HomeGuard;

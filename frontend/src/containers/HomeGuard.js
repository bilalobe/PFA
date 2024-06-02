
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../hooks/useAuth';
import { fetchUserProfile } from '../actions/userActions';
import { Navigate, Outlet } from 'react-router-dom';
import { Box, Container, CircularProgress, Typography } from '@mui/material';
import Navbar from '../components/Common/Navbar'; // Ensure this path is correct

function HomeGuard() {
  const { isAuthenticated, loading } = useAuth();
  const dispatch = useDispatch();
  const userProfile = useSelector((state) => state.user.profile);
  const userLoading = useSelector((state) => state.user.loading);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchUserProfile());
    }
  }, [isAuthenticated, dispatch]);

  if (loading || userLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (userProfile && userProfile.role !== 'admin') {
    return (
      <Container>
        <Navbar />
        <Typography variant="h6" color="error" align="center" mt={5}>
          You do not have the necessary permissions to view this content.
        </Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Navbar />
      <Outlet />
    </Container>
  );
}

export default HomeGuard;

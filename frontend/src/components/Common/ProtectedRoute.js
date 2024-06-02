import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { CircularProgress, Box, Typography, Button } from '@mui/material';

const ProtectedRoute = ({ component: Component, redirectMessage = "You need to be logged in to access this page.", retryAction }) => {
  const { isAuthenticated, loading, error } = useAuth();

  const handleRetry = () => {
    if (retryAction) {
      retryAction();
    }
  };

  if (loading) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" height="50vh" bgcolor="#f0f0f0">
        <CircularProgress />
        <Typography variant="body1" mt={2}>
          Loading authentication status...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" height="50vh" bgcolor="#f0f0f0">
        <Typography variant="body1" color="error" mt={2}>
          An error occurred: {error}
        </Typography>
        <Button variant="contained" color="primary" onClick={handleRetry}>
          Retry
        </Button>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" height="50vh" bgcolor="#f0f0f0">
        <Typography variant="body1" mt={2} color="textSecondary">
          {redirectMessage}
        </Typography>
        <Navigate to="/login" />
      </Box>
    );
  }

  return <Component />;
};

export default ProtectedRoute;

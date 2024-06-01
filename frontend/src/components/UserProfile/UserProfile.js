import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUserProfile } from '../../actions/userActions';
import { Typography, Avatar, Card, CardContent, Box, Grid, CircularProgress, Alert, Button } from '@mui/material';
import { Link } from 'react-router-dom';

function UserProfile() {
  const dispatch = useDispatch();
  const profile = useSelector(state => state.user.profile);
  const loading = useSelector(state => state.user.loading);
  const error = useSelector(state => state.user.error);

  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh" aria-label="Loading profile">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh" aria-label="Error message">
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!profile) {
    return null; // Handle the case where profile data is not yet available
  }

  return (
    <Box p={4}>
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <Avatar alt={profile.name} src={profile.avatar} sx={{ width: 80, height: 80, mr: 2 }} />
            <Box>
              <Typography variant="h5">{profile.name}</Typography>
              <Typography variant="body2" color="textSecondary">{profile.email}</Typography>
              <Typography variant="body2" color="textSecondary">{profile.type}</Typography>
            </Box>
          </Box>
          <Box mt={2}>
            <Typography variant="body1">{profile.bio}</Typography>
          </Box>
          <Box mt={2}>
            <Button variant="contained" color="primary" component={Link} to="/edit-profile" aria-label="Edit profile">
              Edit Profile
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default UserProfile;

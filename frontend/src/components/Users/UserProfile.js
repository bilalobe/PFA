import React, { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUserProfile } from '../../actions/userActions';
import { Typography, Avatar, Card, CardContent, Box, CircularProgress, Alert, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { createSelector } from 'reselect';

const selectUserState = createSelector(
  state => state.user,
  user => ({ profile: user.profile, loading: user.loading, error: user.error })
);

function UserProfile() {
  const dispatch = useDispatch();
  const { profile, loading, error } = useSelector(selectUserState);

  const fetchProfile = useCallback(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const retryFetchProfile = () => {
    dispatch(fetchUserProfile());
  };

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
        <Button onClick={retryFetchProfile}>Retry</Button>
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh" aria-label="Profile not found">
        <Typography variant="h6">Profile not found</Typography>
      </Box>
    );
  }

  return (
    <Box display="flex" justifyContent="center" alignItems="center" height="50vh" aria-label="User profile">
      <Card>
        <CardContent>
          <Avatar src={profile.avatar} />
          <Typography variant="h5">{profile.name}</Typography>
          <Typography variant="body1">{profile.email}</Typography>
          <Button component={Link} to="/edit-profile">Edit Profile</Button>
        </CardContent>
      </Card>
    </Box>
  );
}

export default UserProfile;

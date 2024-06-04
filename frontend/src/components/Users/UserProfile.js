import React, { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUserProfile } from '../../actions/userActions';
import { createSelector } from 'reselect';
import { Box, CircularProgress, Alert, Button, Typography } from '@mui/material';
import { useParams, Link } from 'react-router-dom';

// Create a selector to efficiently get the user state
const selectUserState = createSelector(
  (state) => state.user,
  (user) => ({ 
    profile: user.profile, 
    loading: user.loading, 
    error: user.error
  })
);

function UserProfile() {
  const dispatch = useDispatch();
  const { profile, loading, error } = useSelector(selectUserState);
  const { userId } = useParams(); // Get userId from route parameters

  const fetchProfile = useCallback(() => {
    dispatch(fetchUserProfile(userId));
  }, [dispatch, userId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const retryFetchProfile = () => {
    fetchProfile(); 
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
          <Box display="flex" flexDirection="column" alignItems="center">
            <Avatar src={profile.profile_picture} alt="Profile Picture" sx={{ width: 64, height: 64, mb: 2 }} />
            <Typography variant="h5">User: {profile.user}</Typography>
            <Typography variant="body1">User Type: {profile.user_type}</Typography>
            <Typography variant="body1">Bio: {profile.bio}</Typography>
            <Button component={Link} to={`/edit-profile/${profile.id}`} sx={{ mt: 2 }} variant="contained" color="primary">
              Edit Profile
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default UserProfile;

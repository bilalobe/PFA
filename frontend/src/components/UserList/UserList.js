import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUsers } from '../../actions/userActions'; 
import UserListItem from './UserListItem';
import { Grid, Typography, CircularProgress } from '@mui/material';

function UserList() {
  const dispatch = useDispatch();
  const users = useSelector((state) => state.user.users);
  const isLoading = useSelector((state) => state.user.isLoading);
  const error = useSelector((state) => state.user.error);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  if (isLoading) {
    return (
      
        <CircularProgress />
      
    );
  }

  if (error) {
    return (
      
        <Typography variant="h6" color="error">
          Erreur de chargement des utilisateurs: {error}
        </Typography>
      
    );
  }

  return (
    
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h4" gutterBottom>
            Liste des utilisateurs
          </Typography>
        </Grid>
        {users.map((user) => (
          <Grid item key={user.id} xs={12} md={6} lg={4}>
            <UserListItem user={user} />
          </Grid>
        ))}
      </Grid>
    
  );
}

export default UserList;
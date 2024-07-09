import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  ListItemSecondaryAction,
} from '@mui/material';
import { useFirestore } from '../../hooks/useFirestore';
import { useFirestoreCollectionData } from '../../hooks/useFirestore';
import { useAuth } from '../../hooks/useAuth'; 
import { User } from '../../interfaces/types'; 
import { useRouter } from 'next/router';

const DashboardUsers = () => {
  const { user } = useAuth();
  const router = useRouter();
  const { deleteDocument } = useFirestore('users');
  const [users, setUsers] = useState<User[]>([]); 
  const [loading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const { data: usersData, loading: usersLoading, error: usersError } = useFirestoreCollectionData('users', {}); 

  useEffect(() => {
    if (usersData) {
      setUsers(usersData as User[]); 
    }
  }, [usersData]);

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setShowDeleteDialog(true); 
  };

  const handleConfirmDelete = async () => {
    if (userToDelete) {
      try {
        await deleteDocument(userToDelete.id); 
        setUsers(users.filter((u) => u.id !== userToDelete.id));
        setShowDeleteDialog(false);
      } catch (error: any) {
        // Handle the error (e.g., display an error message)
        console.error("Error deleting user:", error); 
        setError("Failed to delete user."); 
      }
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false); 
    setUserToDelete(null);
  };

  // If not an admin, redirect 
  useEffect(() => {
      if (user && user.user_type !== 'admin') {
        router.push('/'); 
      } 
  }, [user, router]);

  // Handle loading, errors
  if (usersLoading || loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (usersError || error) {
    return (
      <Alert severity="error">{error || 'Error loading users'}</Alert>
    );
  }

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Manage Users
      </Typography>
      <List>
        {users.map((user) => (
          <ListItem key={user.id}>
            <ListItemAvatar>
              <Avatar>{user.name.charAt(0)}</Avatar> 
            </ListItemAvatar>
            <ListItemText primary={user.name} secondary={user.email} />
            <ListItemSecondaryAction>
              <Button variant="contained" color="secondary" onClick={() => handleDeleteUser(user)}>
                Delete
              </Button>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
      {showDeleteDialog && userToDelete && (
        <Dialog open={showDeleteDialog} onClose={handleCancelDelete}>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancelDelete} color="primary">
              Cancel
            </Button>
            <Button onClick={handleConfirmDelete} color="secondary">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  ); 
};

export default DashboardUsers; 

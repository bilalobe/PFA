import { useState } from 'react';
import { TextField, Button, CircularProgress, Alert } from '@mui/material';
import React from 'react';
import { User } from '../../interfaces/types';

interface ProfileViewProps {
  user: User | null;
  isEditing: boolean;
  isLoading: boolean;
  onSave: (userData: User) => void;
  onEdit: () => void;
  onCancel: () => void;
  onLogout: () => void;
  error: string | null;
}


const ProfileView: React.FC<ProfileViewProps> = ({ user, isEditing, onSave, isLoading, error }) => {
  const [userData, setUserData] = useState<User>(user as User);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserData({
      ...userData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = () => {
    onSave(userData);
  };

  if (isLoading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <div>
      {isEditing ? (
        <form onSubmit={handleSubmit}>
          <TextField
            label="Name"
            type="text"
            name="displayName"
            value={userData.displayName}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Email"
            type="email"
            name="email"
            value={userData.email || ''}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
          {/* Add more fields as needed */}
          <Button type="submit" variant="contained" color="primary">
            Save
          </Button>
        </form>
      ) : (
        <div>
          <p>Name: {userData.displayName}</p>
          <p>Email: {userData.email}</p>
          {/* Display more fields as needed */}
        </div>
      )}
    </div>
  );
};

export { ProfileView };
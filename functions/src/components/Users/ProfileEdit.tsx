import React, { useState } from 'react';
import { Box, Button, TextField } from '@material-ui/core';
import { User } from '../../interfaces/types';

interface ProfileEditProps {
  user: User;
  onCancel: () => void;
  onSave: (updatedUser: User) => void;
}

const ProfileEdit: React.FC<ProfileEditProps> = ({ user, onCancel, onSave }) => {
  const [editedUser, setEditedUser] = useState<User>(user);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedUser({ ...editedUser, [name]: value });
  };

  const handleSave = () => {
    onSave(editedUser);
  };

  return (
    <Box>
      <TextField
        label="Name"
        name="name"
        value={editedUser.name}
        onChange={handleChange}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Email"
        name="email"
        value={editedUser.email}
        onChange={handleChange}
        fullWidth
        margin="normal"
      />
      {/* Add other fields as needed */}
      <Box mt={2}>
        <Button variant="contained" color="primary" onClick={handleSave}>
          Save
        </Button>
        <Button variant="contained" onClick={onCancel} style={{ marginLeft: '10px' }}>
          Cancel
        </Button>
      </Box>
    </Box>
  );
};

export default ProfileEdit;
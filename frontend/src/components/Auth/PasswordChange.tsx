import React, { useState } from 'react';
import firebase from '../../../firebaseConfig'; // Adjust the import path
import { TextField, Button, Alert } from '@mui/material';

const PasswordChange = () => {
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | undefined>('');

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    const user = firebase.auth().currentUser;
    if (user) {
      try {
        await user.updatePassword(newPassword);
        setMessage('Your password has been changed successfully.');
      } catch (error) {
        setError('Failed to change password. ' + error.message);
      }
    } else {
      setError('No user is currently signed in.');
    }
  };

  return (
    <div>
      <form onSubmit={handleChangePassword}>
        <TextField
          label="New Password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <Button type="submit" variant="contained" color="primary">
          Change Password
        </Button>
      </form>
      {message && <Alert severity="success">{message}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}
    </div>
  );
};

export default PasswordChange;
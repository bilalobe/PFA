import React, { useState } from 'react';
import { TextField, Button, Alert } from '@mui/material';
import { getAuth, updatePassword } from "firebase/auth";

const PasswordChange = () => {
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | undefined>('');

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      try {
        await updatePassword(user, newPassword);
        setMessage('Your password has been changed successfully.');
      } catch (error) {
        if (error instanceof Error) {
          setError('Failed to change password. ' + error.message);
        } else {
          setError('Failed to change password. An unknown error occurred.');
        }
      }
    } else {
      setError('No user is currently signed in.');
    }
  }

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
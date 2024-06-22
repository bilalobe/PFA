import React, { useState } from 'react';
import firebase from '../../../firebaseConfig'; // Adjust the import path
import { TextField, Button, Alert } from '@mui/material';

const PasswordReset = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      await firebase.auth().sendPasswordResetEmail(email);
      setMessage('Check your email for the password reset link.');
    } catch (error) {
      setError('Failed to send password reset email. Make sure the email is correct.');
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Button type="submit" variant="contained" color="primary">
          Send Password Reset Email
        </Button>
      </form>
      {message && <Alert severity="success">{message}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}
    </div>
  );
};

export default PasswordReset;
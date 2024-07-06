import * as React from 'react';
import { useState, FormEvent } from 'react';
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { TextField, Button, Alert } from '@mui/material';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '../../firebaseConfig';

// Initialize Firebase
const FirebaseApp = initializeApp(firebaseConfig);

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSignUp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage('');
    setError('');
    const auth = getAuth(FirebaseApp);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await sendEmailVerification(user);
      setMessage('Please check your email to verify your account.');
    } catch (error) {
      if (error instanceof Error) setError('Failed to create account. ' + error.message);
      else setError('Failed to create account. An unknown error occurred.');
    }
  };

  return (
    <div>
      <form onSubmit={handleSignUp}>
        <TextField
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit" variant="contained" color="primary">
          Sign Up
        </Button>
      </form>
      {message && <Alert severity="success">{message}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}
    </div>
  );
};

export default SignUp;
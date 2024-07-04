import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword, setPersistence, browserSessionPersistence } from "firebase/auth";
import { Alert } from '@mui/material';
import { FirebaseError } from 'firebase/app';
import { toast } from 'react-toastify';
import { Navigate } from 'react-router';

const SignInForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // Track submission state

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    const auth = getAuth();
    try {
      await setPersistence(auth, browserSessionPersistence);
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('You are now signed in! Welcome back.');
      Navigate({ to: '/dashboard' });
    } catch (error) {
      if (error instanceof FirebaseError) {
        console.error('Authentication error:', error.message);
        switch (error.code) {
          case 'auth/user-not-found':
            setError('No user found with this email.');
            break;
          case 'auth/wrong-password':
            setError('Incorrect password. Please try again.');
            break;
          default:
            setError('Failed to sign in. Please try again later.');
        }
      } else {
        console.error('An unexpected error occurred:', error);
        setError('An unexpected error occurred. Please try again later.');
      }
    } finally {
      setIsSubmitting(false); // Reset submission state regardless of outcome
    }
  };

  // Clear error when user starts typing again
  const handleChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (event: React.ChangeEvent<HTMLInputElement>) => {
    if (error) setError('');
    setter(event.target.value);
  };

  return (
    <form onSubmit={handleSignIn}>
      <input
        type="email"
        value={email}
        onChange={handleChange(setEmail)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={handleChange(setPassword)}
        placeholder="Password"
        required
      />
      <button type="submit" disabled={isSubmitting}>Sign In</button>
      {error && <Alert severity="error">{error}</Alert>}
    </form>
  );
};

export default SignInForm;
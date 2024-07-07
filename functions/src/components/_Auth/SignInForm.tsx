import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from 'next/router';
import { Alert } from '@mui/material';

const SignInForm = ({ onSignInSuccess, onSignInFailure }: { onSignInSuccess: any, onSignInFailure: any }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const router = useRouter();

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const auth = getAuth();
      await signInWithEmailAndPassword(auth, email, password);
      setLoading(false);
      onSignInSuccess && onSignInSuccess();
      router.push('/dashboard'); // Redirect to dashboard or another page
    } catch (error: any) {
      setLoading(false);
      setError(`Failed to sign in. Error: ${error.message}`);
      onSignInFailure && onSignInFailure(error.message);
    }
  };

  return (
    <form onSubmit={handleSignIn}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Signing In...' : 'Sign In'}
      </button>
      {error && <Alert severity="error">{error}</Alert>}
    </form>
  );
};

export default SignInForm;
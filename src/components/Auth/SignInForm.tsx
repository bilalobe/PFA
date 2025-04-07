import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Alert, TextField, Button, Box, CircularProgress, Typography } from '@mui/material';
import { signInWithEmail } from '../../services/auth';

interface SignInFormProps {
  onSignInSuccess?: () => void;
  onSignInFailure?: (error: string) => void;
  redirectTo?: string;
}

const SignInForm: React.FC<SignInFormProps> = ({ 
  onSignInSuccess, 
  onSignInFailure,
  redirectTo = '/dashboard'
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const router = useRouter();

  // Listen for online/offline events
  React.useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    
    // If offline, show error
    if (isOffline) {
      setError('You are offline. Please check your internet connection and try again.');
      setLoading(false);
      onSignInFailure && onSignInFailure('Offline - cannot authenticate');
      return;
    }
    
    try {
      await signInWithEmail(email, password);
      setLoading(false);
      onSignInSuccess && onSignInSuccess();
      router.push(redirectTo);
    } catch (error: any) {
      setLoading(false);
      
      // Handle different error codes with user-friendly messages
      let errorMessage = 'Failed to sign in. Please try again.';
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later or reset your password.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      onSignInFailure && onSignInFailure(errorMessage);
    }
  };

  return (
    <form onSubmit={handleSignIn}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
        <TextField
          label="Email Address"
          type="email"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          required
          InputProps={{
            // Show offline indicator in the field
            endAdornment: isOffline ? (
              <Typography variant="caption" color="error">Offline</Typography>
            ) : null
          }}
        />
        
        <TextField
          label="Password"
          type="password"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          required
        />
      </Box>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <Button 
        type="submit" 
        variant="contained" 
        color="primary"
        fullWidth
        disabled={loading || isOffline}
        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
      >
        {loading ? 'Signing In...' : 'Sign In'}
      </Button>
      
      {isOffline && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          You are currently offline. Sign-in requires an internet connection.
        </Alert>
      )}
    </form>
  );
};

export default SignInForm;
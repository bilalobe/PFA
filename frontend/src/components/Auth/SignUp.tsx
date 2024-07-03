import React, { useState, FormEvent } from 'react';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { TextField, Button, Alert, Box, CircularProgress, Typography } from '@mui/material';
import ReCAPTCHA from 'react-google-recaptcha';
import QRCode from 'qrcode.react';
import speakeasy from 'speakeasy';

const SignUpForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [twoFactorSecret, setTwoFactorSecret] = useState('');
  const [twoFactorToken, setTwoFactorToken] = useState('');
  const [showQR, setShowQR] = useState(false);

  const handleSignUp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!recaptchaToken) {
      setError('Please complete the reCAPTCHA.');
      return;
    }
    setLoading(true);
    setMessage('');
    setError('');
    const auth = getAuth();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const secret = speakeasy.generateSecret();
      setTwoFactorSecret(secret.base32);
      setShowQR(true);
      // Here, you should save the secret to your database associated with the user
      // For demonstration, we're just logging it
      console.log("2FA secret (store this securely):", secret.base32);
      // Normally, you'd send an email verification here
      // For 2FA setup, we're moving to the QR code display instead
    } catch (error) {
      if (error instanceof Error) setError('Failed to create account. ' + error.message);
      else setError('Failed to create account. An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const verify2FAToken = () => {
    const verified = speakeasy.totp.verify({
      secret: twoFactorSecret,
      encoding: 'base32',
      token: twoFactorToken,
    });
    if (verified) {
      setMessage('2FA setup successful. Account created.');
      setShowQR(false);
      // Here, complete any additional sign-up steps, like finalizing the user record
    } else {
      setError('Invalid 2FA Token. Please try again.');
    }
  };

  return (
    <Box sx={{ p: 3, bgcolor: 'background.default', borderRadius: 1 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Sign Up
      </Typography>
      {!showQR ? (
        <form onSubmit={handleSignUp}>
          <TextField
            fullWidth
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            margin="normal"
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            margin="normal"
          />
          <ReCAPTCHA
            sitekey="YOUR_RECAPTCHA_SITE_KEY"
            onChange={(token) => setRecaptchaToken(token)}
          />
          <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading} sx={{ mt: 3 }}>
            {loading ? <CircularProgress size={24} /> : 'Sign Up'}
          </Button>
        </form>
      ) : (
        <Box>
          <Typography>Scan the QR code with your 2FA app</Typography>
          <QRCode value={`otpauth://totp/eleanor:${email}?secret=${twoFactorSecret}&issuer=eleanor`} />
          <TextField
            fullWidth
            label="2FA Token"
            value={twoFactorToken}
            onChange={(e) => setTwoFactorToken(e.target.value)}
            required
            margin="normal"
          />
          <Button onClick={verify2FAToken} variant="contained" color="primary" fullWidth sx={{ mt: 3 }}>
            Verify and Complete Sign Up
          </Button>
        </Box>
      )}
      {message && <Alert severity="success" sx={{ mt: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
    </Box>
  );
};

export default SignUpForm;

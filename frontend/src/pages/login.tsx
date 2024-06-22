// Import necessary libraries and components
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useForm, Controller } from 'react-hook-form';
import { Box, TextField, Button, Typography, Alert } from '@mui/material';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import '../../firebaseConfig';

// Define the validation schema
const schema = Yup.object().shape({
  username: Yup.string().required('Username is required'),
  password: Yup.string().required('Password is required'),
});

// LoginForm component for handling the login form UI and validation
const LoginForm = ({ onSubmit, errors }) => (
  <Box component="form" onSubmit={onSubmit} noValidate>
    <Typography variant="h4" component="h1" gutterBottom>Login</Typography>
    <Controller
      name="username"
      defaultValue=""
      render={({ field }) => (
        <TextField
          {...field}
          variant="outlined"
          margin="normal"
          required
          fullWidth
          label="Username"
          autoComplete="username"
          error={!!errors.username}
          helperText={errors.username ? errors.username.message : ''}
        />
      )}
    />
    <Controller
      name="password"
      defaultValue=""
      render={({ field }) => (
        <TextField
          {...field}
          variant="outlined"
          margin="normal"
          required
          fullWidth
          label="Password"
          type="password"
          autoComplete="current-password"
          error={!!errors.password}
          helperText={errors.password ? errors.password.message : ''}
        />
      )}
    />
    <Button type="submit" fullWidth variant="contained" color="primary">Login</Button>
  </Box>
);

// Main Login component
function Login() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: { username: string; password: string }) => {/*...*/};

  return (
    <>
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">Login successful!</Alert>}
      <LoginForm onSubmit={handleSubmit(onSubmit)} errors={errors} />
    </>
  );
}
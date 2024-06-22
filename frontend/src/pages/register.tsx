import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { TextField, Button, Box, MenuItem, Typography, Alert } from '@mui/material';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/types/store';
import { registerUser } from '@/types/features/authentification/authSlice';

const validationSchema = Yup.object().shape({
  username: Yup.string().required('Username is required'),
  email: Yup.string().email('Invalid email format').required('Email is required'),
  password: Yup.string().required('Password is required'),
  userType: Yup.string()
    .oneOf(['student', 'teacher', 'supervisor'], 'Invalid user type')
    .required('User type is required'),
});

interface RegisterFormValues {
  username: string;
  email: string;
  password: string;
  userType: 'student' | 'teacher' | 'supervisor';
}

const Register = () => {
  const dispatch = useDispatch<AppDispatch>(); // Use AppDispatch type for correct typing
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: yupResolver(validationSchema)
  });

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      await dispatch(registerUser(values)).unwrap(); // Use unwrap to handle the promise
      setSuccess(true);
      setError(null);
      router.push('/login'); // Redirect to login after registration
    } catch (error) {
      if (error instanceof Error) { // Type guard for error
        setError(error.message);
      } else {
        setError('An unexpected error occurred');
      }
      setSuccess(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Register
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">Registration successful!</Alert>}
      <TextField
        variant="outlined"
        margin="normal"
        required
        fullWidth
        id="username"
        label="Username"
        autoComplete="username"
        autoFocus
        {...register('username')}
        error={Boolean(errors.username)}
        helperText={errors.username?.message}
      />
      <TextField
        variant="outlined"
        margin="normal"
        required
        fullWidth
        id="email"
        label="Email"
        autoComplete="email"
        {...register('email')}
        error={Boolean(errors.email)}
        helperText={errors.email?.message}
      />
      <TextField
        variant="outlined"
        margin="normal"
        required
        fullWidth
        id="password"
        label="Password"
        type="password"
        autoComplete="current-password"
        {...register('password')}
        error={Boolean(errors.password)}
        helperText={errors.password?.message}
      />
      <TextField
        variant="outlined"
        margin="normal"
        required
        fullWidth
        id="userType"
        label="User Type"
        select
        {...register('userType')}
        error={Boolean(errors.userType)}
        helperText={errors.userType?.message}
      >
        <MenuItem value="student">Student</MenuItem>
        <MenuItem value="teacher">Teacher</MenuItem>
        <MenuItem value="supervisor">Supervisor</MenuItem>
      </TextField>
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
      >
        Register
      </Button>
    </Box>
  );
};

export default Register;
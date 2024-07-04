import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { TextField, Button, Box, Grid, MenuItem, Typography, Alert, CircularProgress, IconButton, InputAdornment } from '@mui/material';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/types/store';
import { registerUser } from '@/types/features/authentification/authSlice';
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Link from 'next/link';

interface RegisterFormValues {
  username: string;
  email: string;
  password: string;
  userType: string;
}

const validationSchema = Yup.object().shape({
  username: Yup.string().required('Username is required'),
  email: Yup.string().email('Invalid email format').required('Email is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  userType: Yup.string()
    .oneOf(['student', 'teacher', 'supervisor'], 'Invalid user type')
    .required('User type is required'),
});

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: yupResolver(validationSchema as any)
  });
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const onSubmit = async (values: RegisterFormValues) => {
    setLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(getAuth(), values.email, values.password);
      await dispatch(registerUser(values)).unwrap();
      setSuccess(true);
      router.push('/login');
    } catch (firebaseError) {
      setLoading(false);
      if (firebaseError instanceof Error) {
        setError(firebaseError.message);
      } else {
        setError('An unexpected error occurred');
      }
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Register
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>Registration successful!</Alert>}
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Username"
            {...register('username')}
            error={!!errors.username}
            helperText={errors.username?.message}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            {...register('email')}
            error={!!errors.email}
            helperText={errors.email?.message}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Password"
            type={showPassword ? 'text' : 'password'}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            {...register('password')}
            error={!!errors.password}
            helperText={errors.password?.message}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="User Type"
            select
            {...register('userType')}
            error={!!errors.userType}
            helperText={errors.userType?.message}
          >
            <MenuItem value="student">Student</MenuItem>
            <MenuItem value="teacher">Teacher</MenuItem>
            <MenuItem value="supervisor">Supervisor</MenuItem>
          </TextField>
        </Grid>
      </Grid>
      <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading} sx={{ mt: 3 }}>
        {loading ? <CircularProgress size={24} /> : 'Sign Up'}
      </Button>
      <Box mt={2}>
        <Typography variant="body2">
          Already have an account? <Link href="/login">Log in</Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default Register;

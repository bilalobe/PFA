import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { TextField, Button, Box, MenuItem, Typography, Alert } from '@mui/material';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import { registerUser } from '../features/auth/authSlice';

const validationSchema = Yup.object().shape({
  username: Yup.string().required('Username is required'),
  email: Yup.string().email('Invalid email format').required('Email is required'),
  password: Yup.string().required('Password is required'),
  userType: Yup.string()
    .oneOf(['student', 'teacher', 'supervisor'], 'Invalid user type')
    .required('User type is required'),
});

function Register() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [error, setError] = useState<string | null>('');
  const [success, setSuccess] = useState(false);

  const formik = useFormik({
    initialValues: {
      username: '',
      email: '',
      password: '',
      userType: 'student', // Default user type
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await dispatch(registerUser(values));
        setSuccess(true);
        setError(null);
        router.push('/login'); // Redirect to login after registration
      } catch (error) {
        setSubmitting(false);
        setSuccess(false);
        setError(error.message);
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <Box component="form" onSubmit={formik.handleSubmit} noValidate sx={{ mt: 1 }}>
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
        name="username"
        autoComplete="username"
        autoFocus
        value={formik.values.username}
        onChange={formik.handleChange}
        error={formik.touched.username && Boolean(formik.errors.username)}
        helperText={formik.touched.username && formik.errors.username}
      />
      <TextField
        variant="outlined"
        margin="normal"
        required
        fullWidth
        id="email"
        label="Email"
        name="email"
        autoComplete="email"
        value={formik.values.email}
        onChange={formik.handleChange}
        error={formik.touched.email && Boolean(formik.errors.email)}
        helperText={formik.touched.email && formik.errors.email}
      />
      <TextField
        variant="outlined"
        margin="normal"
        required
        fullWidth
        id="password"
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        value={formik.values.password}
        onChange={formik.handleChange}
        error={formik.touched.password && Boolean(formik.errors.password)}
        helperText={formik.touched.password && formik.errors.password}
      />
      <TextField
        variant="outlined"
        margin="normal"
        required
        fullWidth
        id="userType"
        label="User Type"
        name="userType"
        select
        value={formik.values.userType}
        onChange={formik.handleChange}
        error={formik.touched.userType && Boolean(formik.errors.userType)}
        helperText={formik.touched.userType && formik.errors.userType}
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
        disabled={formik.isSubmitting}
      >
        Register
      </Button>
    </Box>
  );
};

export default Register;

import React, { useState } from 'react';
import { useFormik, useFormikContext } from 'formik';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import { loginUser } from '../features/auth/authSlice';
import { Box, TextField, Button, Typography, Alert } from '@mui/material';
import * as Yup from 'yup';

interface FormikTextFieldProps {
  name: string;
  label: string;
  type?: string;
  autoComplete: string;
}

const FormikTextField = ({ name, label, type = "text", autoComplete }: FormikTextFieldProps) => {
  const formik = useFormikContext<{ [key: string]: string }>(); // Explicitly define the type of formik

  return (
    <TextField
      variant="outlined"
      margin="normal"
      required
      fullWidth
      id={name}
      label={label}
      name={name}
      type={type}
      autoComplete={autoComplete}
      value={formik.values[name]}
      onChange={formik.handleChange}
      error={formik.touched[name] && Boolean(formik.errors[name])}
      helperText={formik.touched[name] && formik.errors[name]}
    />
  );
};

const validationSchema = Yup.object().shape({
  username: Yup.string().required('Username is required'),
  password: Yup.string().required('Password is required'),
});

const Login: React.FC = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await dispatch(loginUser(values));
        setSuccess(true);
        setError(null);
        router.push('/dashboard'); // Redirect to dashboard after login
      } catch (error: any) {
        setSubmitting(false);
        setSuccess(false);
        setError(error.message);
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <Box component="form" onSubmit={formik.handleSubmit} noValidate>
      <Typography variant="h4" component="h1" gutterBottom>
        Login
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">Login successful!</Alert>}
      <FormikTextField
        name="username"
        label="Username"
        type="text"
        autoComplete="username"
      />
      <FormikTextField
        name="password"
        label="Password"
        type="password"
        autoComplete="current-password"
      />
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
        disabled={formik.isSubmitting}
      >
        Login
      </Button>
    </Box>
  );
};

export default Login;

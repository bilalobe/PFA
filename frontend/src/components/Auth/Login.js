import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../features/auth/authSlice';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, CircularProgress, Box, Typography, Alert } from '@mui/material';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object().shape({
  username: Yup.string().required('Username is required'),
  password: Yup.string().required('Password is required'),
});

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { error, loading } = useSelector(state => state.auth);

  const handleSubmit = async (values, { setSubmitting }) => {
    setSubmitting(true);
    try {
      await dispatch(login(values)).unwrap();
      navigate('/'); // Redirect to home page after successful login
    } catch (error) {
      console.error('Error during login:', error);
    }
    setSubmitting(false);
  };

  return (
    <Box p={4} maxWidth={600} mx="auto">
      <Typography variant="h4" gutterBottom>
        Login
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Formik
        initialValues={{ username: '', password: '' }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, handleChange, values, errors, touched }) => (
          <Form>
            <Field
              name="username"
              as={TextField}
              label="Username"
              variant="outlined"
              fullWidth
              margin="normal"
              value={values.username}
              onChange={handleChange}
              error={touched.username && Boolean(errors.username)}
              helperText={<ErrorMessage name="username" />}
            />
            <Field
              name="password"
              as={TextField}
              label="Password"
              variant="outlined"
              fullWidth
              margin="normal"
              type="password"
              value={values.password}
              onChange={handleChange}
              error={touched.password && Boolean(errors.password)}
              helperText={<ErrorMessage name="password" />}
            />
            <Box display="flex" justifyContent="center" mt={2}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isSubmitting || loading}
              >
                {loading ? <CircularProgress size={20} color="inherit" /> : 'Login'}
              </Button>
            </Box>
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default Login;

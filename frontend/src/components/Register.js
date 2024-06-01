import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { register } from '../features/auth/authSlice';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, CircularProgress, Box, Typography, Alert, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object().shape({
  username: Yup.string().required('Username is required'),
  email: Yup.string().email('Invalid email format').required('Email is required'),
  password: Yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters'),
  userType: Yup.string().required('User type is required'),
});

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { error, loading } = useSelector(state => state.auth);

  const handleSubmit = async (values, { setSubmitting }) => {
    setSubmitting(true);
    try {
      await dispatch(register(values)).unwrap();
      navigate('/login'); // Redirect to login page after successful registration
    } catch (error) {
      console.error('Error during registration:', error);
    }
    setSubmitting(false);
  };

  return (
    <Box p={4} maxWidth={600} mx="auto">
      <Typography variant="h4" gutterBottom>
        Register
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Formik
        initialValues={{ username: '', email: '', password: '', userType: '' }}
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
              name="email"
              as={TextField}
              label="Email"
              variant="outlined"
              fullWidth
              margin="normal"
              type="email"
              value={values.email}
              onChange={handleChange}
              error={touched.email && Boolean(errors.email)}
              helperText={<ErrorMessage name="email" />}
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
            <FormControl fullWidth margin="normal">
              <InputLabel id="userType-label">User Type</InputLabel>
              <Field
                name="userType"
                as={Select}
                labelId="userType-label"
                label="User Type"
                variant="outlined"
                value={values.userType}
                onChange={handleChange}
                error={touched.userType && Boolean(errors.userType)}
                helperText={<ErrorMessage name="userType" />}
              >
                <MenuItem value="">Select User Type</MenuItem>
                <MenuItem value="teacher">Teacher</MenuItem>
                <MenuItem value="student">Student</MenuItem>
                <MenuItem value="supervisor">Supervisor</MenuItem>
              </Field>
            </FormControl>
            <Box display="flex" justifyContent="center" mt={2}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isSubmitting || loading}
              >
                {loading ? <CircularProgress size={20} color="inherit" /> : 'Register'}
              </Button>
            </Box>
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default Register;

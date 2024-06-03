import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateUserProfile, fetchUserProfile } from '../../actions/userActions'; 
import { Button, TextField, Box, Typography, Alert, CircularProgress, Snackbar } from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object().shape({
  bio: Yup.string().max(500, 'Bio cannot exceed 500 characters'), 
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
});

function EditProfile() {
  const dispatch = useDispatch();
  const profile = useSelector(state => state.user.profile);
  const loading = useSelector(state => state.user.loading);
  const error = useSelector(state => state.user.error);

  const [success, setSuccess] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  const handleSubmit = async (values, { setSubmitting }) => {
    setSubmitting(true);
    try {
      await dispatch(updateUserProfile(values));
      setSuccess(true);
      setOpenSnackbar(true);
    } catch (error) {
      setSuccess(false);
      console.error('Error updating profile:', error);
    }
    setSubmitting(false);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh" aria-label="Loading profile">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Typography variant="h4" component="div" gutterBottom tabIndex={0}>
        Edit Profile
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      <Snackbar open={success} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          Profile updated successfully!
        </Alert>
      </Snackbar>
      <Formik 
        initialValues={{
          bio: profile?.bio || '',
          firstName: profile?.firstName || '',
          lastName: profile?.lastName || '',
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, handleChange, handleSubmit, values, errors, touched }) => (
          <Form onSubmit={handleSubmit}>
            <Field
              name="firstName"
              as={TextField}
              label="First Name"
              fullWidth
              value={values.firstName}
              onChange={handleChange}
              error={touched.firstName && Boolean(errors.firstName)}
              helperText={touched.firstName && errors.firstName}
              sx={{ mb: 2 }}
            />
            <Field
              name="lastName"
              as={TextField}
              label="Last Name"
              fullWidth
              value={values.lastName}
              onChange={handleChange}
              error={touched.lastName && Boolean(errors.lastName)}
              helperText={touched.lastName && errors.lastName}
              sx={{ mb: 2 }}
            />
            <Field
              name="bio"
              as={TextField}
              label="Bio"
              fullWidth
              multiline
              rows={4}
              value={values.bio}
              onChange={handleChange}
              error={touched.bio && Boolean(errors.bio)}
              helperText={touched.bio && errors.bio}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ mt: 2 }}
              disabled={isSubmitting || loading}
            >
              Update Profile
            </Button>
          </Form>
        )}
      </Formik>
    </Box>
  );
}

export default EditProfile;

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Field, Form } from 'formik';
import * as Yup from 'yup';
import { Button, TextField, Box, Typography, Alert, Snackbar, CircularProgress } from '@mui/material';
import { enrollCourse } from '../../actions/courseActions';

const validationSchema = Yup.object().shape({
  courseName: Yup.string().required('Course name is required'),
  courseDescription: Yup.string().required('Course description is required'),
});

function CourseEnrollment() {
  const dispatch = useDispatch();
  const { enrollmentSuccess, error, loading } = useSelector(state => state.course);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleSubmit = async (values, { setSubmitting }) => {
    setSubmitting(true);
    await dispatch(enrollCourse(values));
    setSubmitting(false);
    setOpenSnackbar(true);
  };

  const handleCloseSnackbar = (_, reason) => {
    if (reason === 'clickaway') return;
    setOpenSnackbar(false);
  };

  return (
    <Box p={4} maxWidth={600} margin="auto">
      <Typography variant="h4" component="div" gutterBottom>
        Enroll in Course
      </Typography>
      {loading && <CircularProgress />}
      <Formik
        initialValues={{ courseName: '', courseDescription: '' }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form>
            <Field
              name="courseName"
              as={TextField}
              label="Course Name"
              fullWidth
              margin="normal"
              required
            />
            <Field
              name="courseDescription"
              as={TextField}
              label="Course Description"
              fullWidth
              margin="normal"
              required
            />
            <Button type="submit" variant="contained" color="primary" disabled={isSubmitting || loading} sx={{ mt: 2 }}>
              Enroll
            </Button>
          </Form>
        )}
      </Formik>

      <Snackbar open={Boolean(error)} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar open={enrollmentSuccess && openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          Successfully enrolled in the course!
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default CourseEnrollment;

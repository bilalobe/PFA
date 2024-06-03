import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createForumPost } from '../../actions/forumActions';
import { Button, TextField, Box, Typography, CircularProgress, Alert, Snackbar } from '@mui/material';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

// Validation schema for the form
const validationSchema = Yup.object().shape({
  title: Yup.string().required('Title is required.'),
  content: Yup.string().required('Content is required.')
});

function CreatePostForm({ courseId }) {
  const dispatch = useDispatch();
  const loading = useSelector(state => state.forum.loading);
  const error = useSelector(state => state.forum.error);
  const success = useSelector(state => state.forum.success);

  const formik = Formik({
    initialValues: { title: '', content: '' },
    validationSchema,
    onSubmit: (values, { setSubmitting }) => {
      dispatch(createForumPost(courseId, values.title, values.content));
      setSubmitting(false);
    }
  });

  useEffect(() => {
    if (success) {
      // Clear form state when form submission is successful
      formik.resetForm();
    }
  }, [success]);

  return (
    <div>
      <Formik>
        <Form>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Field 
              name="title" 
              as={TextField} 
              label="Title" 
              fullWidth 
              required
              aria-label="Title"
              variant="outlined" // Use different variants for styling
            />
            <ErrorMessage name="title">
              {msg => (
                <Typography color="error">{msg}</Typography>
              )}
            </ErrorMessage>

            <Field 
              name="content" 
              as={TextField} 
              label="Content" 
              multiline 
              rows={4} 
              fullWidth 
              required
              aria-label="Content"
              variant="outlined" // Use different variants for styling
            />
            <ErrorMessage name="content">
              {msg => (
                <Typography color="error">{msg}</Typography>
              )}
            </ErrorMessage>

            {loading && <CircularProgress />}
            {error && <Alert severity="error">{error}</Alert>}
            {success && <Snackbar open={success} autoHideDuration={6000} message="Post created successfully!" />}

            <Button 
              type="submit" 
              variant="contained" 
              color="primary" 
              disabled={loading}
              aria-label="Create Post"
              sx={{
                '&:focus': {
                  outline: '2px solid #007bff',
                  boxShadow: '0 0 5px #007bff',
                },
              }}
            >
              Create Post
            </Button>
          </Box>
        </Form>
      </Formik>
    </div>
  );
}

export default CreatePostForm;

import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { TextField, Button, Box, Typography, CircularProgress, Alert } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { createComment } from '../../actions/commentActions';

const CommentSchema = Yup.object().shape({
  content: Yup.string()
    .required('Comment is required')
    .min(5, 'Comment must be at least 5 characters long')
    .max(500, 'Comment cannot exceed 500 characters'),
});

function Comment({ postId }) {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.comment);

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      await dispatch(createComment({ postId, content: values.content }));
      resetForm();
    } catch (error) {
      console.error('Error creating comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ mt: 5 }}>
      <Typography variant="h6" gutterBottom>
        Add a Comment
      </Typography>
      <Formik
        initialValues={{ content: '' }}
        validationSchema={CommentSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form noValidate>
            <Box sx={{ mb: 2 }}>
              <Field
                name="content"
                as={TextField}
                label="Comment"
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                error={Boolean(error)}
                helperText={<ErrorMessage name="content" component="div" style={{ color: 'red' }} />}
              />
            </Box>
            {error && <Alert severity="error">{error}</Alert>}
            <Box sx={{ position: 'relative' }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isSubmitting || loading}
              >
                {loading ? 'Submitting...' : 'Submit'}
              </Button>
              {loading && (
                <CircularProgress
                  size={24}
                  sx={{
                    color: 'primary.main',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    marginTop: '-12px',
                    marginLeft: '-12px',
                  }}
                />
              )}
            </Box>
          </Form>
        )}
      </Formik>
    </Box>
  );
}

export default Comment;

import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { createForumThread } from '../../../redux/actions/forumActions';
import { Button, TextField, Box, Typography, CircularProgress, Alert, AlertTitle } from '@mui/material';
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { RootState } from '../../../redux/store';
import axios from 'axios';
import io from 'socket.io-client';

// Define the type of the form values
interface FormValues {
  title: string;
  content: string;
}

// Validation schema for the form
const validationSchema = Yup.object().shape({
  title: Yup.string().required('Title is required.'),
  content: Yup.string().required('Content is required.'),
});

const CreateForumThread: React.FC = () => {
  const router = useRouter();
  const { forumId } = router.query;
  const dispatch = useDispatch();
  const loading = useSelector((state: RootState) => state.forum.loading);
  const error = useSelector((state: RootState) => state.forum.error);
  const success = useSelector((state: RootState) => state.forum.success);

  const handleSubmit = async (values: FormValues, { setSubmitting }: FormikHelpers<FormValues>) => {
    try {
      await dispatch(createForumThread(forumId as string, values.title, values.content));
      setSubmitting(false);
      router.push(`/forums/${forumId}`);
    } catch (err) {
      console.error('Error creating thread:', err);
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4">Create New Thread</Typography>
      <Formik
        initialValues={{ title: '', content: '' }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, errors }) => (
          <Form>
            <Box mb={2}>
              <Field
                name="title"
                as={TextField}
                label="Title"
                fullWidth
                error={!!errors.title}
                helperText={<ErrorMessage name="title" />}
              />
            </Box>
            <Box mb={2}>
              <Field
                name="content"
                as={TextField}
                label="Content"
                fullWidth
                multiline
                error={!!errors.content}
                helperText={<ErrorMessage name="content" />}
              />
            </Box>
            <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
              Create Thread
            </Button>
            {loading && <CircularProgress />}
            {error && (
              <Alert severity="error" variant="filled" icon={<ErrorIcon fontSize="inherit" />}>
                <AlertTitle>Error</AlertTitle>
                {error.submit}
              </Alert>
            )}
            {success && (
              <Alert severity="success" variant="filled" icon={<CheckCircleIcon fontSize="inherit" />}>
                <AlertTitle>Success</AlertTitle>
                Thread created successfully.
              </Alert>
            )}
          </Form>
        )}
      </Formik>
    </Box>
  );
};

async function fetchData(forumId: string) {
  const response = await axios.get(`http://localhost:8000/api/forums/${forumId}`);
  if (response.status !== 200) {
    throw new Error('Failed to fetch data');
  }
  return response.data;
}

export const getServerSideProps = async (context: { params: { forumId: any; }; }) => {
  const { forumId } = context.params;
  const data = await fetchData(forumId);

  return {
    props: {
      data,
    },
  };
};

export default CreateForumThread;
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { createForumThread } from '../../../redux/actions/forumActions';
import { Button, TextField, Box, Typography, CircularProgress, Alert, AlertTitle, ErrorIcon, CheckCircleIcon } from '@mui/material';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

// Validation schema for the form
const validationSchema = Yup.object().shape({
    title: Yup.string().required('Title is required.'),
    content: Yup.string().required('Content is required.')
});

function CreateForumThread() {
    const router = useRouter();
    const { forumId } = router.query;
    const dispatch = useDispatch();
    const loading = useSelector(state => state.forum.loading);
    const error = useSelector(state => state.forum.error);
    const success = useSelector(state => state.forum.success);

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            await dispatch(createForumThread(forumId, values.title, values.content));
            setSubmitting(false);
            // Redirect to the forum page or show a success message
            router.push(`/forums/${forumId}`);
        } catch (error) {
            console.error('Error creating thread:', error);
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
                {({ isSubmitting }) => (
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
                        {/* Display loading or error states */}
                        {loading && <CircularProgress />}
                        {error.submit && (
                            <Alert severity="error" variant="filled" icon={<ErrorIcon fontSize="inherit" />}>
                                <AlertTitle>Error</AlertTitle>
                                {error.submit}
                            </Alert>
                        )}
                        <Button type="submit" disabled={isSubmitting}>
                            Submit
                        </Button>
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
}
export default CreateForumThread;
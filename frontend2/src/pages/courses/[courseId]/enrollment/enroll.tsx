import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { enrollInCourse } from '../../../store/courseSlice'; 
import { Typography, Button, Box, CircularProgress, Alert } from '@mui/material';

const validationSchema = Yup.object().shape({
    // No additional form fields needed for enrollment
});

function EnrollmentPage({ course }) {
    const dispatch = useDispatch();
    const router = useRouter();
    const { courseId } = router.query;
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
    const loading = useSelector((state) => state.course.loading);
    const error = useSelector((state) => state.course.error);
    const success = useSelector((state) => state.course.enrollmentSuccess);

    const handleSubmit = async (values, { setSubmitting }) => {
        setSubmitting(true);

        if (!isAuthenticated) {
            router.push('/login');
            setSubmitting(false);
            return;
        }

        try {
            await dispatch(enrollInCourse(courseId));
            console.log('Enrollment successful!');
        } catch (error) {
            console.error('Error during enrollment:', error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Box p={3}>
            <Typography variant="h4">Enroll in {course.title}</Typography>
            
            {loading && <CircularProgress />}
            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">Enrollment successful!</Alert>}

            <Formik
                initialValues={{}}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ isSubmitting }) => (
                    <Form>
                        <Button type="submit" disabled={isSubmitting} variant="contained" color="primary">
                            Enroll
                        </Button>
                    </Form>
                )}
            </Formik>
        </Box>
    );
}

export async function getServerSideProps(context) {
    const { courseId } = context.params;
    const response = await fetch(`http://your-django-backend/api/courses/${courseId}/`);
    const course = await response.json();

    return {
        props: {
            course,
        },
    };
}

export default EnrollmentPage;

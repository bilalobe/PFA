import React, { useState, useEffect } from 'react';
import { Box, Typography, Alert, CircularProgress, Button } from '@mui/material';
import { useRouter } from 'next/router';
import { useFirestoreDocument } from '../../../hooks/useFirestore';
import useAuth from '../../../hooks/useAuth';
import { enrollmentApi } from '../../../utils/api'; 
import { Course } from '../../../interfaces/types';

const CourseDetail: React.FC = () => {
  const router = useRouter();
  const { courseId } = router.query; 
  const { user } = useAuth();

  const [isEnrolled, setIsEnrolled] = useState(false); 
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);
  const [enrollmentError, setEnrollmentError] = useState<string | null>(null);

  const { docData: course, loading, error } = useFirestoreDocument<Course>('courses', courseId as string);

  useEffect(() => {
    if (user && course) {
      const checkEnrollment = async () => {
        setEnrollmentLoading(true); 
        try {
          const enrollments = await enrollmentApi.fetchEnrollments(); 
          const isUserEnrolled = enrollments.some((enrollment) => enrollment.course === course.id);
          setIsEnrolled(isUserEnrolled);
        } catch (err) {
          setEnrollmentError("Failed to check enrollment status.");
        } finally {
          setEnrollmentLoading(false);
        }
      };

      checkEnrollment(); 
    }
  }, [user, course]); 

  const handleEnroll = async () => {
    if (!user || !courseId) return;

    setEnrollmentLoading(true);
    setEnrollmentError(null);

    try {
      await enrollmentApi.enrollInCourse(courseId as string);
      setIsEnrolled(true); 
    } catch (err) {
      setEnrollmentError((err as Error).message);
    } finally {
      setEnrollmentLoading(false);
    }
  };

  const handleUnenroll = async () => {
    if (!user || !course?.id) return;

    setEnrollmentLoading(true); 
    setEnrollmentError(null);

    try {
      const userEnrollments = await enrollmentApi.fetchEnrollments(); 
      const enrollmentToUnenroll = userEnrollments.find((enrollment) => enrollment.course === course.id);
      
      if (enrollmentToUnenroll) {
        await enrollmentApi.unenrollFromCourse(enrollmentToUnenroll.id);
        setIsEnrolled(false); 
      } else {
        setEnrollmentError("You are not enrolled in this course.");
      }

    } catch (err) {
      if (err instanceof Error) {
        setEnrollmentError(err.message);
      } else {
        setEnrollmentError('An unknown error occurred');
      }
    } finally {
      setEnrollmentLoading(false); 
    }
  };

  // Loading state for the entire page
  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return ( 
      <Alert severity="error">
        Failed to load course details.
      </Alert>
    );
  }

  if (!course) {
    // Handle case where the course is not found 
    return (
      <Alert severity="warning">
        Course not found.
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h4">{course.title}</Typography>
      <Typography variant="subtitle1">By {course.instructorName}</Typography>

      <Typography variant="body1">{course.description}</Typography>
      <Typography variant="body2">Category: {course.category}</Typography>
      <Typography variant="body2">Duration: {course.duration} hours</Typography>

      {/* Enrollment Button (check loading and error state for the button)  */}
      {enrollmentLoading && <CircularProgress />}
      {!enrollmentLoading && !isEnrolled && user && 
        <Button variant="contained" color="primary" onClick={handleEnroll}>
          Enroll
        </Button>
      }
      {!enrollmentLoading && isEnrolled && 
        <Button variant="contained" color="secondary" onClick={handleUnenroll}>
          Unenroll
        </Button>
      }

      {enrollmentError && 
        <Alert severity="error">{enrollmentError}</Alert>
      }
    </Box>
  );
};

export default CourseDetail;

import { useState, useEffect } from 'react';
import { Box, Typography, Alert, CircularProgress } from '@mui/material';
import axios from 'axios';

const CourseDetail = ({ course, initialEnrollmentStatus }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(initialEnrollmentStatus);

  useEffect(() => {
    const fetchEnrollmentStatus = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`http://localhost:8000/api/courses/${course.id}/enrollment`);
        setIsEnrolled(res.data.isEnrolled);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (course.id) {
      fetchEnrollmentStatus();
    }
  }, [course.id]);


  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }
  
  if (!course) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Alert severity="error">Course not found.</Alert>
      </Box>
    );
  }
  
  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" sx={{ marginBottom: 2 }}>
        {course.title}
      </Typography>
      <Typography variant="subtitle1" sx={{ marginBottom: 2 }}>
        Taught by {course.instructor ? course.instructor.username : 'Unknown Instructor'}
      </Typography>
      <Typography variant="body1" sx={{ marginBottom: 2 }}>
        {course.description}
      </Typography>
      {!isEnrolled ? (
        <Box sx={{ marginTop: 2 }}>
          <EnrollButton courseId={course.id} />
        </Box>
      ) : (
        <Box sx={{ marginTop: 2 }}>
          <ModuleList courseId={course.id} />
          <ReviewList courseId={course.id} />
          <QuizList courseId={course.id} />
          <ForumList courseId={course.id} />
          <ResourceList courseId={course.id} />
        </Box>
      )}
    </Box>
  );
};

export async function getServerSideProps(context) {
  const { courseId } = context.params;
  const res = await axios.get(`http://localhost:8000/api/courses/${courseId}`);
  const course = res.data;

  const isEnrolled = false;

  return {
    props: {
      course,
      initialEnrollmentStatus: isEnrolled,
    },
  };
};

export default CourseDetail;

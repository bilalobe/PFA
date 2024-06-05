import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCourseDetails } from '../../actions/courseActions';
import { enrollInCourse, fetchUnenroll } from '../../actions/enrollmentActions';
import { Typography, Box, CircularProgress, Alert } from '@mui/material';
import ModuleList from '../../components/Modules/ModuleList';
import ReviewList from '../../components/Review/ReviewList';
import QuizList from '../../components/Quizzes/QuizList'; 
import ForumList from '../../components/Forum/ForumList'; 
import ResourceList from '../../components/Resources/ResourceList';
import EnrollButton from '../../components/Courses/EnrollButton';

function CourseDetails() {
  const router = useRouter();
  const { courseId } = router.query;
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const { currentCourse: course, loading, error } = useSelector((state) => state.course);
  const { enrollments } = useSelector((state) => state.enrollment);

  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    if (courseId) {
      dispatch(fetchCourseDetails(courseId));
    }
  }, [courseId, dispatch]); 

  useEffect(() => {
    if (user) {
      dispatch(fetchUnenroll(user.id));
    }
  }, [user, dispatch]);

  // Check if the user is enrolled in the current course
  useEffect(() => {
    if (enrollments && course) {
      const isUserEnrolled = enrollments.some(enrollment => enrollment.course.id === course.id);
      setIsEnrolled(isUserEnrolled);
    }
    enrollInCourse(courseId, user.id);
  }, [enrollments, course]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 1 }}>
        <CircularProgress />
        <Typography variant="h6">Loading course details...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">{error}</Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h4">{course.title}</Typography>
                <Typography variant="subtitle1">
                    Taught by {course.instructor ? course.instructor.username : 'Unknown Instructor'}
                </Typography>
                <Typography variant="body1">{course.description}</Typography>
                {!isEnrolled && (
                    <Box>
                        <EnrollButton courseId={course.id} />
                    </Box>
                )}
                {isEnrolled && (
                    <Box>
                        <ModuleList courseId={course.id} />
                        <ReviewList courseId={course.id} />
                        <QuizList courseId={course.id} />
                        <ForumList courseId={course.id} />
                        <ResourceList courseId={course.id} />
                    </Box>
                )}
            </Box>
        );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!course) {
    return <Alert severity="error">Course not found.</Alert>;
    }

    return ( 
        <Box>
            <Typography variant="h4">{course.title}</Typography>
            <Typography variant="subtitle1">
                Taught by {course.instructor ? course.instructor.username : 'Unknown Instructor'}
            </Typography>
            <Typography variant="body1">{course.description}</Typography>
            {!isEnrolled && (
                <Box>
                    <EnrollButton courseId={course.id} />
                </Box>
            )}
            {isEnrolled && (
                <Box>
                    <ModuleList courseId={course.id} />
                    <ReviewList courseId={course.id} />
                    <QuizList courseId={course.id} />
                    <ForumList courseId={course.id} />
                    <ResourceList courseId={course.id} />
                </Box>
            )}
        </Box>
    );


export async function getServerSideProps(context) {
  try {
    const { courseId } = context.params; 
    const response = await fetch(`http://your-django-backend/api/courses/${courseId}/`); // Update with your API URL
    const courseData = await response.json();

    return {
      props: { course: courseData },
    };
  } catch (error) {
    return {
      props: { error: 'Failed to fetch course details.' },
    };
  }
}

export default CourseDetails;
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCourse } from '../../actions/courseActions';
import { Box, Typography } from '@mui/material';
import CustomCard from '../Common/CustomCard';
import Loader from '../Common/Loader';
import ModuleList from '../Modules/ModuleList'; 
import ReviewList from '../Reviews/ReviewList';
import Alert from '@mui/material/Alert';

function CourseDetails({ match }) {
  const { courseId } = match.params;
  const dispatch = useDispatch();
  const course = useSelector(state => state.courses.course);
  const isLoading = useSelector(state => state.courses.isLoading);
  const error = useSelector(state => state.courses.error);

  useEffect(() => {
    dispatch(fetchCourse(courseId));
  }, [dispatch, courseId]);

  if (isLoading) return <Loader aria-label="Loading course details" />;
  if (error) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
      <Alert severity="error">
        An error occurred while fetching course details. Please try again later.
      </Alert>
    </Box>
  );

  return (
    <Box sx={{ mt: 2 }}>
      <CustomCard title={course.title} content={course.description} />
      <Typography variant="h6" sx={{ mt: 4 }}>Modules</Typography>
      <ModuleList courseId={courseId} />
      <Typography variant="h6" sx={{ mt: 4 }}>Reviews</Typography>
      <ReviewList courseId={courseId} />
    </Box>
  );
}

export default CourseDetails;

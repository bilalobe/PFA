import React from 'react';
import { Button } from '@mui/material';
import { useDispatch } from 'react-redux';
import { enrollInCourse } from '../../actions/enrollmentActions';

function EnrollButton({ courseId }) {
  const dispatch = useDispatch();

  const handleEnroll = () => {
    dispatch(enrollInCourse(courseId));
  };

  return (
    <Button variant="contained" color="primary" onClick={handleEnroll}>
      Enroll in this course
    </Button>
  );
}

export default EnrollButton;

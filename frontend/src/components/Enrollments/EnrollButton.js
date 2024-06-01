import React, { useState } from 'react';
import { Button, Snackbar, Alert } from '@mui/material';
import { useDispatch } from 'react-redux';
import { enrollInCourse } from '../../actions/enrollmentActions';

function EnrollButton({ courseId, courseTitle }) {
  const dispatch = useDispatch();
  const [enrollmentError, setEnrollmentError] = useState(null);
  const [enrollmentSuccess, setEnrollmentSuccess] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleEnroll = () => {
    dispatch(enrollInCourse(courseId))
      .then(() => {
        setEnrollmentError(null);
        setEnrollmentSuccess(true);
        setOpenSnackbar(true);
      })
      .catch((error) => {
        const errorMsg = error.response?.data?.detail || 'Failed to enroll in the course. Please try again.';
        const errorCode = error.response?.status ? `Error Code: ${error.response.status}` : '';
        setEnrollmentError(`${errorMsg} ${errorCode}`);
        setEnrollmentSuccess(false);
        setOpenSnackbar(true);
      });
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <div>
      <Button 
        variant="contained" 
        color={enrollmentSuccess ? 'success' : 'primary'} 
        onClick={handleEnroll} 
        disabled={enrollmentSuccess}
        aria-label={`Enroll in ${courseTitle}`}
      >
        {enrollmentSuccess ? 'Enrolled' : 'Enroll in this course'}
      </Button>

      {enrollmentError && (
        <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
          <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
            {enrollmentError}
          </Alert>
        </Snackbar>
      )}

      {enrollmentSuccess && (
        <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
          <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
            Successfully enrolled in the course: "{courseTitle}"!
          </Alert>
        </Snackbar>
      )}
    </div>
  );
}

export default EnrollButton;

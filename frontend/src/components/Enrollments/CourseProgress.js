import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateProgress } from '../../actions/enrollmentActions';
import { Typography, LinearProgress, Box, Button, Slider, CircularProgress, Alert, Snackbar } from '@mui/material';
import MuiAlert from '@mui/material/Alert';

const AlertComponent = React.forwardRef((props, ref) => {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function CourseProgress({ enrollment }) {
  const dispatch = useDispatch();
  const [newProgress, setNewProgress] = useState(enrollment.progress);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');

  const loading = useSelector(state => state.enrollment.loading);
  const error = useSelector(state => state.enrollment.error);

  const handleProgressUpdate = () => {
    dispatch(updateProgress(enrollment.id, newProgress))
      .then(() => {
        setSnackbarMessage('Progress updated successfully!');
        setSnackbarSeverity('success');
        setOpenSnackbar(true);
      })
      .catch((error) => {
        setSnackbarMessage(error.message || 'Failed to update progress. Please try again.');
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
      });
  };

  const handleSliderChange = (_event, newValue) => {
    setNewProgress(newValue);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Box>
      <Typography variant="h6" component="div" gutterBottom>
        {enrollment.course.title}
      </Typography>
      <LinearProgress variant="determinate" value={newProgress} />
      <Typography variant="body2" component="div" gutterBottom>
        Progress: {newProgress}%
      </Typography>
      {!loading && (
        <Slider
          value={newProgress}
          onChange={handleSliderChange}
          aria-labelledby="progress-slider"
          valueLabelDisplay="auto"
          min={0}
          max={100}
        />
      )}
      <Button 
        variant="contained" 
        color="primary" 
        onClick={handleProgressUpdate} 
        disabled={loading}
        sx={{ mt: 2 }}
      >
        Update Progress
      </Button>
      {loading && <CircularProgress sx={{ mt: 2 }} />}
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <AlertComponent onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </AlertComponent>
      </Snackbar>
    </Box>
  );
}

export default CourseProgress;

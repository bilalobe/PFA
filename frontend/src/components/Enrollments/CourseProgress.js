import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateProgress } from '../../actions/enrollmentActions'; 
import { Typography, LinearProgress, Box, Button, Slider, CircularProgress, Alert } from '@mui/material';

function CourseProgress({ enrollment }) {
  const dispatch = useDispatch();
  const [newProgress, setNewProgress] = useState(enrollment.progress);
  const loading = useSelector(state => state.enrollment.loading);
  const error = useSelector(state => state.enrollment.error);

  const handleProgressUpdate = () => {
    dispatch(updateProgress(enrollment.id, newProgress));
  };

  const handleSliderChange = (_event, newValue) => {
    setNewProgress(newValue);
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
    </Box>
  );
}

export default CourseProgress;

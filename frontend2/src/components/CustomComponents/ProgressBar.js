import React from 'react';
import PropTypes from 'prop-types';
import { Box, LinearProgress, Typography } from '@mui/material';

function CustomProgressBar({ 
  currentQuestionIndex = 0, 
  totalQuestions = 1, 
  color = 'primary', 
  variant = 'determinate', 
  bufferValue = 80 
}) {
  let progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;
  progress = Math.min(progress, 100); // Ensure progress does not exceed 100%

  return (
    <Box sx={{ width: '100%', mt: 2 }}>
      <Box display="flex" justifyContent="space-between">
        <Typography variant="body2" color="textSecondary">Question {currentQuestionIndex + 1} of {totalQuestions}</Typography>
        <Typography variant="body2" color="textSecondary">{Math.round(progress)}%</Typography>
      </Box>
      <LinearProgress
        variant={variant}
        value={progress}
        color={color}
        valueBuffer={variant === 'buffer' ? bufferValue : undefined}
        aria-label={`Quiz Progress: ${Math.round(progress)}%`}
      />
    </Box>
  );
}

CustomProgressBar.propTypes = {
  currentQuestionIndex: PropTypes.number,
  totalQuestions: PropTypes.number.isRequired,
  color: PropTypes.string,
  variant: PropTypes.string,
  bufferValue: PropTypes.number,
};

export default CustomProgressBar;
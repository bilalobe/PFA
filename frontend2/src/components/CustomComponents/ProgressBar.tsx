import React, { FC } from 'react';
import { Box, LinearProgress, Typography } from '@mui/material';

interface CustomProgressBarProps {
  currentQuestionIndex?: number;
  totalQuestions: number;
  color?: 'primary' | 'secondary';
  variant?: 'determinate' | 'indeterminate' | 'buffer' | 'query';
  bufferValue?: number;
}

const CustomProgressBar: FC<CustomProgressBarProps> = ({ 
  currentQuestionIndex = 0, 
  totalQuestions, 
  color = 'primary', 
  variant = 'determinate', 
  bufferValue = 80 
}) => {
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

export default CustomProgressBar;
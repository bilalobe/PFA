import React from 'react';
import { LinearProgress, Box, Typography } from '@mui/material';

function ProgressBar({ currentQuestionIndex, totalQuestions }) {
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  return (
    <Box sx={{ my: 2 }}>
      <Typography
        variant="body1"
        component="div"
        sx={{ fontWeight: 'bold', mb: 1 }}
      >
        Progress: {currentQuestionIndex + 1} / {totalQuestions}
      </Typography>
      <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            width: '100%',
            height: 10,
            borderRadius: 5,
            backgroundColor: '#e0e0e0',
            '& .MuiLinearProgress-bar': {
              backgroundColor: '#3f51b5'
            },
            animation: 'pulse 2s infinite'
          }}
          aria-label="Quiz progress"
        />
        <Typography
          variant="body2"
          color="textSecondary"
          sx={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', fontWeight: 'bold' }}
        >
          {progress.toFixed(1)}%
        </Typography>
      </Box>
      <style>
        {`
          @keyframes pulse {
            0% {
              opacity: 1;
            }
            50% {
              opacity: 0.7;
            }
            100% {
              opacity: 1;
            }
          }
        `}
      </style>
    </Box>
  );
}

export default ProgressBar;

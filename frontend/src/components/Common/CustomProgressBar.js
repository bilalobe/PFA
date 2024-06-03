import React from 'react';
import { LinearProgress, Box, Typography, useTheme } from '@mui/material';

function CustomProgressBar({ value, label, showPercentage = true }) {
  const theme = useTheme();
  const progressText = showPercentage 
    ? `${value.toFixed(1)}%`
    : 'Loading...';

  return (
    <Box sx={{ my: 2 }}>
      {label && (
        <Typography
          variant="body1"
          component="div"
          sx={{ fontWeight: 'bold', mb: 1, color: theme.palette.text.primary }}
          aria-label="progress bar label"
        >
          {label}
        </Typography>
      )}
      <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <LinearProgress
          variant={showPercentage ? "determinate" : "indeterminate"}
          value={showPercentage ? value : undefined}
          sx={{
            width: '100%',
            height: 10,
            borderRadius: 5,
            backgroundColor: theme.palette.grey[300],
            '& .MuiLinearProgress-bar': {
              backgroundColor: theme.palette.primary.main
            },
            animation: 'smooth-transition 2s infinite'
          }}
          aria-label={showPercentage ? `Progress: ${progressText}` : "Loading"}
        />
        {showPercentage && (
          <Typography
            variant="body2"
            color="textSecondary"
            sx={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', fontWeight: 'bold' }}
            aria-label="progress percentage"
          >
            {progressText}
          </Typography>
        )}
      </Box>
      <style>
        {`
          @keyframes smooth-transition {
            0% {
              opacity: 1;
            }
            50% {
              opacity: 0.9;
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

export default CustomProgressBar;

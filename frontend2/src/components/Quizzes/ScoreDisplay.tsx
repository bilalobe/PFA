import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Typography, Box, CircularProgress } from '@mui/material';

interface ScoreDisplayProps {
  quizId: string;
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ quizId }) => {
  const { score, loading } = useSelector((state: RootState) => state.quiz);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
      <Typography variant="h4" gutterBottom>
        Your Score: {score} / {quizId ? quizId.length : 0}
      </Typography>
    </Box>
  );
}
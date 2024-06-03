import React from 'react';
import { Grid, Typography, Card, CardContent, CardMedia, CircularProgress, Box, Badge } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import CustomButton from './CustomButton'; // Adjust the import path as needed
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';

function QuizCard({ quiz, loading, error }) {
  const { isAuthenticated } = useAuth();

  const placeholderImage = 'path/to/placeholder.jpg'; // Replace with your placeholder image path

  const difficultyColors = {
    Easy: '#4caf50', // Green, adjusted for better contrast
    Medium: '#ff9800', // Orange, adjusted for better contrast
    Hard: '#f44336', // Red, adjusted for better contrast
  };

  if (loading) {
    return (
      <Grid item xs={12} sm={6} md={4} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress size={50} />
      </Grid>
    );
  }

  if (error) {
    const errorMessage = error.response?.status === 404 ? 'Quiz not found' : 
                         error.response?.status === 401 ? 'Unauthorized access' : 
                         error.response?.status === 500 ? 'Server error' : 'Error loading quiz data';

    return (
      <Grid item xs={12} sm={6} md={4}>
        <Card sx={{ maxWidth: 345, boxShadow: 4, borderRadius: 1, backgroundColor: '#ffe6e6', p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <WarningIcon fontSize="large" color="error" aria-label="Error Icon" />
          <Typography variant="h6" align="center" color="error" sx={{ mt: 1 }} aria-label="Error Message">
            {errorMessage}
          </Typography>
        </Card>
      </Grid>
    );
  }

  return (
    <Grid item xs={12} sm={6} md={4}>
      <Card sx={{ maxWidth: 345, boxShadow: 6, borderRadius: 2, background: 'linear-gradient(to right, #fff, #f8f9fa)' }}>
        <CardMedia
          component="img"
          alt={quiz.title}
          height="140"
          image={quiz.image || placeholderImage}
        />
        <CardContent>
          <Typography gutterBottom variant="h5" component="div" fontWeight="bold">
            {quiz.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {quiz.description}
          </Typography>
          <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
            <Badge
              color="primary"
              badgeContent={quiz.difficulty}
              sx={{ backgroundColor: difficultyColors[quiz.difficulty], borderRadius: 1, px: 1, py: 0.5 }}
              aria-label={`Difficulty level ${quiz.difficulty}`}
            />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              Difficulty
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Number of Questions: {quiz.numQuestions}
          </Typography>
          {quiz.timeLimit && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Time Limit: {quiz.timeLimit} mins
            </Typography>
          )}
        </CardContent>
        <Box sx={{ display: 'flex', gap: 1, p: 2 }}>
          {isAuthenticated ? (
            <CustomButton
              component={RouterLink}
              to={`/quizzes/${quiz.id}`}
              aria-label="Start Quiz"
              fullWidth
              sx={{
                mb: 1,
                bgcolor: 'primary.main',
                color: 'white',
                boxShadow: 2,
                '&:hover': {
                  bgcolor: 'primary.dark',
                  boxShadow: 4,
                },
              }}
            >
              Start Quiz
            </CustomButton>
          ) : (
            <CustomButton
              component={RouterLink}
              to="/login"
              aria-label="Login to Start Quiz"
              fullWidth
              sx={{
                mb: 1,
                bgcolor: 'primary.main',
                color: 'white',
                boxShadow: 2,
                '&:hover': {
                  bgcolor: 'primary.dark',
                  boxShadow: 4,
                },
              }}
            >
              Login to Start Quiz
            </CustomButton>
          )}
          <CustomButton
            component={RouterLink}
            to={`/quizzes/${quiz.id}/details`}
            aria-label="View Quiz Details"
            variant="outlined"
            fullWidth
            sx={{ '&:hover': { bgcolor: 'action.hover' }}}
          >
            View Details
          </CustomButton>
        </Box>
      </Card>
    </Grid>
  );
}

export default QuizCard;

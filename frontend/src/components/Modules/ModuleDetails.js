import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchModuleDetails } from '../../actions/moduleActions';
import { useParams } from 'react-router-dom';
import { Typography, CircularProgress, Box, Alert } from '@mui/material';

function ModuleDetails() {
  const dispatch = useDispatch();
  const { id } = useParams();
  const module = useSelector((state) => state.module.selectedModule);
  const isLoading = useSelector((state) => state.module.isLoading);
  const error = useSelector((state) => state.module.error);

  useEffect(() => {
    dispatch(fetchModuleDetails(id));
  }, [dispatch, id]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh" aria-label="Loading module details">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    const errorMessage = error.includes('Network Error') 
      ? 'Network error, please check your internet connection.' 
      : 'Could not fetch module details';
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh" aria-label="Error message">
        <Alert severity="error">{errorMessage}</Alert>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom aria-label="Module Title">
        {module.title}
      </Typography>
      <Typography variant="body1" gutterBottom aria-label="Module Description">
        {module.description}
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom aria-label="Module Duration">
        Duration: {module.duration} minutes
      </Typography>
      {module.type === 'video' && (
        <Typography variant="body2" color="text.secondary" gutterBottom aria-label="Module Type">
          This module contains video content.
        </Typography>
      )}
      {module.type === 'quiz' && (
        <Typography variant="body2" color="text.secondary" gutterBottom aria-label="Module Type">
          This module contains a quiz.
        </Typography>
      )}
      {module.resources && module.resources.length > 0 && (
        <Box mt={2}>
          <Typography variant="h6" aria-label="Resources">Resources</Typography>
          <ul>
            {module.resources.map((resource, index) => (
              <li key={index}>
                <Typography variant="body2" color="text.secondary" aria-label={`Resource ${index + 1}`}>
                  {resource}
                </Typography>
              </li>
            ))}
          </ul>
        </Box>
      )}
      {module.quizzes && module.quizzes.length > 0 && (
        <Box mt={2}>
          <Typography variant="h6" aria-label="Quizzes">Quizzes</Typography>
          <ul>
            {module.quizzes.map((quiz, index) => (
              <li key={index}>
                <Typography variant="body2" color="text.secondary" aria-label={`Quiz ${index + 1}`}>
                  {quiz}
                </Typography>
              </li>
            ))}
          </ul>
        </Box>
      )}
    </Box>
  );
}

export default ModuleDetails;
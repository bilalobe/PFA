import React from 'react';
import axios from 'axios';
import { useQuery } from 'react-query';
import { List, ListItem, ListItemText, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';

function RecommendationList() {
  const { enqueueSnackbar } = useSnackbar();

  // Enhanced error handling with axios interceptors
  axios.interceptors.response.use(response => response, error => {
    // Handle different types of errors here (e.g., network error, server error)
    if (!error.response) {
      // Network error
      enqueueSnackbar('Network error, please check your connection.', { variant: 'error' });
    } else {
      // Server or other errors
      enqueueSnackbar(`Error: ${error.response.status} ${error.response.statusText}`, { variant: 'error' });
    }
    return Promise.reject(error);
  });

  const fetchRecommendations = async () => {
    const response = await axios.get('/api/recommendations/');
    return response.data;
  };

  const { data: recommendations, isLoading, error } = useQuery('recommendations', fetchRecommendations, {

    retry: 2, // Example: retry twice before throwing an error
    onError: (err: Error) => {
      // Handle errors specifically from the useQuery hook
      enqueueSnackbar(`Error fetching recommendations: ${err.message}`, { variant: 'error' });
    }
  });

  if (isLoading) {
    return <Typography>Loading recommendations...</Typography>;
  }

  if (error) {
    // Error handling is now more comprehensive due to axios interceptors and notistack
    return <Typography color="error">An error occurred. Please try again later.</Typography>;
  }

  return (
    <List>
      {recommendations && recommendations.length > 0 ? (
        recommendations.map((course, index) => (
          <ListItem key={index}>
            <ListItemText primary={course.title} secondary={course.description} />
          </ListItem>
        ))
      ) : (
        <Typography>No recommendations available.</Typography>
      )}
    </List>
  );
}

export default RecommendationList;
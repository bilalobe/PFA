import React from 'react';
import axios from 'axios';
import { useQuery } from 'react-query';
import { List, ListItem, ListItemText, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';

function RecommendationList() {
  const { enqueueSnackbar } = useSnackbar();

  axios.interceptors.response.use(
    response => response,
    error => {
      if (!error.response) {
        enqueueSnackbar('Network error, please check your connection.', { variant: 'error' });
      } else {
        enqueueSnackbar(`Error: ${error.response.status} ${error.response.statusText}`, { variant: 'error' });
      }
      return Promise.reject(error);
    }
  );

  const fetchRecommendations = async () => {
    const response = await axios.get('/api/recommendations/');
    return response.data;
  };

  const { data: recommendations, isLoading, error } = useQuery('recommendations', fetchRecommendations, {
    retry: 2,
    onError: (err: any) => {
      enqueueSnackbar(`Error fetching recommendations: ${err.message}`, { variant: 'error' });
    }
  });

  if (isLoading) {
    return <Typography>Loading recommendations...</Typography>;
  }

  if (error) {
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

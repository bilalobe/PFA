import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { List, ListItem, ListItemText, Typography } from '@mui/material';

function RecommendationList() {
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('/api/recommendations/');
        setRecommendations(response.data);
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  if (isLoading) {
    return <Typography>Loading recommendations...</Typography>;
  }

  if (error) {
    return <Typography color="error">Error: {error}</Typography>;
  }

  return (
    <List>
      {recommendations.length > 0 ? (
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

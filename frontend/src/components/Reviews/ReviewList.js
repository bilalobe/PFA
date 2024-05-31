import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { List, ListItem, ListItemText, Typography, Rating, CircularProgress, Alert } from '@mui/material';

function ReviewList({ courseId }) {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`/api/courses/${courseId}/reviews/`);
        setReviews(response.data);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [courseId]);

  if (isLoading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error.message || 'An error occurred while fetching reviews.'}</Alert>;
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h5" component="div" gutterBottom>
        Reviews
      </Typography>
      {reviews.length > 0 ? (
        <List>
          {reviews.map((review) => (
            <ListItem key={review.id} alignItems="flex-start">
              <ListItemText
                primary={`${review.user} - ${new Date(review.created_at).toLocaleDateString()}`}
                secondary={
                  <>
                    <Rating value={review.rating} readOnly />
                    <Typography component="span">{review.comment}</Typography>
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      ) : (
        <Alert severity="info">No reviews yet. Be the first one to leave a review!</Alert>
      )}
    </Box>
  );
}

export default ReviewList;

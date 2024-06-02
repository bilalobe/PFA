import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchReviews } from '../../actions/reviewActions';
import { List, Box, Typography, CircularProgress, Alert } from '@mui/material';
import ReviewCard from './ReviewCard';

function ReviewList({ courseId }) {
  const dispatch = useDispatch();
  const { reviews, isLoading, error } = useSelector((state) => state.reviews);

  useEffect(() => {
    dispatch(fetchReviews(courseId));
  }, [dispatch, courseId]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh" aria-label="Loading reviews">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh" aria-label="Error loading reviews">
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h5" component="div" gutterBottom>
        Reviews
      </Typography>
      {reviews.length > 0 ? (
        <List>
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </List>
      ) : (
        <Alert severity="info">No reviews yet. Be the first one to leave a review!</Alert>
      )}
    </Box>
  );
}

export default ReviewList;

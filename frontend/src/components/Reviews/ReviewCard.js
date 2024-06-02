import React from 'react';
import { Card, CardContent, Typography, Rating, Box } from '@mui/material';

function ReviewCard({ review }) {
  return (
    <Card
      sx={{
        boxShadow: 3,
        borderRadius: 2,
        '&:hover': { 
          boxShadow: 6,
          backgroundColor: '#f0f0f0',
        },
        outline: 'none',
        '&:focus-within': {
          outline: '3px solid #007bff',
          boxShadow: '0 0 5px #007bff',
        },
        mb: 2,
      }}
      aria-label={`Review card for ${review.user}`}
      tabIndex={0}
    >
      <CardContent>
        <Typography variant="h6" gutterBottom aria-label="Review User">
          {review.user}
        </Typography>
        <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
          <Rating value={review.rating} readOnly aria-label="Review Rating" />
          <Typography variant="body2" color="text.secondary" aria-label="Review Date">
            {new Date(review.created_at).toLocaleDateString()}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" aria-label="Review Comment" mt={2}>
          {review.comment}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default ReviewCard;

import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, Alert } from '@mui/material';
import { Timestamp } from 'firebase/firestore';
import { useAuth } from '../../hooks/useAuth';
import Rating from './Rating';
import RichTextEditor from './RichTextEditor';

interface ReviewFormProps {
  courseId: string;
  onSubmit: (review: {
    courseId: string;
    userId: string;
    rating: number;
    title: string;
    content: string;
  }) => Promise<void>;
  initialRating?: number;
  initialTitle?: string;
  initialContent?: string;
  buttonText?: string;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  courseId,
  onSubmit,
  initialRating = 0,
  initialTitle = '',
  initialContent = '',
  buttonText = 'Submit Review'
}) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(initialRating);
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate user is logged in
    if (!user) {
      setError('You must be logged in to submit a review.');
      return;
    }
    
    // Validate rating
    if (rating === 0) {
      setError('Please provide a rating.');
      return;
    }
    
    // Validate content
    if (!content || content === '<p></p>') {
      setError('Please provide review content.');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      await onSubmit({
        courseId,
        userId: user.uid,
        rating,
        title,
        content
      });
      
      // Reset form on success
      setRating(0);
      setTitle('');
      setContent('');
      setSuccess('Your review was submitted successfully!');
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 5000);
    } catch (err) {
      console.error('Error submitting review:', err);
      setError('An error occurred while submitting your review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Write a Review
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}
      
      <form onSubmit={handleSubmit}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" gutterBottom>
            Overall Rating
          </Typography>
          <Rating 
            value={rating} 
            onChange={setRating} 
            size="large"
            precision={1}
          />
        </Box>
        
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="Review Title (Optional)"
            variant="outlined"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Summarize your experience or highlight main points"
            inputProps={{ maxLength: 100 }}
          />
        </Box>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" gutterBottom>
            Your Review
          </Typography>
          <RichTextEditor 
            content={content}
            onChange={setContent}
            placeholder="What did you like or dislike? What was your experience with this course?"
            minHeight="200px"
          />
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            type="submit"
            variant="contained"
            color="primary"
            disabled={isSubmitting || !user}
          >
            {buttonText}
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

export default ReviewForm;
import React, { useState } from 'react';
import { Box, Typography, Button, Rating, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfig';

interface SessionFeedbackProps {
  sessionId: string;
  open: boolean;
  onClose: () => void;
}

const SessionFeedback: React.FC<SessionFeedbackProps> = ({ sessionId, open, onClose }) => {
  const [rating, setRating] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'sessionFeedback'), {
        sessionId,
        rating,
        feedback,
        submittedAt: serverTimestamp(),
        userId: auth.currentUser?.uid
      });
      onClose();
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Session Feedback</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <Typography>How would you rate this session?</Typography>
          <Rating
            name="session-rating"
            value={rating}
            onChange={(_, newValue) => setRating(newValue || 0)}
            size="large"
            precision={0.5}
          />
          
          <TextField
            label="Additional Comments (Optional)"
            multiline
            rows={4}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            fullWidth
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={rating === 0 || submitting}
        >
          Submit Feedback
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SessionFeedback;
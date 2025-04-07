import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Rating,
  Typography,
  Box,
  FormControlLabel,
  Checkbox,
  CircularProgress
} from '@mui/material';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useAuth } from '../../hooks/useAuth';

interface SessionFeedbackDialogProps {
  open: boolean;
  onClose: () => void;
  sessionId: string;
  courseId: string;
  sessionTitle: string;
}

const SessionFeedbackDialog: React.FC<SessionFeedbackDialogProps> = ({ 
  open, 
  onClose, 
  sessionId, 
  courseId,
  sessionTitle
}) => {
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [shareWithInstructor, setShareWithInstructor] = useState(true);
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (!user) return;
    
    try {
      setSubmitting(true);
      
      await addDoc(collection(db, 'sessionFeedback'), {
        sessionId,
        courseId,
        userId: user.uid,
        displayName: user.displayName || 'Anonymous',
        rating,
        comment,
        shareWithInstructor,
        createdAt: serverTimestamp()
      });
      
      onClose();
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Session Feedback</DialogTitle>
      <DialogContent>
        <Box sx={{ my: 2 }}>
          <Typography variant="body1" gutterBottom>
            How would you rate this session: <strong>{sessionTitle}</strong>?
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Rating
              value={rating}
              onChange={(_, newValue) => setRating(newValue)}
              size="large"
              precision={0.5}
            />
            <Typography sx={{ ml: 1 }} variant="body2" color="text.secondary">
              {rating ? `${rating}/5` : 'Select rating'}
            </Typography>
          </Box>
          
          <TextField
            label="Share your thoughts about this session"
            multiline
            rows={4}
            fullWidth
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="What did you learn? What could be improved?"
          />
          
          <FormControlLabel
            control={
              <Checkbox 
                checked={shareWithInstructor}
                onChange={(e) => setShareWithInstructor(e.target.checked)}
              />
            }
            label="Share this feedback with the instructor"
            sx={{ mt: 2 }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={rating === null || submitting}
        >
          {submitting ? <CircularProgress size={24} /> : 'Submit Feedback'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SessionFeedbackDialog;
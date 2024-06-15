import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { submitAnswer } from '../../redux/actions/quizActions';
import { useRouter } from 'next/router';
import { Button, Typography, Box, CircularProgress, Alert } from '@mui/material';

interface SubmitAndReviewProps {
  quizId: string;
  selectedAnswers: any[]; // Replace 'any' with the actual type of the selected answers
}

const SubmitAndReview: React.FC<SubmitAndReviewProps> = ({ quizId, selectedAnswers }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const score = useSelector((state: any) => state.quiz.score); // Replace 'any' with the actual type of the state
  const submitSuccess = useSelector((state: any) => state.quiz.submitSuccess); // Replace 'any' with the actual type of the state

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmissionError(null);
    try {
      const attemptData = await dispatch(submitQuizAnswers({ attemptId: quizId, answers: selectedAnswers })).unwrap();
      // After successful submission, show the results
      setShowResults(true);
    } catch (error) {
      setSubmissionError(error.message || 'An error occurred while submitting the quiz.');
    }
  };

    const handleReview = () => {
        // Logic to redirect to a review page or component
        router.push(`/quizzes/${quizId}/review`); // Example route
    };

    return (
        <Box>
            <Button variant="contained" color="primary" onClick={handleSubmit}>

            {showResults && (
                <Box>
                    <Typography variant="h6">Your Score: {score}</Typography>
                    <Button variant="contained" color="secondary" onclick={handleReview}>
                        Review Answers
                    </Button>
                </Box>
            )}
            </Button>
        </Box>
    );
}

export default SubmitAndReview;


function submitQuizAnswers(arg0: { attemptId: string; answers: any[]; }): any {
  throw new Error('Function not implemented.');
}

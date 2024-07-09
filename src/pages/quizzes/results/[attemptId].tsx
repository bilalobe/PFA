import { useRouter } from 'next/router';
import { useFirestoreDocument } from '../../../hooks/useFirestore';
import { useAuth } from '../../../hooks/useAuth';
import { QuizAttempt, QuizQuestion } from '../../../interfaces/types';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Button
} from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material'; // Import icons
import { useFirestoreCollectionData } from 'hooks/useFirestore';
import { DocumentData, orderBy, Query } from 'firebase/firestore';
import React from 'react';

const QuizResults = () => {
  const router = useRouter();
  const { attemptId } = router.query;
  const { user } = useAuth();

  // Fetch quiz attempt data from Firestore
  const { docData: attempt, loading: attemptLoading, error: attemptError } =
    useFirestoreDocument<QuizAttempt>(`quizAttempts/${attemptId}`);

  // Fetch quiz questions
  const { data: questions, loading: questionsLoading, error: questionsError } = useFirestoreCollectionData<QuizQuestion>(
    `quizzes/${attempt?.quizId}/questions`,
    (collectionRef: Query<DocumentData, DocumentData>) => collectionRef.orderBy('order', 'asc')
  );

  if (attemptLoading || questionsLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (attemptError || questionsError) {
    // ... handle errors with a user-friendly message  ...
    return (
      <Alert severity="error">
        {attemptError || questionsError}
      </Alert>
    );
  }

  if (!attempt || !questions) {
    return <Alert severity="error">Quiz attempt not found.</Alert>;
  }

  // Ensure the attempt belongs to the current user before displaying results
  if (attempt.userId !== user?.uid) {
    // Handle unauthorized access (redirect or display error message)
    return <Alert severity="error">You are not authorized to view this attempt.</Alert>;
  }

  // Function to check if the answer is correct
  const isAnswerCorrect = (questionId: string, selectedAnswer: string) => {
    const question = questions.find((q) => q.id === questionId);
    return question && question.correctAnswer === selectedAnswer;
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Quiz Results
      </Typography>

      <Typography variant="h6" gutterBottom>
        Your Score: {attempt.score} / {questions.length}
      </Typography>

      <List>
        {questions.map((question) => (
          <ListItem key={question.id}>
            <ListItemText primary={question.text} />
            <ListItemSecondaryAction>
              {attempt.answers[question.id] && (
                <Chip
                  icon={isAnswerCorrect(question.id, attempt.answers[question.id]) ? <CheckCircle /> : <Cancel />}
                  label={isAnswerCorrect(question.id, attempt.answers[question.id]) ? 'Correct' : 'Incorrect'}
                  color={isAnswerCorrect(question.id, attempt.answers[question.id]) ? 'success' : 'error'}
                />
              )}
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      <Button variant="contained" onClick={() => router.push('/courses')}>
        Back to Courses
      </Button>
    </Box>
  );
};

export default QuizResults;

import React, { useState } from 'react';
import {
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Typography,
  Alert,
  Box,
  CircularProgress
} from '@mui/material';
import { QuizQuestion, QuizAnswerChoice } from '../../interfaces/types';
import { useFirestoreCollectionData } from '../../hooks/useFirestore';
import { DocumentData, Query } from '@firebase/firestore';

interface QuestionProps {
  question: QuizQuestion;
  onAnswerSelect: (questionId: string, answerId: string) => void;
}

const Question = ({ question, onAnswerSelect }: QuestionProps) => {
  const [selectedAnswer, setSelectedAnswer] = useState('');

  const handleAnswerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const answerId = event.target.value;
    setSelectedAnswer(answerId);
    onAnswerSelect(question.id, answerId);
  };

  const { data: choices, loading, error } = useFirestoreCollectionData<QuizAnswerChoice>(
    `quizzes/${question.quizId}/questions/${question.id}/choices`,
    (collectionRef: Query<DocumentData>) => collectionRef.orderBy('order', 'asc') as Query<QuizAnswerChoice>
  );

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!choices || choices.length === 0) {
    return <Alert severity="error">No answer choices found for this question.</Alert>;
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        {question.text}
      </Typography>

      {question.question_type === 'multiple_choice' && (
        <FormControl>
          <FormLabel component="legend">Select your answer:</FormLabel>
          <RadioGroup
            aria-labelledby="demo-radio-buttons-group-label"
            name="radio-buttons-group"
            value={selectedAnswer}
            onChange={handleAnswerChange}
          >
            {choices.map((choice) => (
              <FormControlLabel
                key={choice.id}
                value={choice.id}
                control={<Radio />}
                label={choice.text}
              />
            ))}
          </RadioGroup>
        </FormControl>
      )}

      {/* Add logic for other question types as needed */}
    </Box>
  );
};

export default Question;
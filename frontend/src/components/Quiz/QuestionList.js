import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchQuestions } from '../../actions/questionActions'; 
import Question from './Question';
import { CircularProgress, Alert, Typography, Box } from '@mui/material';

function QuestionList({ quizId }) { 
  const dispatch = useDispatch();
  const questions = useSelector(state => state.question.questions);
  const loading = useSelector(state => state.question.loading);
  const error = useSelector(state => state.question.error);

  useEffect(() => {
    dispatch(fetchQuestions(quizId));
  }, [dispatch, quizId]);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Typography variant="h4" component="div" gutterBottom>
        Questions
      </Typography>

      {questions.map((question, index) => (
        <Question
          key={question.id}
          question={question}
          currentQuestionIndex={index}
          totalQuestions={questions.length}
        />
      ))}
    </Box>
  );
}

export default QuestionList;

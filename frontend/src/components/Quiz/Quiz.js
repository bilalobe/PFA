import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchQuiz } from '../../actions/quizActions'; 
import Question from './Question';
import { Typography, Button, Box, CircularProgress, Alert, Card, CardContent } from '@mui/material';

function Quiz({ quizId }) { 
  const dispatch = useDispatch();
  const quiz = useSelector(state => state.quiz.quiz); // Assuming quizReducer is set up
  const loading = useSelector(state => state.quiz.loading);
  const error = useSelector(state => state.quiz.error);

  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    dispatch(fetchQuiz(quizId));
  }, [dispatch, quizId]);

  useEffect(() => {
    if (quiz && quiz.timeLimit) {
      setTimer(quiz.timeLimit * 60);
      setIsActive(true);
    }
  }, [quiz]);

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        setTimer(timer => timer - 1);
      }, 1000);
    } 
    if (timer === 0) {
      setIsActive(false);
      // Handle quiz time up
      // E.g., submit the quiz automatically or show a message
    }
    return () => clearInterval(interval);
  }, [isActive, timer]);

  const handleAnswerSelection = (questionId, choiceId) => {
    setSelectedAnswers(prevSelectedAnswers => ({
      ...prevSelectedAnswers,
      [questionId]: choiceId
    }));
  };

  const handleSubmit = () => {
    // Handle quiz submission
    // E.g., dispatch an action to submit the quiz with selectedAnswers
    setIsActive(false);
    // Provide further implementation for form submission, score calculation, etc.
  };

  const handleNextQuestion = () => {
    setCurrentQuestionIndex(prevIndex => prevIndex + 1);
  };

  const handlePrevQuestion = () => {
    setCurrentQuestionIndex(prevIndex => prevIndex - 1);
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!quiz) return null;

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <Card sx={{ maxWidth: 800, margin: 'auto', mt: 4 }}>
      <CardContent>
        <Typography variant="h4" component="div" gutterBottom>
          {quiz.title}
        </Typography>
        <Typography variant="body1" component="div">
          Time Remaining: {Math.floor(timer / 60)}:{timer % 60 < 10 ? `0${timer % 60}` : timer % 60}
        </Typography>
        <Question 
          question={currentQuestion} 
          currentQuestionIndex={currentQuestionIndex}
          totalQuestions={quiz.questions.length}
          selectedAnswer={selectedAnswers[currentQuestion.id]}
          onAnswerSelect={handleAnswerSelection}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Button 
            variant="contained" 
            onClick={handlePrevQuestion} 
            disabled={currentQuestionIndex === 0}
          >
            Previous
          </Button>
          <Button 
            variant="contained" 
            onClick={handleNextQuestion} 
            disabled={currentQuestionIndex === quiz.questions.length - 1}
          >
            Next
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSubmit}
            disabled={currentQuestionIndex !== quiz.questions.length - 1}
          >
            Submit
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

export default Quiz;

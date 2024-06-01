import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchQuiz, submitQuiz } from '../../actions/quizActions';
import Question from './Question';
import {
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  LinearProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import CustomProgressBar from './CustomProgressBar';

function Quiz({ quizId }) {
  const dispatch = useDispatch();
  const quiz = useSelector(state => state.quiz.quiz);
  const loading = useSelector(state => state.quiz.loading);
  const error = useSelector(state => state.quiz.error);
  const submitError = useSelector(state => state.quiz.submitError);

  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [timeUpDialogOpen, setTimeUpDialogOpen] = useState(false);

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

    if (timer === 0 && isActive) {
      setIsActive(false);
      setTimeUpDialogOpen(true);
    }

    return () => clearInterval(interval);
  }, [isActive, timer]);

  const handleAnswerSelection = (questionId, choiceId) => {
    if (!quizCompleted) {
      setSelectedAnswers(prevSelectedAnswers => ({
        ...prevSelectedAnswers,
        [questionId]: choiceId
      }));
    }
  };

  const handleSubmit = () => {
    setIsActive(false);
    setQuizCompleted(true);
    setTimeUpDialogOpen(false);

    dispatch(submitQuiz(quizId, selectedAnswers))
      .then(response => {
        const detailedResults = response.data.detailedResults;
        console.log(detailedResults);
      })
      .catch(error => {
        console.error("Quiz submission error:", error);
      });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prevIndex => prevIndex - 1);
    }
  };

  const handleTimeUpDialogClose = () => {
    setTimeUpDialogOpen(false);
    handleSubmit();
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!quiz) return null;

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const selectedChoiceId = selectedAnswers[currentQuestion.id];
  const isAnswerSelected = selectedChoiceId !== undefined;
  const progress = (currentQuestionIndex / quiz.questions.length) * 100;

  return (
    <Card sx={{ maxWidth: 800, margin: 'auto', mt: 4 }}>
      <CardContent>
        <Typography variant="h4" component="div" gutterBottom>
          {quiz.title}
        </Typography>
        <CustomProgressBar value={progress} label={`Progress: ${currentQuestionIndex + 1} / ${quiz.questions.length}`} />
        <CustomProgressBar value={(timer / (quiz.timeLimit * 60)) * 100} showPercentage={false} label="Time Remaining" />
        <LinearProgress variant="determinate" value={progress} />
        {!quizCompleted ? (
          <>
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
                disabled={currentQuestionIndex === quiz.questions.length - 1 || quizCompleted}
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
          </>
        ) : (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom>
              Quiz Completed!
            </Typography>
            <Typography variant="body1">
              {/* Display the user's score and feedback */}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Thank you for taking the quiz.
            </Typography>
          </Box>
        )}

        <Dialog open={timeUpDialogOpen} onClose={handleTimeUpDialogClose}>
          <DialogTitle>Time's Up!</DialogTitle>
          <DialogContent>
            <DialogContentText>
              The time for the quiz has run out. The quiz will now be submitted automatically. Please wait while your answers are being submitted.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleTimeUpDialogClose} color="primary">
              OK
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
}

export default Quiz;

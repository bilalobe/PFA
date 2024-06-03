import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchQuestions, submitQuiz } from '../../actions/questionActions'; // Adjust to include submitQuiz
import QuizQuestion from './QuizQuestion';
import ProgressBar from './ProgressBar';
import { CircularProgress, Alert, Typography, Box, Pagination, Card, CardContent, Button } from '@mui/material';
import { useHistory } from 'react-router-dom'; // Import useHistory

function QuestionList({ quizId }) {
  const dispatch = useDispatch();
  const history = useHistory();
  const questions = useSelector(state => state.question.questions);
  const loading = useSelector(state => state.question.loading);
  const error = useSelector(state => state.question.error);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const handleAnswerSelect = (questionId, answer) => {
    setSelectedAnswers(prevAnswers => ({
      ...prevAnswers,
      [questionId]: Array.isArray(answer) ? [...answer] : answer,
    }));
  };

  useEffect(() => {
    dispatch(fetchQuestions(quizId));
  }, [dispatch, quizId]);

  const handleSubmit = async () => {
    await dispatch(submitQuiz(quizId, selectedAnswers));
    history.push('/quiz/results');
  };

  if (loading) return <CircularProgress aria-label="Loading questions" />;
  if (error) return <Alert severity="error" aria-label="Error loading questions">{error}</Alert>;

  const indexOfLastQuestion = currentPage * itemsPerPage;
  const indexOfFirstQuestion = indexOfLastQuestion - itemsPerPage;
  const currentQuestions = questions.slice(indexOfFirstQuestion, indexOfLastQuestion);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  return (
    <Card sx={{ maxWidth: 800, margin: 'auto', mt: 4, boxShadow: 4, borderRadius: 2 }}>
      <CardContent>
        <Typography variant="h4" component="div" gutterBottom tabIndex={0}>
          Questions
        </Typography>

        {currentQuestions.map((question, index) => (
          <QuizQuestion
            key={question.id}
            question={question}
            currentQuestionIndex={indexOfFirstQuestion + index}
            totalQuestions={questions.length}
            selectedAnswer={selectedAnswers[question.id]}
            onAnswerSelect={handleAnswerSelect}
          />
        ))}

        <ProgressBar 
          currentQuestionIndex={currentPage - 1} 
          totalQuestions={Math.ceil(questions.length / itemsPerPage)} 
        />
        
        <Pagination
          count={Math.ceil(questions.length / itemsPerPage)}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
          sx={{ mt: 4 }}
        />

        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          onClick={handleSubmit}
          aria-label="Submit quiz"
        >
          Submit
        </Button>
      </CardContent>
    </Card>
  );
}

export default QuestionList;

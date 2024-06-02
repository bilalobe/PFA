import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardMedia, Typography, Box, RadioGroup, Snackbar, Alert } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import QuizAnswerOption from './QuizAnswerOption'; // Ensure correct path

function QuizQuestion({ question, currentQuestionIndex, totalQuestions, selectedAnswer, onAnswerSelect }) {
  const [isAnswered, setIsAnswered] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const [showSnackbar, setShowSnackbar] = useState(false);

  useEffect(() => {
    if (isAnswered) {
      if (selectedAnswer === question.correctAnswer || 
          (Array.isArray(selectedAnswer) && JSON.stringify(selectedAnswer.sort()) === JSON.stringify(question.correctAnswer.sort()))) {
        setFeedbackMessage('Correct!');
      } else {
        const correctAnswer = typeof question.correctAnswer === 'string' ?
          question.correctAnswer :
          question.correctAnswer.join(', ');
        setFeedbackMessage(`Incorrect. The correct answer is: ${correctAnswer}`);
      }
      setShowSnackbar(true);
    }
  }, [isAnswered, selectedAnswer, question.correctAnswer]);

  const handleCloseSnackbar = () => {
    setShowSnackbar(false);
  };

  return (
    <Card 
      sx={{ 
        mb: 2,
        maxWidth: { xs: '100%', sm: '80%', md: '60%' },
        mx: 'auto',
        boxShadow: 4,
        borderRadius: 2
      }}
    >
      <CardContent>
        <Typography variant="h6" component="div" gutterBottom>
          Question {currentQuestionIndex + 1} of {totalQuestions}
        </Typography>

        {question.media && question.media_type === 'image' && (
          <CardMedia
            component="img"
            image={question.media}
            alt="Question media"
            sx={{ maxHeight: 300, backgroundSize: 'contain', mb: 2 }}
          />
        )}

        <Typography variant="body1" component="p" gutterBottom>
          {question.text}
        </Typography>

        {question.type === 'multiple_choice' || question.type === 'true_false' ? (
          <RadioGroup value={selectedAnswer} onChange={(e) => onAnswerSelect(question.id, e.target.value)}>
            {question.choices.map((choice) => (
              <QuizAnswerOption
                key={choice.id}
                type={question.type}
                choice={choice}
                selectedAnswer={selectedAnswer}
                onAnswerSelect={onAnswerSelect}
              />
            ))}
          </RadioGroup>
        ) : null}

        {question.type === 'multiple_selection' && (
          <Box>
            {question.choices.map((choice) => (
              <QuizAnswerOption
                key={choice.id}
                type={question.type}
                choice={choice}
                selectedAnswer={selectedAnswer}
                onAnswerSelect={onAnswerSelect}
              />
            ))}
          </Box>
        )}

        {question.type === 'fill_in_the_blank' && (
          <Box>
            {question.choices.map((choice) => (
              <QuizAnswerOption
                key={choice.id}
                type={question.type}
                choice={choice}
                selectedAnswer={selectedAnswer}
                onAnswerSelect={onAnswerSelect}
              />
            ))}
          </Box>
        )}

      </CardContent>
      <Snackbar 
        open={showSnackbar} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar} 
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={feedbackMessage === 'Correct!' ? 'success' : 'error'}
          variant="filled"
          iconMapping={{
            success: <CheckIcon fontSize="inherit" />,
            error: <CloseIcon fontSize="inherit" />
          }}
        >
          {feedbackMessage}
        </Alert>
      </Snackbar>
    </Card>
  );
}

export default QuizQuestion;

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardMedia, Typography, Box, RadioGroup, FormControlLabel, Radio, TextField, Checkbox, Snackbar, Alert } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

function QuestionCard({ question, currentQuestionIndex, totalQuestions, selectedAnswer, onAnswerSelect }) {
  const [isAnswered, setIsAnswered] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const [showSnackbar, setShowSnackbar] = useState(false);

  const handleChoiceChange = (e) => {
    const value = question.type === 'multiple_choice' || question.type === 'true_false' ? parseInt(e.target.value) : e.target.value;
    onAnswerSelect(question.id, value);
    setIsAnswered(true);
  };

  const handleCheckboxChange = (choiceId) => {
    const selected = selectedAnswer || [];
    if (selected.includes(choiceId)) {
      onAnswerSelect(question.id, selected.filter(id => id !== choiceId));
    } else {
      onAnswerSelect(question.id, [...selected, choiceId]);
    }
    setIsAnswered(true);
  };

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
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" component="div" gutterBottom>
          Question {currentQuestionIndex + 1} of {totalQuestions}
        </Typography>

        {question.media && question.media_type === 'image' && (
          <CardMedia
            component="img"
            image={question.media}
            alt="Question media"
            sx={{ maxHeight: 300, backgroundSize: 'contain', mb: 2}}
          />
        )}

        <Typography variant="body1" component="p" gutterBottom>
          {question.text}
        </Typography>

        {question.type === 'multiple_choice' && (
          <RadioGroup value={selectedAnswer} onChange={handleChoiceChange}>
            {question.choices.map((choice) => (
              <FormControlLabel
                key={choice.id}
                value={choice.id.toString()}
                control={<Radio />}
                label={choice.text}
                sx={{ backgroundColor: selectedAnswer === choice.id ? '#f0f0f0' : 'transparent', borderRadius: 1, p: 1, mb: 1 }}
              />
            ))}
          </RadioGroup>
        )}

        {question.type === 'true_false' && (
          <RadioGroup value={selectedAnswer} onChange={handleChoiceChange}>
            <FormControlLabel value="true" control={<Radio />} label="True" />
            <FormControlLabel value="false" control={<Radio />} label="False" />
          </RadioGroup>
        )}

        {question.type === 'fill_in_the_blank' && (
          <TextField
            fullWidth
            variant="outlined"
            value={selectedAnswer || ''}
            onChange={(e) => handleChoiceChange(e)}
            placeholder="Your answer"
          />
        )}

        {question.type === 'multiple_selection' && (
          <Box>
            {question.choices.map((choice) => (
              <FormControlLabel
                key={choice.id}
                control={
                  <Checkbox
                    checked={selectedAnswer ? selectedAnswer.includes(choice.id) : false}
                    onChange={() => handleCheckboxChange(choice.id)}
                  />
                }
                label={choice.text}
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

export default QuestionCard;

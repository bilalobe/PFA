import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardMedia, Typography, Box, RadioGroup, FormControlLabel, Radio, TextField, Checkbox, Snackbar } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

function Question({ question, currentQuestionIndex, totalQuestions, selectedAnswer, onAnswerSelect }) {
  const [isAnswered, setIsAnswered] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const [showSnackbar, setShowSnackbar] = useState(false);

  const handleChoiceChange = (e) => {
    const value = question.type === 'multiple_choice' ? parseInt(e.target.value) : e.target.value;
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
      if (selectedAnswer === question.correctAnswer) {
        setFeedbackMessage('Correct!');
      } else {
        setFeedbackMessage(`Incorrect. The correct answer is: ${question.correctAnswer}`);
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
            sx={{ maxHeight: 200, mb: 2 }}
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
                sx={selectedAnswer === choice.id ? { fontWeight: 'bold', backgroundColor: '#f0f0f0' } : {}}
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
        message={feedbackMessage} 
        action={feedbackMessage === 'Correct!' ? <CheckIcon /> : <CloseIcon />} 
      />
    </Card>
  );
}

export default Question;

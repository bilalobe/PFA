import React from 'react';
import { RadioGroup, FormControlLabel, Radio, Typography, Card, CardContent, CardMedia, Box } from '@mui/material';

function Question({ question, currentQuestionIndex, totalQuestions, selectedAnswer, onAnswerSelect }) {
  const handleChoiceChange = (e) => {
    onAnswerSelect(question.id, parseInt(e.target.value));
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

        <RadioGroup value={selectedAnswer} onChange={handleChoiceChange}>
          {question.choices.map((choice) => (
            <FormControlLabel
              key={choice.id}
              value={choice.id.toString()}
              control={<Radio />}
              label={choice.text}
            />
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
}

export default Question;

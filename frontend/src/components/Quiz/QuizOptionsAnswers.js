import React from 'react';
import { FormControlLabel, Radio, Checkbox, TextField } from '@mui/material';

function QuizAnswerOption({ type, choice, selectedAnswer, onAnswerSelect }) {
  const handleRadioChange = (e) => {
    onAnswerSelect(choice.id, e.target.value);
  };

  const handleCheckboxChange = () => {
    onAnswerSelect(choice.id);
  };
  
  const handleTextChange = (e) => {
    onAnswerSelect(choice.id, e.target.value);
  };

  if (type === 'multiple_choice' || type === 'true_false') {
    return (
      <FormControlLabel
        value={choice.id.toString()}
        control={<Radio />}
        label={choice.text}
        onChange={handleRadioChange}
        checked={selectedAnswer === choice.id || selectedAnswer === e.target.value}
        sx={{ backgroundColor: selectedAnswer === choice.id ? '#f0f0f0' : 'transparent', borderRadius: 1, p: 1, mb: 1 }}
      />
    );
  }

  if (type === 'multiple_selection') {
    return (
      <FormControlLabel
        control={<Checkbox
          checked={selectedAnswer ? selectedAnswer.includes(choice.id) : false}
          onChange={handleCheckboxChange}
        />}
        label={choice.text}
      />
    );
  }

  if (type === 'fill_in_the_blank') {
    return (
      <TextField
        fullWidth
        variant="outlined"
        value={selectedAnswer[choice.id] || ''}
        onChange={handleTextChange}
        placeholder={choice.placeholder}
      />
    );
  }

  return null;
}

export default QuizAnswerOption;

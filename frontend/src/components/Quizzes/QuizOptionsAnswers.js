import React from 'react';
import { FormControlLabel, Radio, Checkbox, TextField } from '@mui/material';

function QuizAnswerOption({ type, choice, selectedAnswer, onAnswerSelect }) {
  const handleRadioChange = () => {
    onAnswerSelect(choice.id);
  };

  const handleCheckboxChange = () => {
    const newSelectedAnswer = selectedAnswer.includes(choice.id)
      ? selectedAnswer.filter((id) => id !== choice.id)
      : [...selectedAnswer, choice.id];
    onAnswerSelect(choice.id, newSelectedAnswer);
  };
  
  const handleTextChange = (e) => {
    onAnswerSelect(choice.id, e.target.value);
  };

  if (type === 'multiple_choice' || type === 'true_false') {
    return (
      <FormControlLabel
        value={choice.id.toString()}
        control={
          <Radio
            checked={selectedAnswer === choice.id}
            onChange={handleRadioChange}
            aria-label={`answer option ${choice.text}`}
          />
        }
        label={choice.text}
        sx={{ backgroundColor: selectedAnswer === choice.id ? '#f0f0f0' : 'transparent', borderRadius: 1, p: 1, mb: 1 }}
      />
    );
  }

  if (type === 'multiple_selection') {
    return (
      <FormControlLabel
        control={
          <Checkbox
            checked={selectedAnswer.includes(choice.id)}
            onChange={handleCheckboxChange}
            aria-label={`selected option ${choice.text}`}
          />
        }
        label={choice.text}
        sx={{ backgroundColor: selectedAnswer.includes(choice.id) ? '#f0f0f0' : 'transparent', borderRadius: 1, p: 1, mb: 1 }}
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
        aria-label={`fill the blank ${choice.placeholder}`}
        sx={{ mb: 1 }}
      />
    );
  }

  return null;
}

export default QuizAnswerOption;

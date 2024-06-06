import React, { useState } from 'react';
import CustomInput from './Input';
import { Button } from '@mui/material';

function FormComponent() {
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);
  const [helperText, setHelperText] = useState('');

  const validateInput = (value) => {
    // Add your validation logic here
    if (value.length < 5) {
      setError(true);
      setHelperText('Input must be at least 5 characters');
    } else {
      setError(false);
      setHelperText('');
    }
  };

  const handleChange = (event) => {
    setValue(event.target.value);
    validateInput(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // Add your form submission logic here
    console.log('Form submitted with value:', value);
  };

  return (
    <form onSubmit={handleSubmit}>
      <CustomInput
        label="Custom Input"
        value={value}
        error={error}
        helperText={helperText}
        onChange={handleChange}
      />
      <Button type="submit" variant="contained" color="primary">
        Submit
      </Button>
    </form>
  );
}

export default FormComponent;
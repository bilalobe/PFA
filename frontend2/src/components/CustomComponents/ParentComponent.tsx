import React, { useState } from 'react';
import CustomInput from './Input';

function ParentComponent() {
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);
  const [helperText, setHelperText] = useState('');

  const validateInput = (value: string | any[]) => {
    // Add your validation logic here
    if (value.length < 5) {
      setError(true);
      setHelperText('Input must be at least 5 characters');
    } else {
      setError(false);
      setHelperText('');
    }
  };

const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
    validateInput(event.target.value);
};

  return (
    <CustomInput
      label="Custom Input"
      value={value}
      error={error}
      helperText={helperText}
      onChange={handleChange} sx={undefined}    />
  );
}

export default ParentComponent;
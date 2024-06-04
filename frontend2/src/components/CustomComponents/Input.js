import React from 'react';
import PropTypes from 'prop-types';
import { TextField, styled, useTheme } from '@mui/material';

const StyledTextField = styled(TextField)(({ theme, error }) => ({
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: error ? theme.palette.error.main : theme.palette.grey[500],
    },
    '&:hover fieldset': {
      borderColor: error ? theme.palette.error.dark : theme.palette.grey[700],
    },
    '&.Mui-focused fieldset': {
      borderColor: error ? theme.palette.error.dark : theme.palette.primary.main,
    },
  },
}));

function CustomInput({ label, sx, error = false, helperText, variant = 'outlined', ...props }) {
  const theme = useTheme();
  
  return (
    <StyledTextField
      theme={theme}
      label={label}
      sx={sx}
      error={error}
      helperText={helperText}
      variant={variant}
      {...props}
    />
  );
}

CustomInput.propTypes = {
  label: PropTypes.string.isRequired,
  sx: PropTypes.object,
  error: PropTypes.bool, 
  helperText: PropTypes.string, 
  variant: PropTypes.oneOf(['outlined', 'filled', 'standard']),
};

export default CustomInput;
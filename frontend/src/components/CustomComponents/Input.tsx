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

function CustomInput({ label, sx, error = false, helperText, variant = 'outlined', fullWidth = false, ...props }) {
  const theme = useTheme();
  
  return (
    <StyledTextField
      theme={theme}
      label={label}
      sx={sx}
      error={error}
      helperText={helperText}
      variant={variant}
      fullWidth={fullWidth}
      {...props}
    />
  );
}

CustomInput.propTypes = {
  label: PropTypes.string.isRequired,
  sx: PropTypes.object,
  error: PropTypes.bool,
  helperText: PropTypes.string,
  variant: PropTypes.oneOf(['standard', 'filled', 'outlined']),
  fullWidth: PropTypes.bool,
};

export default CustomInput;
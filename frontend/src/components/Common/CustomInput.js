import React from 'react';
import { TextField } from '@mui/material';
import { useTheme } from '@mui/material/styles';

function CustomInput({ label, sx, ...props }) {
  const theme = useTheme();
  return (
    <TextField
      variant="outlined"
      fullWidth
      margin="normal"
      label={label}
      InputLabelProps={{ style: { color: theme.palette.text.primary } }}
      InputProps={{
        sx: {
          bgcolor: theme.palette.background.paper,
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.grey[300],
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.primary.main,
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.primary.main,
          },
          ...sx, // allow overriding styles through props
        },
      }}
      {...props}
    />
  );
}

export default CustomInput;

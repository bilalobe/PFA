import React from 'react';
import { Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';

function CustomButton({ children, sx, ...props }) {
  const theme = useTheme();
  return (
    <Button
      variant="contained"
      color="primary"
      sx={{
        fontWeight: 'bold',
        textTransform: 'none',
        bgcolor: theme.palette.primary.main,
        '&:hover': {
          bgcolor: theme.palette.primary.dark,
        },
        ...sx, // allow overriding styles through props
      }}
      {...props}
    >
      {children}
    </Button>
  );
}

export default CustomButton;

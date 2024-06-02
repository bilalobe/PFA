import React from 'react';
import { Button } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledButton = styled(Button)(({ theme, variant }) => ({
  fontWeight: 'bold',
  textTransform: 'none',
  padding: '12px 24px', // Adjust padding
  borderRadius: '8px', // Adjust border radius
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
  ...(variant === 'outlined' && {
    border: `2px solid ${theme.palette.primary.main}`,
    backgroundColor: 'transparent',
    color: theme.palette.primary.main,
    '&:hover': {
      border: `2px solid ${theme.palette.primary.dark}`,
    },
  }),
  ...(variant === 'text' && {
    padding: '8px 16px',
    backgroundColor: 'transparent',
    color: theme.palette.primary.main,
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  }),
}));

function CustomButton({ children, variant = 'contained', sx, ...rest }) {
  return (
    <StyledButton variant={variant} sx={{ ...sx }} {...rest}>
      {children}
    </StyledButton>
  );
}

export default CustomButton;

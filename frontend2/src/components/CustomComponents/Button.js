import React from 'react';
import PropTypes from 'prop-types';
import { Button, styled } from '@mui/material';

const StyledButton = styled(Button)(({ theme, variant, fontSize, startIcon, endIcon, ...rest }) => ({
  fontWeight: 'bold',
  textTransform: 'none',
  padding: '12px 24px',
  borderRadius: '8px',
  fontSize: fontSize || '1rem', // Default font size or use prop
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
  '&.Mui-disabled': { // Styles for the disabled state
    backgroundColor: theme.palette.grey[300],
    color: theme.palette.grey[600],
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

function CustomButton({ children, variant = 'contained', fontSize, startIcon, endIcon, loading = false, tooltip, ...rest }) {
  const button = (
    <StyledButton variant={variant} fontSize={fontSize} startIcon={startIcon} endIcon={endIcon} disabled={loading} {...rest}>
      {loading ? <CircularProgress size={24} /> : children}
    </StyledButton>
  );

  return tooltip ? <tooltip title={tooltip}>{button}</tooltip> : button;
}

CustomButton.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.string,
  fontSize: PropTypes.string,
  startIcon: PropTypes.node,
  endIcon: PropTypes.node,
  loading: PropTypes.bool,
  tooltip: PropTypes.string,
};

export default CustomButton;
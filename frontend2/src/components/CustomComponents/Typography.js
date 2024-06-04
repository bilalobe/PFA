import PropTypes from 'prop-types';
import { Typography, styled } from '@mui/material';

const StyledTypography = styled(Typography)(({ theme, variant, color }) => ({
  fontFamily: 'Roboto, sans-serif',
  lineHeight: 1.5,

  // Variant-specific styles
  ...(variant === 'h1' && {
    fontSize: '2.5rem',
    fontWeight: 700,
  }),
  ...(variant === 'h2' && {
    fontSize: '2rem',
    fontWeight: 600,
  }),
  ...(variant === 'body1' && {
    fontSize: '1rem',
    color: theme.palette.text.secondary,
  }),
  ...(variant === 'body2' && {
    fontSize: '0.875rem',
    color: theme.palette.text.secondary,
  }),

  // Color styles
  ...(color === 'primary' && {
    color: theme.palette.primary.main,
  }),
  ...(color === 'secondary' && {
    color: theme.palette.secondary.main,
  }),
  ...(color === 'error' && {
    color: theme.palette.error.main,
  }),
  // Add more colors as needed...
}));

function CustomTypography({ children, variant = 'body1', color = 'inherit', ...rest }) {
  return (
    <StyledTypography variant={variant} color={color} {...rest}>
      {children}
    </StyledTypography>
  );
}

CustomTypography.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['h1', 'h2', 'body1', 'body2', 'subtitle1', 'subtitle2', 'caption', 'overline', 'inherit']),
  color: PropTypes.oneOf(['inherit', 'primary', 'secondary', 'textPrimary', 'textSecondary', 'error', 'info', 'success', 'warning']),
  rest: PropTypes.object,
};

export default CustomTypography;

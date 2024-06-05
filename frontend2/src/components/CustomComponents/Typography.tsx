import PropTypes from 'prop-types';
import { Typography, styled } from '@mui/material';
import { CSSProperties } from 'react';

interface StyledTypographyProps {
  theme: any;
  variant: string;
  color: string;
}

const StyledTypography = styled(Typography)<StyledTypographyProps>(({ theme, variant, color }) => ({
  fontFamily: 'Poppins, sans-serif',
  fontWeight: 400,
  fontSize: '1rem',
  lineHeight: 1.5,
  letterSpacing: '0.00938em',
  color: theme.palette.text.primary,
  
  // ... existing styles
}));

interface CustomTypographyProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'body1' | 'body2' | 'subtitle1' | 'subtitle2' | 'caption' | 'overline' | 'inherit';
  color?: 'inherit' | 'primary' | 'secondary' | 'textPrimary' | 'textSecondary' | 'error' | 'info' | 'success' | 'warning';
  rest?: CSSProperties;
}

function CustomTypography({ children, variant = 'body1', color = 'inherit', ...rest }: CustomTypographyProps) {
  return (
    <StyledTypography theme={undefined} variant={variant} color={color} {...rest}>
      {children}
    </StyledTypography>
  );
}

export default CustomTypography;
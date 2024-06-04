import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, Typography, styled } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme }) => ({
  boxShadow: 3,
  borderRadius: 2,
  backgroundColor: theme.palette.background.paper,
  '&:hover': {
    boxShadow: 6,
    backgroundColor: '#f0f0f0',
  },
  outline: 'none',
  '&:focus-within': {
    outline: `3px solid ${theme.palette.primary.main}`,
    boxShadow: `0 0 5px ${theme.palette.primary.main}`,
  },
}));

function CustomCard({ title, content, sx, ...props }) {
  const theme = useTheme();
  return (
    <StyledCard
      sx={{
        ...sx, // allow overriding styles through props
      }}
      {...props}
    >
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ color: theme.palette.text.primary }}>
          {title}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {content}
        </Typography>
      </CardContent>
    </StyledCard>
  );
}

CustomCard.propTypes = {
  title: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  sx: PropTypes.object,
};

export default CustomCard;
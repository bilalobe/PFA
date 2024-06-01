import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

function CustomCard({ title, content, sx, ...props }) {
  const theme = useTheme();
  return (
    <Card
      sx={{
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
    </Card>
  );
}

export default CustomCard;

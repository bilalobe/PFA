import React from 'react';
import { Card, CardContent, Typography, CardActionArea, Box } from '@mui/material';
import { Link } from 'react-router-dom';

function ModuleListItem({ module }) {
  return (
    <Card 
      sx={{
        boxShadow: 3,
        borderRadius: 2,
        '&:hover': { 
          boxShadow: 6, 
          backgroundColor: '#f0f0f0',
        },
        outline: 'none',
        '&:focus-within': {
          outline: '3px solid #007bff',
          boxShadow: '0 0 5px #007bff',
        },
      }}
      aria-label={`Module card for ${module.title}`}
      tabIndex={0}
    >
      <CardActionArea component={Link} to={`/modules/${module.id}`}>
        <CardContent>
          <Typography variant="h6" gutterBottom aria-label="Module Title">
            {module.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" aria-label="Module Description">
            {module.description}
          </Typography>
          <Box display="flex" justifyContent="space-between" mt={2}>
            <Typography variant="body2" color="text.secondary" aria-label="Module Duration">
              Duration: {module.duration} minutes
            </Typography>
            <Typography variant="body2" color="text.secondary" aria-label="Module Type">
              Type: {module.type}
            </Typography>
          </Box>
          <Box display="flex" justifyContent="space-between" mt={2}>
            <Typography variant="body2" color="text.secondary" aria-label="Module Difficulty">
              Difficulty: {module.difficulty}
            </Typography>
            <Typography variant="body2" color="text.secondary" aria-label="Module Created By">
              Created by: {module.created_by}
            </Typography>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default ModuleListItem;

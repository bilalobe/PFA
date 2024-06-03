import React from 'react';
import { Grid, Typography, Card, CardContent, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import CustomButton from './CustomButton'; // Adjust the import path as needed

function ModuleCard({ module }) {
  const { isAuthenticated } = useAuth();

  return (
    <Grid item xs={12} sm={6} md={4}>
      <Card sx={{ maxWidth: 345, '&:hover': { boxShadow: 6 }, bgcolor: 'background.paper' }}>
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            {module.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {module.description}
          </Typography>
        </CardContent>
        <Box sx={{ p: 2 }}>
          <CustomButton
            component={RouterLink}
            to={`/modules/${module.id}`}
            aria-label={`${module.name} details`}
            fullWidth
            sx={{
              mb: 1,
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': {
                bgcolor: 'primary.dark',
              },
            }}
          >
            View Module
          </CustomButton>
          {isAuthenticated && (
            <CustomButton
              component={RouterLink}
              to={`/modules/${module.id}/instructors`}
              aria-label={`${module.name} instructors`}
              fullWidth
              variant="outlined"
              sx={{ mb: 1 }}
            >
              View Instructors
            </CustomButton>
          )}
          <CustomButton
            component={RouterLink}
            to={`/courses/${module.courseId}`}
            aria-label={`course ${module.courseId}`}
            fullWidth
            variant="outlined"
          >
            View Course
          </CustomButton>
        </Box>
      </Card>
    </Grid>
  );
}

export default ModuleCard;

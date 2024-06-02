import React from 'react';
import { Grid, Typography, Card, CardContent, CardMedia, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAuth } from '../../hooks/useAuth';
import CustomButton from './CustomButton'; // Adjust the import path as needed

function CourseCard({ course }) {
  const { isAuthenticated, loading } = useAuth();
  const enrollments = useSelector((state) => state.enrollment.enrollments);
  const isEnrolled = enrollments.some((enrollment) => enrollment.course.id === course.id);

  return (
    <Grid item xs={12} sm={6} md={4}>
      <Card sx={{ maxWidth: 345, '&:hover': { boxShadow: 6 }, bgcolor: 'background.paper' }}>
        <CardMedia
          component="img"
          alt={course.name}
          height="140"
          image={course.imageUrl || '/path/to/placeholder.jpg'}
        />
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            {course.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {course.description}
          </Typography>
        </CardContent>
        <Box sx={{ p: 2 }}>
          {!loading && isAuthenticated ? (
            isEnrolled ? (
              <CustomButton
                component={RouterLink}
                to={`/courses/${course.id}`}
                aria-label="Go to Course"
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
                View Course
              </CustomButton>
            ) : (
              <CustomButton
                component={RouterLink}
                to={`/enroll/${course.id}`}
                aria-label="Enroll in Course"
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
                Enroll
              </CustomButton>
            )
          ) : (
            <CustomButton
              component={RouterLink}
              to="/login"
              aria-label="Login to Enroll"
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
              Login to Enroll
            </CustomButton>
          )}
          <CustomButton
            component={RouterLink}
            to={`/courses/${course.id}`}
            aria-label="Learn More"
            variant="outlined"
            fullWidth
          >
            Learn More
          </CustomButton>
        </Box>
      </Card>
    </Grid>
  );
}

export default CourseCard;

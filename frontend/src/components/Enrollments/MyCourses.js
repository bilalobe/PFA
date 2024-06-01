import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchEnrollments, fetchUnenroll } from '../../actions/enrollmentActions';
import { Typography, Card, CardContent, CircularProgress, Alert, Grid, LinearProgress, Button, Box, Badge } from '@mui/material';
import { Link } from 'react-router-dom';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import placeholderImage from '../../assets/placeholder.jpg'; // Placeholder image

function MyCourses() {
  const dispatch = useDispatch();
  const { enrollments, loading, error } = useSelector(state => state.enrollment);
  const [specificError, setSpecificError] = useState('');

  useEffect(() => {
    dispatch(fetchEnrollments()).catch((err) => {
      if (err.message.includes('Network Error')) {
        setSpecificError('Network error, please check your internet connection.');
      } else {
        setSpecificError('An error occurred while fetching enrollments. Please try again later.');
      }
    });
  }, [dispatch]);

  const handleUnenroll = (courseId) => {
    dispatch(fetchUnenroll(courseId)).catch((err) => {
      if (err.message.includes('Network Error')) {
        setSpecificError('Network error, please check your internet connection.');
      } else {
        setSpecificError('Could not unenroll from the course. Please try again later.');
      }
    });
  };

  if (loading) return <Box aria-label="Loading enrollments" textAlign="center"><CircularProgress /></Box>;
  if (error || specificError) {
    const errorMessage = specificError || 'An unexpected error occurred. Please try again later.';
    return <Alert severity="error" aria-label="Error fetching enrollments"><ErrorOutlineIcon /> {errorMessage}</Alert>;
  }

  return (
    <div>
      <Typography variant="h4" component="div" gutterBottom>
        My Courses
      </Typography>
      <Grid container spacing={3}>
        {enrollments.map((enrollment) => (
          <Grid item key={enrollment.id} xs={12} sm={6} md={4}>
            <Badge
              badgeContent={enrollment.completed ? <AssignmentTurnedInIcon color="success" /> : null}
              color="primary"
            >
              <Card>
                <CardContent>
                  {enrollment.course.image ? (
                    <img
                      src={enrollment.course.image}
                      alt={`Image of ${enrollment.course.title}`}
                      style={{ width: '100%', height: '150px', objectFit: 'cover', marginBottom: '10px' }}
                      aria-label={`Image of ${enrollment.course.title}`}
                    />
                  ) : (
                    <img
                      src={placeholderImage}
                      alt="Placeholder"
                      style={{ width: '100%', height: '150px', objectFit: 'cover', marginBottom: '10px' }}
                      aria-label="Placeholder image"
                    />
                  )}
                  <Typography variant="h6" component="div" gutterBottom>
                    {enrollment.course.title}
                  </Typography>
                  <Typography variant="body2" component="div" gutterBottom>
                    {/* Including a short description of the course */}
                    {enrollment.course.short_description}
                  </Typography>
                  <Typography variant="body2" component="div" gutterBottom>
                    Progress: {enrollment.progress}%
                  </Typography>
                  <Box position="relative" mb={2}>
                    <LinearProgress
                      variant="determinate"
                      value={enrollment.progress}
                      aria-label={`Progress of ${enrollment.course.title}`}
                      sx={{
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: '#e0e0e0',
                        '& .MuiLinearProgress-bar1Determinate': {
                          backgroundColor: '#3f51b5',
                          animation: 'pulse 2s infinite alternate',
                        },
                      }}
                    />
                    <Typography
                      variant="caption"
                      component="div"
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        color: '#fff',
                        fontWeight: 'bold',
                      }}
                    >
                      {enrollment.progress}%
                    </Typography>
                  </Box>
                  <Button
                    component={Link}
                    to={`/courses/${enrollment.course.id}`}
                    variant="contained"
                    color="primary"
                    sx={{ mt: 2, mb: 1 }}
                    aria-label={`Go to ${enrollment.course.title} details`}
                  >
                    View Course
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    sx={{ mt: 1, mb: 1 }}
                    aria-label={`Unenroll from ${enrollment.course.title}`}
                    onClick={() => handleUnenroll(enrollment.course.id)}
                  >
                    Unenroll
                  </Button>
                  {enrollment.completed && (
                    <Typography variant="overline" color="success.main">
                      Completed
                    </Typography>
                  )}
                  {/* Adding a mark as complete button */}
                  {!enrollment.completed && (
                    <Button
                      variant="text"
                      color="success"
                      sx={{ mt: 1 }}
                      aria-label={`Mark ${enrollment.course.title} as completed`}
                      onClick={() => console.log(`Marking ${enrollment.course.title} as completed`)}
                    >
                      Mark as Complete
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Badge>
          </Grid>
        ))}
      </Grid>
    </div>
  );
}

export default MyCourses;

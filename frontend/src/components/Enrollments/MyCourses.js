import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchEnrollments } from '../../actions/enrollmentActions';
import { Typography, Card, CardContent, CircularProgress, Alert, Grid } from '@mui/material';

function MyCourses() {
  const dispatch = useDispatch();
  const enrollments = useSelector(state => state.enrollment.enrollments);
  const loading = useSelector(state => state.enrollment.loading);
  const error = useSelector(state => state.enrollment.error);

  useEffect(() => {
    dispatch(fetchEnrollments());
  }, [dispatch]);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <div>
      <Typography variant="h4" component="div" gutterBottom>
        My Courses
      </Typography>

      <Grid container spacing={2}>
        {enrollments.map(enrollment => (
          <Grid item xs={12} sm={6} md={4} key={enrollment.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="div">
                  {enrollment.course.title}
                </Typography>
                <Typography variant="body2" component="div">
                  Progress: {enrollment.progress}%
                </Typography>
                {/* Include other enrollment details if needed */}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
}

export default MyCourses;

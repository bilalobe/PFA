import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchRecommendations } from '../actions/adaptiveActions';
import { CircularProgress, Alert, Card, CardContent, Typography, Grid } from '@mui/material';

function PersonalizedRecommendations() {
  const dispatch = useDispatch();
  const recommendations = useSelector(state => state.adaptive.recommendations);
  const loading = useSelector(state => state.adaptive.loading);
  const error = useSelector(state => state.adaptive.error);

  useEffect(() => {
    dispatch(fetchRecommendations());
  }, [dispatch]);

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <div>
      <Typography variant="h4" component="div" gutterBottom>
        Personalized Recommendations
      </Typography>
      <Grid container spacing={2}>
        {recommendations.map(quiz => (
          <Grid item xs={12} sm={6} md={4} key={quiz.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="div">
                  {quiz.title}
                </Typography>
                <Typography variant="body2" component="div">
                  {quiz.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
}

export default PersonalizedRecommendations;

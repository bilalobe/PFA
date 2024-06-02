import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchRecommendations } from '../actions/adaptiveActions';
import {
  CircularProgress, Alert, Card, CardContent, Typography,
  Grid, Box, CardMedia, IconButton, Button
} from '@mui/material';
import { Link } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

function PersonalizedRecommendations() {
  const dispatch = useDispatch();
  const recommendations = useSelector(state => state.adaptive.recommendations);
  const loading = useSelector(state => state.adaptive.loading);
  const error = useSelector(state => state.adaptive.error);

  useEffect(() => {
    dispatch(fetchRecommendations());
  }, [dispatch]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh" aria-label="Loading recommendations">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh" aria-label="Error message">
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="div" gutterBottom tabIndex={0}>
        Personalized Recommendations
      </Typography>
      <Grid container spacing={3} aria-label="Recommendation list">
        {recommendations.map(recommendation => (
          <Grid item xs={12} sm={6} md={4} key={recommendation.id}>
            <Card 
              sx={{
                boxShadow: 3,
                borderRadius: 2,
                bgcolor: 'background.paper',
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
              aria-label={`Recommendation card for ${recommendation.title}`}
            >
              {recommendation.image && (
                <CardMedia
                  component="img"
                  height="140"
                  image={recommendation.image}
                  alt={`Image for ${recommendation.title}`}
                  sx={{ objectFit: 'cover' }}
                />
              )}
              <CardContent>
                <Typography variant="h6" component="div" aria-label="Recommendation title" gutterBottom>
                  {recommendation.title}
                </Typography>
                <Typography variant="body2" color="textSecondary" aria-label="Recommendation description" gutterBottom>
                  {recommendation.description}
                </Typography>
                <Typography variant="body2" color="textSecondary" aria-label="Recommendation instructor">
                  By {recommendation.instructor}
                </Typography>
                <Typography variant="body2" color="textSecondary" aria-label="Recommendation category">
                  {recommendation.category} - {recommendation.level}
                </Typography>
              </CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2 }}>
                <Button 
                  component={Link}
                  to={`/courses/${recommendation.id}`}
                  variant="contained"
                  color="primary"
                  aria-label={`Learn more about ${recommendation.title}`}
                >
                  Learn More
                </Button>
                <Button 
                  component={Link}
                  to={`/enroll/${recommendation.id}`}
                  variant="outlined"
                  color="primary"
                  aria-label={`Enroll in ${recommendation.title}`}
                >
                  Enroll
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default PersonalizedRecommendations;

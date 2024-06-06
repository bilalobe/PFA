import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchResources } from '../../actions/resourceActions';
import { Typography, Grid, CircularProgress, Box } from '@mui/material';

function ResourceList({ moduleId }) {
  const dispatch = useDispatch();
  const { resources, loading, error } = useSelector((state) => ({
    resources: state.resource.resources,
    loading: state.resource.loading,
    error: state.resource.error,
  }));

  useEffect(() => {
    dispatch(fetchResources({ moduleId }));
  }, [dispatch, moduleId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4} aria-label="Loading resources">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Typography>Error: {error}</Typography>;
  }

  return (
    <Box>
      <Typography variant="h4" component="div" gutterBottom>
        Resources
      </Typography>
      <Grid container spacing={3} aria-label="Resource list">
        {resources.map((resource) => (
          <Grid item xs={12} sm={6} md={4} key={resource.id}>
            <Typography variant="h6" component="div" gutterBottom>
              {resource.title}
            </Typography>
            <Typography variant="body2" component="div" gutterBottom>
              {resource.description}
            </Typography>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default ResourceList;
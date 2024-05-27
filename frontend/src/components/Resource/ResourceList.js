import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchResources } from '../../actions/resourceActions'; 
import { Typography, Card, CardContent, CircularProgress, Alert, Grid } from '@mui/material';

function ResourceList({ moduleId }) { 
  const dispatch = useDispatch();
  const resources = useSelector(state => state.resource.resources);
  const loading = useSelector(state => state.resource.loading);
  const error = useSelector(state => state.resource.error);

  useEffect(() => {
    dispatch(fetchResources(moduleId));
  }, [dispatch, moduleId]);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <div>
      <Typography variant="h4" component="div" gutterBottom>
        Resources
      </Typography>

      <Grid container spacing={2}>
        {resources.map(resource => (
          <Grid item xs={12} sm={6} md={4} key={resource.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="div">
                  {resource.title}
                </Typography>
                <Typography variant="body2" component="div">
                  {resource.description}
                </Typography>
                {/* Include other resource details if needed */}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
}

export default ResourceList;

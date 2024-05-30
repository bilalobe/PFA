import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchResources as fetchResourcesRedux } from '../../actions/resourceActions'; 
import axios from 'axios';
import { Typography, Card, CardContent, CircularProgress, Alert, Grid, TextField } from '@mui/material';

function ResourceList({ moduleId }) { 
  const dispatch = useDispatch();
  const resourcesRedux = useSelector(state => state.resource.resources);
  const loadingRedux = useSelector(state => state.resource.loading);
  const errorRedux = useSelector(state => state.resource.error);
  const [resources, setResources] = useState(resourcesRedux);
  const [isLoading, setIsLoading] = useState(loadingRedux);
  const [error, setError] = useState(errorRedux);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        let url = `/api/resources/`;
        if (moduleId) {
          url += `?module=${moduleId}`;
        }
        if (searchQuery) {
          url += moduleId ? `&search=${searchQuery}` : `?search=${searchQuery}`;
        }
        const response = await axios.get(url);
        setResources(response.data);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (searchQuery) {
      fetchData();
    } else {
      dispatch(fetchResourcesRedux(moduleId));
    }

  }, [dispatch, moduleId, searchQuery]);

  useEffect(() => {
    if (!searchQuery) {
      setResources(resourcesRedux);
      setIsLoading(loadingRedux);
      setError(errorRedux);
    }
  }, [resourcesRedux, loadingRedux, errorRedux, searchQuery]);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  if (isLoading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error.message}</Alert>;
  }

  return (
    <div>
      <Typography variant="h4" component="div" gutterBottom>
        Resources
      </Typography>
      <TextField
        label="Search"
        value={searchQuery}
        onChange={handleSearchChange}
        variant="outlined"
        fullWidth
        margin="normal"
      />

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

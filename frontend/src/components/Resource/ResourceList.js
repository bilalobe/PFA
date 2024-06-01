import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchResources, setSearchQuery, setCurrentPage } from '../../actions/resourceActions';
import {
  Typography,
  Grid,
  TextField,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
  Alert,
  Box,
  Pagination,
  Button,
  InputAdornment,
  IconButton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { Link } from 'react-router-dom';

function ResourceList({ moduleId }) {
  const dispatch = useDispatch();
  const {
    resources,
    loading,
    error,
    searchQuery,
    currentPage,
    resourcesPerPage,
  } = useSelector((state) => ({
    resources: state.resource.resources,
    loading: state.resource.loading,
    error: state.resource.error,
    searchQuery: state.resource.searchQuery,
    currentPage: state.resource.currentPage,
    resourcesPerPage: state.resource.resourcesPerPage || 9,
  }));

  useEffect(() => {
    dispatch(fetchResources({ moduleId, searchQuery }));
  }, [dispatch, moduleId, searchQuery]);

  useEffect(() => {
    // Reset to first page if searchQuery changes
    dispatch(setCurrentPage(1));
  }, [searchQuery, dispatch]);

  const handleSearchChange = (event) => {
    dispatch(setSearchQuery(event.target.value));
  };

  const handleClearSearch = () => {
    dispatch(setSearchQuery(''));
  };

  const handlePageChange = (event, value) => {
    dispatch(setCurrentPage(value));
  };

  // Calculate the resources for the current page
  const indexOfLastResource = currentPage * resourcesPerPage;
  const indexOfFirstResource = indexOfLastResource - resourcesPerPage;
  const currentResources = resources.slice(indexOfFirstResource, indexOfLastResource);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" aria-label="Loading resources">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    const errorMessage = error.includes('Network Error')
      ? 'Network error, please check your internet connection.'
      : 'An error occurred while fetching resources. Please try again later.';
    return <Alert severity="error" aria-label="Error message">{errorMessage}</Alert>;
  }

  return (
    <Box>
      <Typography variant="h4" component="div" gutterBottom>
        Resources
      </Typography>
      <Box
        display="flex"
        alignItems="center"
        mb={2}
        sx={{ bgcolor: 'background.paper', borderRadius: 1, p: 1 }}
      >
        <TextField
          label="Search"
          value={searchQuery}
          onChange={handleSearchChange}
          variant="outlined"
          fullWidth
          margin="normal"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <SearchIcon />
                {searchQuery && (
                  <IconButton onClick={handleClearSearch} aria-label="Clear search">
                    <ClearIcon />
                  </IconButton>
                )}
              </InputAdornment>
            ),
          }}
          aria-label="Search resources"
        />
      </Box>
      <Grid container spacing={3} aria-label="Resource list">
        {currentResources.map((resource) => (
          <Grid item xs={12} sm={6} md={4} key={resource.id}>
            <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6" component="div" gutterBottom>
                  {resource.title}
                </Typography>
                <Typography variant="body2" component="div" gutterBottom>
                  {resource.description}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  color="primary"
                  component={Link}
                  to={`/resources/${resource.id}`}
                  aria-label={`View ${resource.title}`}
                >
                  View Resource
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Box display="flex" justifyContent="center" mt={4}>
        <Pagination
          count={Math.ceil(resources.length / resourcesPerPage)}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
          aria-label="Pagination"
        />
      </Box>
    </Box>
  );
}

export default ResourceList;

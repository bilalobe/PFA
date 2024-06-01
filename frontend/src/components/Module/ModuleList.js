import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchModules, setSearchQuery, setCurrentPage } from '../../actions/moduleActions';
import ModuleListItem from './ModuleListItem';
import {
  Grid,
  Typography,
  CircularProgress,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Pagination,
  IconButton,
  InputAdornment,
  Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import Fuse from 'fuse.js';

function ModuleList({ courseId }) {
  const dispatch = useDispatch();
  const modules = useSelector((state) => state.module.modules);
  const isLoading = useSelector((state) => state.module.isLoading);
  const error = useSelector((state) => state.module.error);
  const searchQuery = useSelector((state) => state.module.searchQuery);
  const currentPage = useSelector((state) => state.module.currentPage);
  const modulesPerPage = useSelector((state) => state.module.modulesPerPage || 6);

  useEffect(() => {
    dispatch(fetchModules({ courseId, searchQuery, currentPage }));
  }, [dispatch, courseId, searchQuery, currentPage]);

  const handlePageChange = (event, value) => {
    dispatch(setCurrentPage(value));
  };

  const handleSearchChange = (event) => {
    dispatch(setSearchQuery(event.target.value));
    dispatch(setCurrentPage(1));
  };

  const fuse = new Fuse(modules, { keys: ['title'], threshold: 0.3 });
  const filteredModules = searchQuery ? fuse.search(searchQuery).map(result => result.item) : modules;

  const indexOfLastModule = currentPage * modulesPerPage;
  const indexOfFirstModule = indexOfLastModule - modulesPerPage;
  const currentModules = filteredModules.slice(indexOfFirstModule, indexOfLastModule);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh" aria-label="Loading modules">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    const errorMessage = error.includes('Network Error')
      ? 'Network error, please check your internet connection.'
      : 'An error occurred while fetching modules. Please try again later.';
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh" aria-label="Error message">
        <Alert severity="error">{errorMessage}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="div" gutterBottom tabIndex={0}>
        Liste des modules
      </Typography>
      <Box display="flex" alignItems="center" mb={2} sx={{ bgcolor: 'background.paper', borderRadius: 1, p: 1 }}>
        <TextField
          label="Search modules"
          value={searchQuery}
          onChange={handleSearchChange}
          variant="outlined"
          fullWidth
          margin="normal"
          sx={{ mr: 2 }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <SearchIcon />
                {searchQuery && (
                  <IconButton onClick={() => dispatch(setSearchQuery(''))} aria-label="Clear search">
                    <ClearIcon />
                  </IconButton>
                )}
              </InputAdornment>
            ),
          }}
          aria-label="Search modules"
        />
      </Box>

      <Grid container spacing={3} aria-label="Module list">
        {currentModules.map((module) => (
          <Grid item key={module.id} xs={12} sm={6} md={4}>
            <ModuleListItem module={module} />
          </Grid>
        ))}
      </Grid>

      <Box display="flex" justifyContent="center" mt={4}>
        <Pagination
          count={Math.ceil(filteredModules.length / modulesPerPage)}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
          aria-label="Pagination"
        />
      </Box>
    </Box>
  );
}

export default ModuleList;

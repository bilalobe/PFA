import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchModules, setSearchQuery, setCurrentPage } from '../../actions/moduleActions';
import {
  Grid,
  Box,
  CircularProgress,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  InputAdornment,
  IconButton,
  Alert,
  Pagination,
  Typography
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import CustomInput from '../Common/CustomInput';
import CustomCard from '../Common/CustomCard';
import CourseListItem from './CourseListItem'; // Assuming you have a CourseListItem component

const ModuleList = ({ courseId }) => {
  const dispatch = useDispatch();
  const modules = useSelector(state => state.module.modules);
  const isLoading = useSelector(state => state.module.isLoading);
  const error = useSelector(state => state.module.error);
  const searchQuery = useSelector(state => state.module.searchQuery);
  const currentPage = useSelector(state => state.module.currentPage);
  const modulesPerPage = useSelector(state => state.module.modulesPerPage || 6);

  useEffect(() => {
    dispatch(fetchModules({ courseId, searchQuery, currentPage }));
  }, [dispatch, courseId, searchQuery, currentPage]);

  const handleSearchChange = (event) => {
    dispatch(setSearchQuery(event.target.value));
    dispatch(setCurrentPage(1)); // Reset to the first page on search change
  };

  const handleCategoryChange = (event) => {
    // Handle category change here
    // This can be extended to handle other filters too
  };

  const paginate = (event, value) => {
    dispatch(setCurrentPage(value));
  };

  const filteredModules = modules.filter((module) =>
    module.title.toLowerCase().includes(searchQuery.toLowerCase())
    // Add category filter logic here if needed
  );

  const indexOfLastModule = currentPage * modulesPerPage;
  const indexOfFirstModule = indexOfLastModule - modulesPerPage;
  const currentModules = filteredModules.slice(indexOfFirstModule, indexOfLastModule);

  if (isLoading) return <Loader />;
  if (error) return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100vh" aria-label="Error message">
      <Alert severity="error">An error occurred while fetching modules. Please try again later.</Alert>
    </Box>
  );

  return (
    <Box sx={{ mt: 2 }}>
      <CustomInput
        label="Search Modules"
        value={searchQuery}
        onChange={handleSearchChange}
        sx={{ mb: 2 }}
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
        aria-label="Search Modules"
      />

      <Grid container spacing={4}>
        {currentModules.map((module) => (
          <Grid item key={module.id} xs={12} sm={6} md={4}>
            <CustomCard
              title={module.title}
              content={
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {module.description}
                  </Typography>
                  <Box display="flex" justifyContent="space-between" mt={2}>
                    <Typography variant="body2" color="text.secondary">Duration: {module.duration} minutes</Typography>
                    <Typography variant="body2" color="text.secondary">Type: {module.type}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mt={2}>
                    <Typography variant="body2" color="text.secondary">Difficulty: {module.difficulty}</Typography>
                    <Typography variant="body2" color="text.secondary">Created by: {module.created_by}</Typography>
                  </Box>
                </Box>
              }
            />
          </Grid>
        ))}
      </Grid>

      <Box display="flex" justifyContent="center" mt={4}>
        <Pagination
          count={Math.ceil(filteredModules.length / modulesPerPage)}
          page={currentPage}
          onChange={paginate}
          color="primary"
          aria-label="Pagination"
        />
      </Box>
    </Box>
  );
}

export default ModuleList;

import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCours } from '../../actions/coursActions';
import { Grid, Typography, TextField, Box, CircularProgress, FormControl, Select, MenuItem, InputLabel, Pagination } from '@mui/material';
import CourseListItem from './CourseListItem';

const CourseList = () => {
  const dispatch = useDispatch();
  const { cours, isLoading, error } = useSelector((state) => state.cours);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [coursesPerPage] = useState(9);

  useEffect(() => {
    dispatch(fetchCours());
  }, [dispatch]);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleCategoryChange = (event) => {
    setCategoryFilter(event.target.value);
  };

  const handleLevelChange = (event) => {
    setLevelFilter(event.target.value);
  };

  const paginate = (event, value) => {
    setCurrentPage(value);
  };

  const filteredCourses = cours.filter((course) =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (categoryFilter === '' || course.category.toLowerCase().includes(categoryFilter.toLowerCase())) &&
    (levelFilter === '' || course.niveau_difficulte.toLowerCase().includes(levelFilter.toLowerCase()))
  );

  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = filteredCourses.slice(indexOfFirstCourse, indexOfLastCourse);

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h4" gutterBottom>
        Browse Courses
      </Typography>
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Search Courses"
            value={searchQuery}
            onChange={handleSearchChange}
            aria-label="Search Courses"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel id="category-filter-label">Category</InputLabel>
            <Select
              labelId="category-filter-label"
              id="category-filter"
              value={categoryFilter}
              onChange={handleCategoryChange}
              label="Category"
              aria-label="Category Filter"
            >
              <MenuItem value="">All Categories</MenuItem>
              <MenuItem value="web-development">Web Development</MenuItem>
              <MenuItem value="data-science">Data Science</MenuItem>
              <MenuItem value="programming">Programming</MenuItem>
              <MenuItem value="design">Design</MenuItem>
              <MenuItem value="business">Business</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel id="level-filter-label">Level</InputLabel>
            <Select
              labelId="level-filter-label"
              id="level-filter"
              value={levelFilter}
              onChange={handleLevelChange}
              label="Level"
              aria-label="Level Filter"
            >
              <MenuItem value="">All Levels</MenuItem>
              <MenuItem value="beginner">Beginner</MenuItem>
              <MenuItem value="intermediate">Intermediate</MenuItem>
              <MenuItem value="advanced">Advanced</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <CircularProgress aria-label="Loading courses" />
        </Box>
      ) : error ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Typography variant="h6" color="error" aria-label="Error loading courses">
            {error}
          </Typography>
        </Box>
      ) : (
        <>
          <Grid container spacing={4} mt={2}>
            {currentCourses.map((course) => (
              <Grid item key={course.id} xs={12} sm={6} md={4}>
                <CourseListItem cours={course} />
              </Grid>
            ))}
          </Grid>
          <Box display="flex" justifyContent="center" mt={4}>
            <Pagination
              count={Math.ceil(filteredCourses.length / coursesPerPage)}
              page={currentPage}
              onChange={paginate}
              color="primary"
              aria-label="Pagination"
            />
          </Box>
        </>
      )}
    </Box>
  );
};

export default CourseList;

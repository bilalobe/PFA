import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCourses } from '../../actions/courseActions';
import {
  Grid,
  Typography,
  Box,
  CircularProgress,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Pagination,
  InputAdornment,
  IconButton,
  Alert,
} from '@mui/material';
import CourseCard from './CourseCard';
import CustomInput from '../Common/CustomInput';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

const CourseList = () => {
  const dispatch = useDispatch();
  const { courses, isLoading, error } = useSelector((state) => state.course);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [coursesPerPage] = useState(9);

  useEffect(() => {
    dispatch(fetchCourses());
  }, [dispatch]);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1); // Reset to the first page on search change
  };

  const handleCategoryChange = (event) => {
    setCategoryFilter(event.target.value);
    setCurrentPage(1); // Reset to the first page on filter change
  };

  const handleLevelChange = (event) => {
    setLevelFilter(event.target.value);
    setCurrentPage(1); // Reset to the first page on filter change
  };

  const paginate = (event, value) => {
    setCurrentPage(value);
  };

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (categoryFilter === '' || course.category.toLowerCase().includes(categoryFilter.toLowerCase())) &&
    (levelFilter === '' || course.level.toLowerCase().includes(levelFilter.toLowerCase()))
  );

  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = filteredCourses.slice(indexOfFirstCourse, indexOfLastCourse);

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 2 }}>
        Browse Courses
      </Typography>

      <Grid container spacing={3} sx={{ mb: 2 }}>
        <Grid item xs={12} md={4}>
          <CustomInput
            label="Search Courses"
            value={searchQuery}
            onChange={handleSearchChange}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setSearchQuery('')} aria-label="Clear search">
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            aria-label="Search Courses"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth variant="outlined">
            <InputLabel id="category-filter-label">Category</InputLabel>
            <Select
              labelId="category-filter-label"
              id="category-filter"
              value={categoryFilter}
              onChange={handleCategoryChange}
              label="Category"
              sx={{ bgcolor: 'background.paper' }}
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
          <FormControl fullWidth variant="outlined">
            <InputLabel id="level-filter-label">Level</InputLabel>
            <Select
              labelId="level-filter-label"
              id="level-filter"
              value={levelFilter}
              onChange={handleLevelChange}
              label="Level"
              sx={{ bgcolor: 'background.paper' }}
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
          <Alert severity="error" aria-label="Error loading courses">
            {error}
          </Alert>
        </Box>
      ) : (
        <>
          <Grid container spacing={4}>
            {currentCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
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

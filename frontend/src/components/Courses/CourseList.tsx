import React, { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCourses, searchCourses } from '../../actions/courseActions';
import { Box, Typography, TextField, InputAdornment, IconButton, CircularProgress, Card, CardContent, Pagination, Grid } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { useFormik } from 'formik';
import { debounce } from 'lodash';
import 'tailwindcss/tailwind.css';

import CourseCard from './CourseCard'; 
import { RootState } from '../../store';

function CourseList() {
  const dispatch = useDispatch();
  const courses = useSelector((state: RootState) => state.course.courses);
  const loading = useSelector((state: RootState) => state.course.loading);
  const error = useSelector((state: RootState) => state.course.error);
  const [currentPage, setCurrentPage] = useState(1);
  const [coursesPerPage] = useState(9);

  // Fetch initial courses 
  useEffect(() => {
    dispatch(fetchCourses());
  }, [dispatch]);

  // Formik setup
  const formik = useFormik({
    initialValues: {
      searchQuery: '',
    },
    onSubmit: (values) => {
      // Handle search submission (we will dispatch searchCourses) 
    },
  });

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((query) => {
      // Dispatch searchCourses action to fetch filtered courses
      dispatch(searchCourses(query));
    }, 500),
    [],
  );

  // Update search results whenever searchQuery changes
  useEffect(() => {
    debouncedSearch(formik.values.searchQuery);
  }, [formik.values.searchQuery, debouncedSearch]);

  // Pagination 
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = courses.slice(indexOfFirstCourse, indexOfLastCourse);

  if (loading) {
    return 
    return <CircularProgress />;
  }

  return (
    <form onSubmit={formik.handleSubmit} className="form">
      <TextField
        name="searchQuery"
        value={formik.values.searchQuery}
        onChange={formik.handleChange}
        placeholder="Search courses"
        fullWidth
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              {formik.values.searchQuery && (
                <IconButton onClick={handleClearSearch}>
                  <ClearIcon />
                </IconButton>
              )}
              <IconButton>
                <SearchIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      {currentCourses.map(course => (
        <Card key={course.id} variant="outlined" sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="h6">{course.title}</Typography>
            <Typography variant="body2">{course.description}</Typography>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}

export default CourseList;
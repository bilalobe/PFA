import React, { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCourse, searchCourse } from '@/types/features/course/courseSlice';
import { RootState } from '@/types/store';
import { Typography, TextField, InputAdornment, IconButton, CircularProgress, Card, CardContent } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { useForm } from 'react-hook-form';
import { debounce } from 'lodash';

function CourseList() {
  const dispatch = useDispatch();
  const courses = useSelector((state: RootState) => state.course.courses);
  const loading = useSelector((state: RootState) => state.course.loading);
  const [currentPage, setCurrentPage] = useState(1);
  const [coursesPerPage] = useState(9);

  const { register, watch, setValue, handleSubmit } = useForm({
    defaultValues: {
      searchQuery: '',
    },
  });

  const searchQuery = watch('searchQuery');

useEffect(() => {
    dispatch(fetchCourse() as any);
  }, [dispatch]);

  const debouncedSearch = useCallback(
    debounce((query) => {
      dispatch(searchCourse(query) as any);
    }, 500),
    [dispatch]
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  const handleClearSearch = () => {
    setValue('searchQuery', '', { shouldValidate: false });
  };

  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = courses.slice(indexOfFirstCourse, indexOfLastCourse);

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <form onSubmit={handleSubmit(() => {})}>
      <TextField
        {...register('searchQuery')}
        onChange={(e) => setValue('searchQuery', e.target.value)}
        placeholder="Search courses"
        fullWidth
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              {searchQuery && (
                <IconButton onClick={handleClearSearch}>
                  <ClearIcon />
                </IconButton>
              )}
              <IconButton type="submit">
                <SearchIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      {currentCourses.map((course) => (
        <Card key={course.id} variant="outlined" sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="h6">{course.title}</Typography>
            <Typography variant="body2">{course.description}</Typography>
          </CardContent>
        </Card>
      ))}
    </form>
  );
}

export default CourseList;
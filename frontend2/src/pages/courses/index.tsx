import axios from 'axios';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Grid, Typography, TextField, Card, CardContent, CardActions, CircularProgress, Alert, Box, Pagination, Button, InputAdornment, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { Link } from 'react-router-dom';

function CourseList({ courses: initialCourses }) {
  const dispatch = useDispatch();
  const courses = useSelector(state => state.course.courses) || initialCourses;
  const loading = useSelector(state => state.course.loading);
  const error = useSelector(state => state.course.error);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [coursesPerPage] = useState(9);

  useEffect(() => {
    if (!initialCourses) {
      dispatch(fetchCourses()); // Assuming fetchCourses action is defined
    }
  }, [dispatch]);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  // Calculate the courses for the current page
  const indexOfLastCourse = currentPage * coursesPerPage;

  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = courses.slice(indexOfFirstCourse, indexOfLastCourse);

  if (loading)
    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Courses
            </Typography>
            <TextField
                value={searchQuery}
                onChange={handleSearchChange}
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
                            <IconButton>
                                <SearchIcon />
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
            />
            {loading ? (
                <Box display="flex" justifyContent="center" mt={4}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    {currentCourses.map(course => (
                        <Card key={course.id} variant="outlined" sx={{ mt: 2 }}>
                            <CardContent>
                                <Typography variant="h6">{course.title}</Typography>
                                <Typography variant="body2">{course.description}</Typography>
                            </CardContent>
                            <CardActions>
                                <Button component={Link} to={`/courses/${course.id}`} size="small">
                                    View Details
                                </Button>
                            </CardActions>
                        </Card>
                    ))}
                    <Box display="flex" justifyContent="center" mt={4}>
                        <Pagination
                            count={Math.ceil(courses.length / coursesPerPage)}
                            page={currentPage}
                            onChange={handlePageChange}
                        />
                    </Box>
                </>
            )}
        </Box>
    );

  if (error) {
    const errorMessage = error.includes('Network Error')
      ? 'Network error, please check your internet connection.'
      : 'An error occurred while fetching courses. Please try again later.';
    return  <Alert severity="error">{errorMessage}</Alert>;
  }

  return ( 
    <Box>
      <Typography variant="h4" gutterBottom>
        Courses
      </Typography>
      <TextField
        value={searchQuery}
        onChange={handleSearchChange}
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
          <CardActions>
            <Button component={Link} to={`/courses/${course.id}`} size="small">
              View Details
            </Button>
          </CardActions>
        </Card>
      ))}
      <Box display="flex" justifyContent="center" mt={4}>
        <Pagination
          count={Math.ceil(courses.length / coursesPerPage)}
          page={currentPage}
          onChange={handlePageChange}
        />
      </Box>
    </Box>
    
  );
}

export async function getServerSideProps() {
  const res = await axios.get('http://localhost:8000/api/courses'); // Replace with your Django API endpoint
  const courses = res.data;

  return {
    props: {
      courses,
    },
  };
}

export default CourseList;
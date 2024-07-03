import axios from 'axios';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Grid, Typography, TextField, Card, CardContent, CardActions, CircularProgress, Alert, Box, Pagination, Button, InputAdornment, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { Link } from 'react-router-dom';
import { fetchCourses } from '../features/course/courseSlice';
import  { initializeApp } from 'firebase/app';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function CourseList({ initialCourses = [] }) {
  const dispatch = useDispatch();

    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/api/courses'); // Fetch from your Django API
        setCourses(response.data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = filteredCourses.slice(indexOfFirstCourse, indexOfLastCourse);

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
      ) : error ? (
        <Alert severity="error">{error}</Alert>
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
              count={Math.ceil(filteredCourses.length / coursesPerPage)}
              page={currentPage}
              onChange={handlePageChange}
            />
          </Box>
        </>
      )}
    </Box>
  );
}

export async function getServerSideProps() {
  try {
    const response = await axios.get('http://localhost:8000/api/courses'); // Replace with your Django API endpoint
    const courses = response.data;

    return {
      props: { initialCourses: courses },
    };
  } catch (error) {
    return {
      props: { initialCourses: [], error: 'Failed to fetch courses.' },
    };
  }
}

export default CourseList;

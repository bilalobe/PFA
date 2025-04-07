import { useState, useEffect, useCallback } from 'react';
import {
  Grid,
  Typography,
  TextField,
  CircularProgress,
  Box,
  Pagination, InputAdornment,
  IconButton,
  Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import { debounce } from 'lodash';
import { collection, getDocs, orderBy, query, where, limit, startAfter, DocumentData, CollectionReference } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import CourseCard from '../../components/Courses/CourseCard';
import { Course } from '../../interfaces/types';
import MetaTags from '../../components/SEO/MetaTags';

const CoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const coursesPerPage = 9;

  const { register, handleSubmit, setValue } = useForm();

// Fetch Courses from Firestore with Pagination
const fetchCourses = useCallback(async () => {
  try {
    setLoading(true);
    setError(null);

    let coursesQuery: CollectionReference<DocumentData, DocumentData> = collection(db, 'courses');
    coursesQuery = query(coursesQuery, orderBy('createdAt', 'desc'));

    if (searchQuery) {
      coursesQuery = query(
        coursesQuery,
        where('title', '>=', searchQuery),
        where('title', '<=', searchQuery + '\uf8ff')
      );
    }

    if (lastVisible) {
      coursesQuery = query(coursesQuery, startAfter(lastVisible), limit(coursesPerPage));
    } else {
      coursesQuery = query(coursesQuery, limit(coursesPerPage));
    }

    const querySnapshot = await getDocs(coursesQuery);
    const fetchedCourses: Course[] = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Course));
    setCourses((prevCourses) => (lastVisible ? [...prevCourses, ...fetchedCourses] : fetchedCourses));
    setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
  } catch (err) {
    console.error("Error fetching courses:", err);
    setError('An error occurred while fetching courses.');
  } finally {
    setLoading(false);
  }
}, [searchQuery, lastVisible, coursesPerPage, setLoading, setError, setCourses, setLastVisible]);

  // Debounce the Search Input for Performance
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setLastVisible(null);
      setCurrentPage(1);
      setSearchQuery(query);
    }, 500),
    []
  );

  // Form Submit Handler (triggers search)
  const handleSearchSubmit: SubmitHandler<FieldValues> = (data) => {
    debouncedSearch(data.searchQuery);
  };

  const handleClearSearch = () => {
    setValue('searchQuery', '');
    setLastVisible(null);
    setCurrentPage(1);
    setSearchQuery("");
    fetchCourses();
  };

  // Pagination
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
    if (value > currentPage) {
      fetchCourses();
    }
  };

  // Initial Data Fetch
  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <>
      <MetaTags 
        title="Discover Online Courses | PFA E-Learning Platform"
        description="Browse our extensive catalog of online courses. Find the perfect learning path for your goals with personalized recommendations."
        keywords="online courses, e-learning, education, professional development, online education"
      />
      
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: 2, py: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          {/* Title optimized for SEO and user discovery */}
          Discover Our Courses
        </Typography>

        {/* Search Bar: Allows users to refine discovery within the platform */}
        <form onSubmit={handleSubmit(handleSearchSubmit)}>
          <TextField
            {...register('searchQuery')}
            placeholder="Search for Courses"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  {searchQuery && (
                    <IconButton onClick={handleClearSearch} edge="end">
                      <ClearIcon />
                    </IconButton>
                  )}
                </InputAdornment>
              ),
            }}
            fullWidth
            sx={{ mb: 2 }}
          />
        </form>

        {/* Course Grid: Displays courses found via search or direct navigation */}
        <Grid container spacing={2} justifyContent="center">
          {courses.map((course: Course) => (
            <Grid item key={course.id} xs={12} sm={6} md={4}>
              <CourseCard course={course} />
            </Grid>
          ))}
        </Grid>

        {/* Pagination */}
        {courses.length >= coursesPerPage && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Pagination
              count={Math.ceil(courses.length / coursesPerPage)}
              page={currentPage}
              onChange={handlePageChange}
            />
          </Box>
        )}
      </Box>
    </>
  );
};

export default CoursesPage;

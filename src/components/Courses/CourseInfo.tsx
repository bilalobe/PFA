import { useEffect, useState, useCallback } from 'react';
import { collection, getDocs, orderBy, query, where, limit, startAfter } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import {
  Box, Typography, TextField, CircularProgress, Card, CardContent, CardActions,
  Grid, Button, InputAdornment, IconButton, Pagination,
  Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { useForm } from 'react-hook-form';
import { debounce } from 'lodash';
import Link from 'next/link';
import React from 'react';
import { Course } from '../../interfaces/types';
import { CourseListProps } from '../../interfaces/props';


const CourseList: React.FC<CourseListProps> = ({ courses: initialCourses }) => {
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [coursesPerPage] = useState(9);

  const { register, handleSubmit, setValue } = useForm();

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let coursesQuery = query(collection(db, 'collect')(db, 'courses'), orderBy('createdAt', 'desc'));

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
      const fetchedCourses = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Course[];

      setCourses(fetchedCourses);
      setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
    } catch (error) {
      console.error("Error fetching courses:", error);
      setError('Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, lastVisible, coursesPerPage]);

  const debouncedSearch = useCallback(
    debounce((query) => {
      setLastVisible(null);
      setCurrentPage(1);
      setSearchQuery(query);
    }, 500),
    []
  );

  const handleClearSearch = () => {
    setValue('searchQuery', '');
    setLastVisible(null);
    setCurrentPage(1);
    fetchCourses();
  };

  const handlePageChange = (event: any, value: React.SetStateAction<number>) => {
    setCurrentPage(Number(value));
    if (Number(value) > currentPage) {
      fetchCourses();
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  const currentCourses = courses.slice((currentPage - 1) * coursesPerPage, currentPage * coursesPerPage);

  return (
    <Box sx={{ mt: 3 }}>
      <form onSubmit={handleSubmit((data) => debouncedSearch(data.searchQuery))}>
        <TextField
          {...register('searchQuery')}
          placeholder="Search courses"
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
          sx={{ mb: 2 }}
          fullWidth
        />
      </form>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {currentCourses.map((course) => (
          <Grid item xs={12} sm={6} md={4} key={course.id}>
            <Link href={`/courses/${course.id}`}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    {course.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {course.description}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small">Learn More</Button>
                </CardActions>
              </Card>
            </Link>
          </Grid>
        ))}
      </Grid>
      <Pagination
        count={Math.ceil(courses.length / coursesPerPage)}
        page={currentPage}
        onChange={handlePageChange}
      />
    </Box>
  );
}

export default CourseList;

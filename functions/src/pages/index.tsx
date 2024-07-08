import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, CircularProgress } from '@mui/material';
import CourseCard from '../components/UI/Card';
import HeroSection from '../components/Homepage/HeroSection';
import Testimonials from '../components/Homepage/Testimonials';
import Footer from '../components/Layout/Footer';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Course, Testimonial } from '../interfaces/types';

const Homepage = () => {
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: 'John Doe',
      text: 'This course was amazing! I learned so much and the instructors were fantastic.',
      avatarUrl: '',
    },
    {
      id: 2,
      name: 'Jane Smith',
      text: 'Highly recommend this course to anyone looking to improve their skills.',
      avatarUrl: '',
    },
    {
      id: 3,
      name: 'Sam Wilson',
      text: 'A great learning experience with practical examples and hands-on projects.',
      avatarUrl: '',
    },
  ];

  useEffect(() => {
    const fetchFeaturedCourses = async () => {
      try {
        const featuredCoursesRef = collection(db, 'courses');
        const q = query(featuredCoursesRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const courses: Course[] = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
          title: doc.data().title,
          description: doc.data().description,
          modules: doc.data().modules,
        }));
        setFeaturedCourses(courses);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedCourses();
  }, []);

  const handleTestimonialClick = (id: number) => {
    console.log(`Testimonial ${id} clicked`);
  };

  return (
    <Box>
      <HeroSection />
      <Box sx={{ padding: 4 }}>
        <Typography variant="h4" gutterBottom>
          Featured Courses
        </Typography>
        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <Grid container spacing={4}>
            {featuredCourses.map((course) => (
              <Grid item xs={12} sm={6} md={4} key={course.id}>
                <CourseCard content={''} {...course} />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
      <Testimonials onTestimonialClick={handleTestimonialClick} testimonials={testimonials} />
      <Footer />
    </Box>
  );
};

export default Homepage;
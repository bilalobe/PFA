import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, CircularProgress } from '@mui/material';
import CourseCard from '../components/Courses/CourseCard';
import HeroSection from '../components/Homepage/HeroSection';
import FeaturesSection from '../components/Home/FeaturesSection';
import TestimonialsSection from '../components/Home/TestimonialsSection';
import CallToActionSection from '../components/Home/CallToActionSection';
import UserJourneySection from '../components/Home/UserJourneySection';
import MetaTags from '../components/SEO/MetaTags';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Course, Testimonial } from '../interfaces/types';

const HomePage: React.FC = () => {
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: 'John Doe',
      text: 'This course was amazing! I learned so much and the instructors were fantastic. The hands-on projects helped me apply what I learned immediately in my work.',
      avatarUrl: '',
      rating: 5,
    },
    {
      id: 2,
      name: 'Jane Smith',
      text: 'Highly recommend this course to anyone looking to improve their skills. The content is well-structured and the instructors are very responsive to questions.',
      avatarUrl: '',
      rating: 4.5,
    },
    {
      id: 3,
      name: 'Sam Wilson',
      text: 'A great learning experience with practical examples and hands-on projects. The community support was also excellent and helped me solve problems quickly.',
      avatarUrl: '',
      rating: 4,
    },
    {
      id: 4,
      name: 'Emily Johnson',
      text: 'The course exceeded my expectations! The material was comprehensive yet easy to understand. I particularly appreciated the rich interactive elements.',
      avatarUrl: '',
      rating: 5,
    },
    {
      id: 5,
      name: 'Michael Chen',
      text: 'Good content but I would have liked more advanced topics. The basics were covered thoroughly though, and the instructors were knowledgeable.',
      avatarUrl: '',
      rating: 3.5,
    }
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
    <>
      <MetaTags 
        title="PFA - Personalized Learning for Everyone | E-Learning Platform"
        description="Discover a personalized e-learning experience with AI-powered courses, interactive modules, and real-time collaboration. Learn at your pace, your way."
        keywords="e-learning, personalized learning, online courses, AI education, interactive learning"
        ogImage="/images/pfa-social-share.jpg"
      />
      <Box>
        <HeroSection />
        <FeaturesSection />
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
                  <CourseCard 
                    course={{
                      id: course.id,
                      courseTitle: course.title,
                      courseDescription: course.description,
                      courseImage: course.imageUrl
                    }} 
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
        <UserJourneySection />
        <TestimonialsSection testimonials={testimonials} onTestimonialClick={handleTestimonialClick} />
        <CallToActionSection />
      </Box>
    </>
  );
};

export default HomePage;
import React, { useState, useEffect } from 'react';
import { Box, Typography, Alert, CircularProgress } from '@mui/material';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/router';

const CourseDetail = ({ course, initialEnrollmentStatus }) => {
  const router = useRouter();
  const { courseId } = router.query;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(initialEnrollmentStatus);

  useEffect(() => {
    const fetchEnrollmentStatus = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`http://localhost:8000/api/courses/${course.id}/enrollment`);
        setIsEnrolled(res.data.isEnrolled);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (course.id) {
      fetchEnrollmentStatus();
    }
  }, [course.id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    // Handle error here
  }

  return (
    <div>
      {/* ... other course details ... */}
      <Link href={`/courses/${courseId}/chat`}>
        <a>Go to Course Chat</a>
      </Link>
    </div>
  );
}

export default CourseDetail;
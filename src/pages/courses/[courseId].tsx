import { useRouter } from 'next/router';
import { useAuth } from '../../hooks/useAuth';
import { useFirestoreDocument, useFirestoreCollectionData } from '../../hooks/useFirestore';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Divider} from '@mui/material';
import { Module, Enrollment } from '../../interfaces/types';
import { collection, query, where, orderBy, collectionGroup, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { enrollmentApi } from '../../utils/api';
import CourseInfo from '../../components/Courses/CourseInfo';
import ModuleList from '../../components/Courses/ModuleList';
import ResourceList from '../../components/Resources/ResourceList';
import { useEffect, useState, useMemo } from 'react';

const CourseDetailsPage: React.FC = () => {
  const router = useRouter();
  const { courseId } = router.query;
  const { user } = useAuth();

  const { docData: course, loading: courseLoading, error: courseError } = useFirestoreDocument(`courses/${courseId}`);

  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);
  const [enrollmentError, setEnrollmentError] = useState<string | null>(null);

  const modulesQuery = query(collectionGroup(db, 'modules'), where('courseId', '==', courseId), orderBy('order', 'asc'));
  const { data: modules, loading: modulesLoading, error: modulesError } = useFirestoreCollectionData(modulesQuery.toString());

  const resourcesQuery = query(collection(db, 'resources'), where('courseId', '==', courseId));
  const { data: resources, loading: resourcesLoading, error: resourcesError } = useFirestoreCollectionData(resourcesQuery);

  useEffect(() => {
    const fetchEnrollmentStatus = async () => {
      if (user) {
        setEnrollmentLoading(true);
        try {
          const enrollments = await enrollmentApi.fetchEnrollments();
          const currentEnrollment = enrollments.find((enrollment) => enrollment.course === courseId);
          setEnrollment(currentEnrollment);
          setIsEnrolled(!!currentEnrollment);
        } catch (error: any) {
          console.error("Error fetching enrollment:", error);
          setEnrollmentError(error.message);
        } finally {
          setEnrollmentLoading(false);
        }
      }
    };

    fetchEnrollmentStatus();
  }, [courseId, user]);

  const handleEnroll = async () => {
    if (user && courseId) {
      setEnrollmentLoading(true);
      setEnrollmentError(null);
      try {
        const newEnrollment = await enrollmentApi.enrollInCourse(courseId);
        setEnrollment(newEnrollment);
        setIsEnrolled(true);
      } catch (error: any) {
        console.error('Error during enrollment:', error);
        setEnrollmentError(error.message);
      } finally {
        setEnrollmentLoading(false);
      }
    }
  };

  const handleUnenroll = async () => {
    if (user && enrollment && enrollment.id) {
      setEnrollmentLoading(true);
      setEnrollmentError(null);
      try {
        await enrollmentApi.unenrollFromCourse(enrollment.id);
        setIsEnrolled(false);
        setEnrollment(null);
      } catch (error: any) {
        console.error('Error during unenrollment:', error);
        setEnrollmentError(error.message);
      } finally {
        setEnrollmentLoading(false);
      }
    }
  };

  // Calculate Course Completion
  const isCourseComplete = useMemo(() => {
    if (enrollment && modules) {
      // Assuming enrollment.completedModules is an array of module IDs
      return enrollment.completedModules.length === modules.length;
    }
    return false; // Default to false if data is not available
  }, [enrollment, modules]);

  const handleMarkCourseComplete = async () => {
    if (user && user.userType === 'student' && enrollment && enrollment.id && !isCourseComplete) {
      try {
        // Update the enrollment document in Firestore
        await updateDoc(doc(db, 'enrollments', enrollment.id), {
          completed: true,
        });

        // Generate Certificate (Optional)
        // ... (Call your certificate generation logic here)

        // Send Email Notification (Optional)
        // ... (Call your email notification logic here)

        // Update the UI to reflect the completion
        setIsEnrolled(false);
        setEnrollment(null);
      } catch (error: any) {
        console.error('Error marking course complete:', error);
        setEnrollmentError(error.message);
      }
    }
  };

  if (courseLoading || modulesLoading || resourcesLoading || enrollmentLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (courseError || modulesError || resourcesError || enrollmentError) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Alert severity="error">{courseError || modulesError || resourcesError || enrollmentError}</Alert>
      </Box>
    );
  }

  if (!course) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Alert severity="error">Course not found.</Alert>
      </Box>
    );
  }

  const showEnrollmentButton = user && !isEnrolled;
  const showUnenrollmentButton = user && isEnrolled;

  return (
    <Box>
      <Typography variant="h4" align="center" gutterBottom>
        {course.title}
      </Typography>

      <CourseInfo courses={course} />

      <Divider sx={{ my: 2 }} />

      {isEnrolled && modules && (
        <ModuleList modules={modules as Module[]} completedModules={enrollment?.completedModules || []} onModuleComplete={function (moduleId: string): void {
                  throw new Error('Function not implemented.');
              } } />
      )}

      {isEnrolled && resources && typeof courseId === 'string' && (
        <ResourceList moduleId={courseId} />
      )}

      {/* Show the Mark Course Complete button only to enrolled students */}
      {user && user.userType === 'student' && isEnrolled && !isCourseComplete && (
        <Button variant="contained" onClick={handleMarkCourseComplete}>
          Mark Course as Complete
        </Button>
      )}

      {/* Display a completion message or a certificate download button (or both!) 
         if the course is complete. */}
      {isCourseComplete && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" align="center" gutterBottom>
            Congratulations! You've Completed {course.title}.
          </Typography>
          {/* ... Optional: Certificate download button or other rewards ...  */}
        </Box>
      )}

      {showEnrollmentButton && (
        <Button variant="contained" onClick={handleEnroll}>
          Enroll in Course
        </Button>
      )}

      {showUnenrollmentButton && (
        <Button variant="contained" onClick={handleUnenroll}>
          Unenroll from Course
        </Button>
      )}

      {enrollmentError && (
        <Alert severity="error">{enrollmentError}</Alert>
      )}
    </Box>
  );
};

export default CourseDetailsPage;

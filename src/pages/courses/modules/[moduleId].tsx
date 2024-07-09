import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useFirestoreDocument, useFirestoreCollectionData } from '../../../hooks/useFirestore';
import { useAuth } from '../../../hooks/useAuth';
import { Box, Typography, CircularProgress, Alert, List, ListItem, ListItemText, Button } from '@mui/material';
import { Module, Resource, Enrollment } from '../../../interfaces/types';
import { db } from '../../../firebaseConfig';
import { collection, query, where, arrayUnion, doc, getDoc, updateDoc } from 'firebase/firestore';
import Link from 'next/link';
import { enrollmentApi } from '../../../utils/api';

function ModuleDetailsPage() {
  const router = useRouter();
  const { courseId, moduleId } = router.query;
  const { user } = useAuth();

  // Fetch Module Data
  const { docData: module, loading: moduleLoading, error: moduleError } = useFirestoreDocument(`courses/${courseId}/modules/${moduleId}`);

  // Fetch Resources for this Module
  const resourcesQuery = query(
    collection(db, 'courses', courseId, 'modules', moduleId, 'resources'),
  );
  const { data: resources, loading: resourcesLoading, error: resourcesError } = useFirestoreCollectionData(resourcesQuery.toString());

  // Enrollment Data (for progress tracking and authorization)
  const { docData: enrollment, loading: enrollmentLoading, error: enrollmentError } =
    useFirestoreDoc(`enrollments/${courseId}_${user?.uid}`); // Adjust path if needed

  useEffect(() => {
    if (!enrollment && !enrollmentLoading && !enrollmentError && user && courseId) {
      const createEnrollment = async () => {
        try {
          await enrollmentApi.enrollInCourse(courseId);
        } catch (error: any) {
          // Handle errors, potentially redirect to an error page, or show an error message.
          console.error('Failed to create enrollment:', error);
          router.push('/courses');
        }
      };

      createEnrollment();
    }
  }, [enrollment, enrollmentLoading, enrollmentError, user, courseId]);

  // Function to mark the module as complete
  const handleMarkModuleComplete = async () => {
    if (!enrollment || !enrollment.id) return;

    try {
      await enrollmentApi.completeModule(enrollment.id, moduleId);

      // Redirect to the next module if there is one, otherwise redirect to the course page
      // (or stay on the same module if you want to add module navigation within the page)

      // Get all modules for the course
      const modulesSnapshot = await getDocs(collection(db, 'courses', courseId, 'modules'));
      const modules = modulesSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));

      // Sort the modules by order (assuming you have an 'order' field)
      modules.sort((a, b) => a.order - b.order);
      // Get current module's order
      const currentModule = modules.find((m: any) => m.id === moduleId);

      if (currentModule) {
        // Find the index of the current module
        const currentIndex = modules.indexOf(currentModule);

        // Check if there's a next module
        if (currentIndex < modules.length - 1) {
          const nextModule = modules[currentIndex + 1];
          router.push(`/courses/${courseId}/modules/${nextModule.id}`);
        } else {
          router.push(`/courses/${courseId}`);
        }
      }

    } catch (error) {
      console.error("Error marking module complete:", error);
      // ... handle the error with a user-friendly message ...
    }
  };

  if (moduleLoading || resourcesLoading || enrollmentLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (moduleError || resourcesError || enrollmentError) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Alert severity="error">An error occurred while fetching module data. Please try again later.</Alert>
      </Box>
    );
  }

  if (!module || !enrollment || !user) {
    // Handle case where module data is not available or the user is not authenticated
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Alert severity="error">You are not authorized to view this module.</Alert>
      </Box>
    );
  }

  // Check if the current user is authorized to view this module
  const isAuthorized = enrollment?.studentId === user.uid || user.user_type === 'teacher' || user.user_type === 'supervisor';

  if (!isAuthorized) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Alert severity="error">You are not authorized to view this module.</Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Display Module Title and Content */}
      <Typography variant="h4" align="center" gutterBottom>
        {module.title}
      </Typography>
      <Typography variant="body1" gutterBottom>
        {module.content}
      </Typography>

      {/* Display Resources for this Module */}
      {resources.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Resources
          </Typography>
          <List>
            {resources.map((resource: Resource) => (
              <ListItem key={resource.id}>
                <ListItemText primary={resource.title} />
                {/* Add a link to the resource if you have a way to display it */}
                {/* <Link href={resource.url}> */}
                {/*   <Button variant="contained" size="small">
                    View Resource
                  </Button>
                </Link> */}
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {/* Add Quizzes related to this Module (if applicable) */}
      {/* ... Your logic to fetch and display quizzes ...  */}

      {/* Button to mark module as complete - for students */}
      {user.user_type === 'student' && (
        <Button variant="contained" onClick={handleMarkModuleComplete} sx={{ mt: 2 }}>
          Mark Module as Complete
        </Button>
      )}
    </Box>
  );
}

export default ModuleDetailsPage;

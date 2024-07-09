// pages/courses/[courseId]/resources/index.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useFirestoreCollectionData } from '../../../../hooks/useFirestore';
import { useAuth } from '../../../../hooks/useAuth'; 
import Link from 'next/link';
import { Box, Typography, CircularProgress, Alert, List, ListItem, ListItemText, ListItemIcon, Button } from '@mui/material'; 
import { Download } from '@mui/icons-material';
import { Resource } from '../../../../types'; 
import { collection, orderBy, query, where } from 'firebase/firestore'; 
import { db } from '../../../../firebaseConfig';
import { resourceApi } from '../../../../utils/api';

const CourseResourcesPage = () => {
  const router = useRouter(); 
  const { courseId } = router.query; 
  const { user } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]); 

  const { data, loading, error } = useFirestoreCollectionData<Resource>(`courses/${courseId}/resources`, orderBy('uploadDate', 'desc')); 

  useEffect(() => {
      if (data) {
          setResources(data);
      }
  }, [data]);

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
        <Alert severity="error">An error occurred while fetching resources. Please try again later.</Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Heading */}
      <Typography variant="h4" align="center" gutterBottom>
        Course Resources
      </Typography>

      {/* Conditional button for teachers to add resources */}
      {user?.user_type === 'teacher' && (
        <Box sx={{ mt: 2 }}> 
          <Button variant="contained" component={Link} href={`/courses/${courseId}/resources/upload`}>
              Upload Resource 
          </Button>
        </Box>
      )}

      {/* List of Resources */}
      {resources.length === 0 ? (
        <Typography variant="body1" align="center" gutterBottom>
          No resources found for this course.
        </Typography>
      ) : (
        <List>
          {resources.map((resource) => (
            <ListItem key={resource.id}>
              {/* Resource Item */}
              {/* ... Use your existing ResourceListItem if you have one, 
              or create one that accepts the `resource` as a prop ...  */}
              <ListItemText
                primary={resource.title}
                secondary={`Uploaded by ${resource.uploadedBy}`}
              />
              {/* Add download count if you're tracking it */}
              {/* <Typography variant="caption" color="textSecondary">
                Downloads: {resource.downloadCount}
              </Typography> */}

              {/* Download Button (ensure it triggers incrementDownloadCount when clicked) */}
              <Button variant="contained" size="small" onClick={() => resourceApi.incrementDownloadCount(resource.id)}>
                <ListItemIcon>
                  <Download />
                </ListItemIcon>
                Download
              </Button>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default CourseResourcesPage;

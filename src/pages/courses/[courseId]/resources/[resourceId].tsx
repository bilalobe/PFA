import React from 'react';
import { useRouter } from 'next/router';
import { useFirestoreDocument } from '../../../../hooks/useFirestore';
import { Box, Typography, CircularProgress, Alert, Button } from '@mui/material';
import { resourceApi } from '../../../../utils/api';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const ResourceDetailsPage = () => {
  const router = useRouter();
  const { courseId, moduleId, resourceId } = router.query as { courseId: string, moduleId: string, resourceId: string };

  // Fetch Resource Data
  const { docData: resource, loading, error } = useFirestoreDocument(`courses/${courseId}/modules/${moduleId}/resources/${resourceId}`);

  const handleDownload = async () => {
    try {
      // 1. Get the download URL of the file
      const downloadUrl = await resourceApi.getResourceDownloadUrl(resourceId); // Implement this function
      // 2. Increment the download count
      await resourceApi.incrementDownloadCount(resourceId);
      // 3. Trigger the download
      window.location.href = downloadUrl;
    } catch (err) {
      // Handle error
      console.error(err);
    }
  };

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
        <Alert severity="error">
          {String(error)}
        </Alert>
      </Box>
    );
  }

  if (!resource) {
    // Handle case where resource data is not found
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Alert severity="error">
          Resource not found.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Resource Details
      </Typography>
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          {resource.title}
        </Typography>
        <Typography variant="body1" gutterBottom>
          {resource.description}
        </Typography>
        <Typography variant="body2" gutterBottom>
          Uploaded by: {resource.uploadedBy}
        </Typography>
        <Typography variant="body2" gutterBottom>
          Upload Date: {new Date(resource.uploadDate).toLocaleDateString()}
        </Typography>
        {/* Additional resource details like fileType can be added here */}
        <Button variant="contained" onClick={handleDownload} sx={{ mt: 2 }}>
          Download
        </Button>
      </Box>
    </Box>
  );
};

// You'll need to use getServerSideProps to fetch the initial resource data and handle authorization
export async function getServerSideProps(context: { params: { courseId: any; moduleId: any; resourceId: any; }; }) {
  try {
    const { courseId, moduleId, resourceId } = context.params;

    // Fetch the resource document from Firestore
    const firestore = getFirestore();
    const resourceDocRef = doc(firestore, `courses/${courseId}/modules/${moduleId}/resources/${resourceId}`);
    const resourceDoc = await getDoc(resourceDocRef);
    if (!resourceDoc.exists) {
      return {
        notFound: true, // Or redirect to an error page
      };
    }

    // Add authorization logic here if you can determine it on the server-side:
    // - Check if the resource is part of a course the user is enrolled in.

    const resourceData = { id: resourceDoc.id, ...resourceDoc.data() };
    return {
      props: { resource: resourceData }
    };

  } catch (error) {
    return {
      props: { error: 'Failed to fetch resource details.' }
    };
  }
}

export default ResourceDetailsPage;

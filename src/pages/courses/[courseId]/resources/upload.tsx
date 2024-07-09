import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useFirestore } from '../../../../hooks/useFirestore';
import { useAuth } from '../../../../hooks/useAuth';
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  LinearProgress,
  Stack,
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import { serverTimestamp } from 'firebase/firestore';
import { resourceApi } from '../../../../utils/api'; // Or adjust the path

const ResourceUploadPage = () => {
  const router = useRouter();
  const { courseId, moduleId } = router.query; // Make sure you're getting these from the route!
  const { user } = useAuth();
  const { createSubcollectionDocument } = useFirestore();

  // State to manage form data and file
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const [uploadProgress, setUploadProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle input changes
  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
  };
  const handleDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDescription(event.target.value);
  };

  // Dropzone setup
  const onDrop = useCallback((acceptedFiles) => {
    setFile(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Validation (Add more rules as needed!)
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Upload the file to Firebase Storage using your `resourceApi`
      // Get the download URL after the upload is complete
      const uploadResult = await resourceApi.uploadResource(moduleId, file, (progress) => {
        setUploadProgress(progress);
      });

      if (uploadResult && uploadResult.downloadUrl) {
        // Create the resource document in Firestore
        await createSubcollectionDocument('courses', courseId, 'modules', moduleId, 'resources', {
          title: title,
          description: description,
          uploadedBy: user.uid,
          uploadDate: serverTimestamp(),
          downloadUrl: uploadResult.downloadUrl, // Get the URL from the upload result
          filePath: uploadResult.filePath // The path to the file in storage (for later deletion)
        });
      }

      // After successful upload, redirect the user (e.g., to the module details page or resource list)
      router.push(`/courses/${courseId}/modules/${moduleId}/resources`);
    } catch (error) {
      console.error("Error uploading resource:", error);
      setError(error.message || 'An error occurred during upload.');
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  // Authorization
  useEffect(() => {
    if (user && user.userType !== 'teacher') {
      // ... Redirect if not a teacher
      router.push('/');
    }
  }, [user, router]);

  return (
    <Box sx={{ mt: 2 }}>
      {/* Upload Form */}
      <Typography variant="h4" align="center" gutterBottom>
        Upload a New Resource
      </Typography>
      <form onSubmit={handleSubmit}>
        {/* Form Inputs */}
        <TextField
          label="Title"
          value={title}
          onChange={handleTitleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Description"
          value={description}
          onChange={handleDescriptionChange}
          fullWidth
          multiline
          rows={4}
          margin="normal"
        />
        {/* Dropzone */}
        <Box {...getRootProps()} sx={{ border: '2px dashed #ccc', padding: '20px', textAlign: 'center', cursor: 'pointer' }}>
          <input {...getInputProps()} />
          {isDragActive ? (
            <Typography variant="body1">Drop the file here...</Typography>
          ) : (
            <Typography variant="body1">Drag and drop a file here, or click to select a file</Typography>
          )}
        </Box>
        {/* File Preview (Optional) */}
        {file && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            Selected file: {file.name}
          </Typography>
        )}
        <div>
          {uploadProgress > 0 && uploadProgress < 100 && (
            <LinearProgress variant="determinate" value={uploadProgress} />
          )}
        </div>
        {/* Submit Button with Loading State */}
        {isLoading && (
          <Button variant="contained" disabled>
            <CircularProgress size={20} />
          </Button>
        )}
        {!isLoading && (
          <Button variant="contained" type="submit">
            Upload Resource
          </Button>
        )}
      </form>
      {error && (
        <Alert severity="error">
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default ResourceUploadPage;

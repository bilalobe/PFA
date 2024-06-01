import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { uploadResource } from '../../actions/resourceActions';
import {
  Button,
  TextField,
  Box,
  Typography,
  CircularProgress,
  Alert,
  LinearProgress,
  IconButton,
  Snackbar,
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import ClearIcon from '@mui/icons-material/Clear';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

const validationSchema = Yup.object().shape({
  title: Yup.string().required('Title is required'),
  description: Yup.string().required('Description is required'),
  file: Yup.mixed().required('File is required'),
});

function UploadResourceForm({ moduleId }) {
  const dispatch = useDispatch();
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');
  const loading = useSelector(state => state.resource.loading);
  const success = useSelector(state => state.resource.success);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      if (selectedFile && selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        setFilePreview(null);
      }
      setUploadError(null); // Clear error message on new upload
    },
  });

  const handleClearFile = () => {
    setFile(null);
    setFilePreview(null);
  };

  const handleSubmit = async (values, { resetForm }) => {
    setUploadError(null); // Clear error message on new upload
    setUploadProgress(0);
    if (!file) {
      setUploadError('File is required.');
      return;
    }
    const formData = new FormData();
    formData.append('title', values.title);
    formData.append('description', values.description);
    formData.append('file', file);
    formData.append('module', moduleId); // Assuming you send the module id in the formData
    try {
      await dispatch(uploadResource(formData, {
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        },
      }));
      resetForm();
      handleClearFile();
      setSuccessMessage(`Resource "${values.title}" uploaded successfully!`);
      setOpenSnackbar(true);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to upload resource. Please try again.';
      setUploadError(errorMsg);
      setOpenSnackbar(true);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Upload New Resource
      </Typography>
      <Formik
        initialValues={{ title: '', description: '' }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, handleChange, handleSubmit }) => (
          <Form onSubmit={handleSubmit}>
            {loading && <CircularProgress />}
            {uploadError && (
              <Snackbar open={!!uploadError} autoHideDuration={6000} onClose={() => setUploadError(null)}>
                <Alert onClose={() => setUploadError(null)} severity="error" sx={{ mb: 2 }}>{uploadError}</Alert>
              </Snackbar>
            )}
            {successMessage && (
              <Snackbar open={!!successMessage} autoHideDuration={6000} onClose={() => setSuccessMessage('')}>
                <Alert onClose={() => setSuccessMessage('')} severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>
              </Snackbar>
            )}
            <TextField
              label="Title"
              variant="outlined"
              fullWidth
              margin="normal"
              name="title"
              value={values.title}
              onChange={handleChange}
              error={touched.title && Boolean(errors.title)}
              helperText={touched.title && errors.title}
              aria-label="Resource title"
            />
            <TextField
              label="Description"
              variant="outlined"
              fullWidth
              margin="normal"
              multiline
              rows={4}
              name="description"
              value={values.description}
              onChange={handleChange}
              error={touched.description && Boolean(errors.description)}
              helperText={touched.description && errors.description}
              aria-label="Resource description"
            />
            <Box {...getRootProps({ className: 'dropzone' })} sx={{ border: '2px dashed #ccc', padding: 2, textAlign: 'center', margin: '16px 0' }}>
              <input {...getInputProps()} aria-label="File drop area" />
              {!file ? <Typography>Drag and drop a file here, or click to select a file</Typography> : (
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  {filePreview ? (
                    <img src={filePreview} alt="File preview" style={{ maxWidth: '100%', maxHeight: '200px' }} />
                  ) : <InsertDriveFileIcon style={{ fontSize: 40 }} />}
                  <IconButton onClick={handleClearFile} aria-label="Clear file">
                    <ClearIcon />
                  </IconButton>
                </Box>
              )}
            </Box>
            {uploadProgress > 0 && <LinearProgress variant="determinate" value={uploadProgress} sx={{ mb: 2 }} />}
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ mt: 2 }}
              disabled={loading}
              aria-label="Upload resource"
            >
              Upload
            </Button>
          </Form>
        )}
      </Formik>
    </Box>
  );
}

export default UploadResourceForm;

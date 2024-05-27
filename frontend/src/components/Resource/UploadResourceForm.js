import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { uploadResource } from '../../actions/resourceActions'; 
import { Button, TextField, Box, Typography, CircularProgress, Alert } from '@mui/material';

function UploadResourceForm({ moduleId }) {
  const dispatch = useDispatch();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  
  const loading = useSelector(state => state.resource.loading);
  const error = useSelector(state => state.resource.error);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('file', file);
    formData.append('module', moduleId);
    dispatch(uploadResource(formData));
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
      <Typography variant="h5" component="div" gutterBottom>
        Upload New Resource
      </Typography>
      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}
      <TextField
        label="Title"
        variant="outlined"
        fullWidth
        margin="normal"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <TextField
        label="Description"
        variant="outlined"
        fullWidth
        margin="normal"
        multiline
        rows={4}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <TextField
        type="file"
        fullWidth
        margin="normal"
        onChange={handleFileChange}
      />
      <Button
        type="submit"
        variant="contained"
        color="primary"
        sx={{ mt: 2 }}
      >
        Upload
      </Button>
    </Box>
  );
}

export default UploadResourceForm;

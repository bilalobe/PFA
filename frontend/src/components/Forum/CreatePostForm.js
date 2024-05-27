import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createForumPost } from '../../actions/forumActions'; 
import { Button, TextField, Box, Typography, CircularProgress, Alert } from '@mui/material';

function CreatePostForm({ courseId }) {
  const dispatch = useDispatch();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const loading = useSelector(state => state.forum.loading);
  const error = useSelector(state => state.forum.error);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(createForumPost(courseId, title, content));
    setTitle('');
    setContent('');
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
      <Typography variant="h5" component="div" gutterBottom>
        Create New Post
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
        label="Content"
        variant="outlined"
        fullWidth
        margin="normal"
        multiline
        rows={4}
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <Button
        type="submit"
        variant="contained"
        color="primary"
        sx={{ mt: 2 }}
      >
        Create Post
      </Button>
    </Box>
  );
}

export default CreatePostForm;

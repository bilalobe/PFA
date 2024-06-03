import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchForumPosts } from '../../actions/forumActions';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Avatar,
  Typography,
  TextField,
  CircularProgress,
  Pagination,
  Alert,
  Button
} from '@mui/material';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import Fuse from 'fuse.js';

function ForumList({ courseId }) {
  const dispatch = useDispatch();
  const { forumPosts, loading, error } = useSelector(state => state.forum);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(fetchForumPosts(courseId)).catch(err => {
      console.error("Failed to fetch forum posts:", err);
    });
  }, [dispatch, courseId]);

  const itemsPerPage = 10;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const fuse = new Fuse(forumPosts, { keys: ['title', 'author.username', 'content'], includeScore: true });
  const searchResults = searchQuery ? fuse.search(searchQuery).map(result => result.item) : forumPosts;
  const paginatedPosts = searchQuery ? searchResults.slice(startIndex, endIndex) : forumPosts.slice(startIndex, endIndex);

  return (
    <Box sx={{ mt: 4 }}>
      <TextField
        fullWidth
        label="Search"
        variant="outlined"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        aria-label="Search posts"
        sx={{ mb: 2 }}
      />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <CircularProgress aria-label="Loading forum posts" />
        </Box>
      ) : error ? (
        <Box sx={{ mt: 2 }}>
          <Alert severity="error" aria-label="Error loading forum posts">
            {error}
          </Alert>
        </Box>
      ) : (
        <Grid container spacing={4}>
          {paginatedPosts.map((post) => (
            <Grid item xs={12} md={6} lg={4} key={post.id}>
              <Card>
                {post.author.image && (
                  <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                    <Avatar src={post.author.image} alt={post.author.username} sx={{ mr: 2 }} />
                    <Typography>{post.author.username}</Typography>
                  </Box>
                )}
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {post.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {format(new Date(post.created_at), 'PPP')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {post.content.slice(0, 100)}...
                  </Typography>
                  <Button component={Link} to={`/forums/${post.id}`} variant="contained" color="primary" sx={{ mt: 2 }}>
                    Read More
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Pagination
        count={Math.ceil((searchQuery ? searchResults : forumPosts).length / itemsPerPage)}
        page={currentPage}
        onChange={(e, value) => setCurrentPage(value)}
        color="primary"
        shape="rounded"
        size="large"
        showFirstButton
        showLastButton
        aria-label="Pagination Navigation"
        sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}
      />
    </Box>
  );
}

export default ForumList;

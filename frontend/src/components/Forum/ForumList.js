import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchForumPosts } from '../../actions/forumActions';
import { Box, Grid, Card, CardContent, CardMedia, Typography, TextField, CircularProgress, Pagination, Button, Avatar } from '@mui/material';
import { format } from 'date-fns';
import Fuse from 'fuse.js';

function ForumList({ courseId }) {
  const dispatch = useDispatch();
  const forumPosts = useSelector(state => state.forum.forumPosts);
  const loading = useSelector(state => state.forum.loading);
  const error = useSelector(state => state.forum.error);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(fetchForumPosts(courseId));
  }, [dispatch, courseId]);

  const itemsPerPage = 10;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPosts = forumPosts.slice(startIndex, endIndex);

  const fuse = new Fuse(forumPosts, { keys: ['title', 'author.username', 'content'], includeScore: true });
  const searchResults = searchQuery ? fuse.search(searchQuery).map(result => result.item) : paginatedPosts;

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
        <CircularProgress />
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <Grid container spacing={4}>
          {searchResults.map((post) => (
            <Grid item xs={12} md={6} lg={4} key={post.id}>
              <Card>
                {post.author.image && (
                  <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                    <Avatar src={post.author.image} alt={post.author.username} sx={{ mr: 2 }} />
                    <Typography>{post.author.username}</Typography>
                  </Box>
                )}
                <CardContent>
                  <Typography variant="h6" gutterBottom>{post.title}</Typography>
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
        count={Math.ceil(forumPosts.length / itemsPerPage)}
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

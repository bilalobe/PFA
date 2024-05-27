import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchForumPosts } from '../../actions/forumActions'; 
import { Typography, Card, CardContent, CircularProgress, Alert, Grid } from '@mui/material';

function ForumList({ courseId }) { 
  const dispatch = useDispatch();
  const forumPosts = useSelector(state => state.forum.forumPosts);
  const loading = useSelector(state => state.forum.loading);
  const error = useSelector(state => state.forum.error);

  useEffect(() => {
    dispatch(fetchForumPosts(courseId));
  }, [dispatch, courseId]);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <div>
      <Typography variant="h4" component="div" gutterBottom>
        Forum
      </Typography>
      <Grid container spacing={2}>
        {forumPosts.map(post => (
          <Grid item xs={12} key={post.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="div">
                  {post.title}
                </Typography>
                <Typography variant="body2" component="div">
                  {post.content}
                </Typography>
                <Typography variant="caption" color="textSecondary" component="div">
                  by {post.author_username} on {new Date(post.created_at).toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
}

export default ForumList;

import React from 'react';
import { Box, Typography, Card, CardContent, Avatar, Button, Link } from '@mui/material';
import Comment from './Comment';
import CommentList from './CommentList';

function Post({ post }) {
  return (
    <Card sx={{ boxShadow: 3, '&:hover': { boxShadow: 6 }, mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar src={post.authorAvatar || 'path/to/placeholder.jpg'} alt={post.authorName} sx={{ mr: 2 }} />
          <Box>
            <Typography variant="h6" component="div">
              {post.title}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              by {post.authorUsername} {formatDistanceToNow(new Date(post.createdAt))} ago
            </Typography>
          </Box>
        </Box>
        <Typography variant="body2" component="p">
          {post.content.length > 100 ? `${post.content.slice(0, 100)}...` : post.content}
        </Typography>
        {post.content.length > 100 && (
          <Link to={`/posts/${post.id}`}>
            <Button size="small">Read More</Button>
          </Link>
        )}
        <Comment postId={post.id} />
        <CommentList postId={post.id} />
      </CardContent>
    </Card>
  );
}

export default Post;

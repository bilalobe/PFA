import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchComments } from '../../actions/commentActions';
import { List, ListItem, ListItemText, Divider, CircularProgress, Alert, Typography } from '@mui/material';
import io from 'socket.io-client';

const socket = io('http://localhost:8000');  // Adjust port if needed

function CommentList({ postId }) {
  const dispatch = useDispatch();
  const { comments, loading, error } = useSelector((state) => state.comment);

  useEffect(() => {
    dispatch(fetchComments(postId));

    socket.emit('join_post', { postId });

    socket.on('new_comment', (comment) => {
      dispatch({ type: 'RECEIVE_NEW_COMMENT', payload: comment });
    });

    return () => {
      socket.emit('leave_post', { postId });
      socket.off('new_comment');
    };
  }, [dispatch, postId]);

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <List>
      {comments.map((comment) => (
        <React.Fragment key={comment.id}>
          <ListItem alignItems="flex-start">
            <ListItemText
              primary={comment.user}
              secondary={
                <React.Fragment>
                  <Typography component="span" variant="body2" color="textPrimary">
                    {comment.user}
                  </Typography>
                  {" - "}
                  {comment.content}
                  <br />
                  <Typography component="span" variant="body2" color="textSecondary">
                    {new Date(comment.timestamp).toLocaleString()}
                  </Typography>
                </React.Fragment>
              }
            />
          </ListItem>
          <Divider component="li" />
        </React.Fragment>
      ))}
    </List>
  );
}

export default CommentList;

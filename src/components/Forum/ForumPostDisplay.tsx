// components/Forum/ForumPostDisplay.tsx
import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Collapse,
  List,
  ListItem,
  ListItemText,
  Alert,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { ForumPost, Comment } from '../../types';
import { useFirestoreCollectionData } from '../../hooks/useFirestore';
import { collection, orderBy, query, where } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useAuth } from '../../hooks/useAuth';

interface ForumPostDisplayProps {
  post: ForumPost;
  forumId: string;
  threadId: string;
  courseId: string;
  onCommentSubmit: (postId: string) => void; // Function to handle comment submission
}

const ForumPostDisplay: React.FC<ForumPostDisplayProps> = ({ post, forumId, threadId, courseId, onCommentSubmit }) => {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');

  const commentsQuery = query(
    collection(db, `courses/${courseId}/forums/${forumId}/threads/${threadId}/posts/${post.id}/comments`),
    orderBy('createdAt', 'asc')
  );
  const { data: fetchedComments, loading: commentsLoading, error: commentsError } =
    useFirestoreCollectionData<Comment>(commentsQuery.toString());

  useEffect(() => {
    if (fetchedComments) {
      setComments(fetchedComments);
    }
  }, [fetchedComments]);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewComment(e.target.value);
  };

  const handleCommentSubmit = () => {
    onCommentSubmit(post.id);
    setNewComment('');
  };

  if (commentsLoading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {post.content}
          </Typography>
          <CircularProgress />
        </CardContent>
      </Card>
    );
  }

  if (commentsError) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {post.content}
          </Typography>
          <Alert severity="error">An error occurred while fetching comments.</Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ mt: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {post.content}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          By: {post.author}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Posted on: {new Date(post.createdAt).toLocaleDateString()}
        </Typography>
        <IconButton onClick={handleExpandClick}>
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </CardContent>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          <List>
            {comments.map((comment) => (
              <ListItem key={comment.id}>
                <ListItemText
                  primary={`By: ${comment.author}`}
                  secondary={comment.content}
                />
              </ListItem>
            ))}
          </List>
          {user && (
            <Box sx={{ mt: 2 }}>
              <TextField
                label="Add a Comment"
                value={newComment}
                onChange={handleCommentChange}
                fullWidth
                multiline
                rows={2}
              />
              <Button variant="contained" onClick={handleCommentSubmit} sx={{ mt: 1 }}>
                Post Comment
              </Button>
            </Box>
          )}
        </CardContent>
      </Collapse>
    </Card>
  );
};

export default ForumPostDisplay;

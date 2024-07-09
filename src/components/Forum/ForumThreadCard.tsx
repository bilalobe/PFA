import { useEffect, useState } from 'react';
import {
  Typography,
  Collapse,
  IconButton,
  CardContent,
  Card,
  CircularProgress,
  Alert,
  Button,
  Link,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { Thread, Reply } from '../../interfaces/types';
import { useFirestoreCollectionData } from '../../hooks/useFirestore';
import { collection, orderBy, query } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useAuth } from '../../hooks/useAuth';

interface ForumThreadCardProps {
  thread: Thread;
  forumId: string;
  courseId: string;
}

const ForumThreadCard: React.FC<ForumThreadCardProps> = ({ thread, forumId, courseId }) => {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [replies, setReplies] = useState<Reply[]>([]);

  const repliesQuery = query(
    query(collection(db, `courses/${courseId}/forums/${forumId}/threads/${thread.id}/replies`)),
    orderBy('createdAt', 'asc')
  );
  const { data: fetchedReplies, loading: repliesLoading, error: repliesError } =
    useFirestoreCollectionData<Reply>(repliesQuery.toString());

  useEffect(() => {
    if (fetchedReplies) {
      setReplies(fetchedReplies);
    }
  }, [fetchedReplies]);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  if (repliesLoading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {thread.title}
          </Typography>
          <CircularProgress />
        </CardContent>
      </Card>
    );
  }

  if (repliesError) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {thread.title}
          </Typography>
          <Alert severity="error">An error occurred while fetching replies.</Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {thread.title}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {thread.content}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          By: {thread.author}
        </Typography>
        <IconButton onClick={handleExpandClick}>
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </CardContent>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          <List>
            {replies.map((reply) => (
              <ListItem key={reply.id}>
                <ListItemText
                  primary={`By: ${reply.author}`}
                  secondary={reply.content}
                />
              </ListItem>
            ))}
          </List>
          {user && (
            <Link href={`/forums/${forumId}/threads/${thread.id}/reply?courseId=${courseId}`}>
              <Button variant="contained" fullWidth>
                Reply to Thread
              </Button>
            </Link>
          )}
        </CardContent>
      </Collapse>
    </Card>
  );
};

export default ForumThreadCard;

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Collapse,
  List,
  ListItem,
  ListItemText,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { Forum, Thread, User } from '../../interfaces/types';
import { useFirestoreCollectionData } from '../../hooks/useFirestore';
import { collectionGroup, orderBy, query, where } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import Link from 'next/link';

interface ForumCardProps {
  forum: Forum;
user: User | null;
}

const ForumCard: React.FC<ForumCardProps> = ({ forum, user }) => {
  const [expanded, setExpanded] = useState(false);
  const [threads, setThreads] = useState<Thread[]>([]);

  const threadsQuery = query(
    collectionGroup(db, `threads`),
    where('forumId', '==', forum.id),
    orderBy('createdAt', 'desc')
  );
  const { data: fetchedThreads, loading: threadsLoading, error: threadsError } =
    useFirestoreCollectionData<Thread>(threadsQuery.toString());

  useEffect(() => {
    if (fetchedThreads) {
      setThreads(fetchedThreads);
    }
  }, [fetchedThreads]);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  if (threadsLoading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {forum.title}
          </Typography>
          <CircularProgress />
        </CardContent>
      </Card>
    );
  }

  if (threadsError) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {forum.title}
          </Typography>
          <Alert severity="error">An error occurred while fetching threads.</Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {forum.title}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {forum.description}
        </Typography>
        <IconButton onClick={handleExpandClick}>
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </CardContent>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          <List>
            {threads.map((thread) => (
              <ListItem key={thread.id}>
                <ListItemText
                  primary={thread.title}
                  secondary={`By ${thread.author}`}
                />
                <Link href={`/forums/${forum.id}/threads/${thread.id}`}>
                  <Button variant="contained" size="small">
                    View Thread
                  </Button>
                </Link>
              </ListItem>
            ))}
          </List>
          {user && (
            <Link href={`/forums/${forum.id}/threads/create`}>
              <Button variant="contained" fullWidth>
                Create New Thread
              </Button>
            </Link>
          )}
        </CardContent>
      </Collapse>
    </Card>
  );
};

export default ForumCard;

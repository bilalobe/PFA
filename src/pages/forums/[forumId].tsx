// pages/forums/[forumId].tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useFirestoreDocument, useFirestoreCollectionData } from '../../hooks/useFirestore';
import { useAuth } from '../../hooks/useAuth';
import Link from 'next/link';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Button,
  Divider
} from '@mui/material';
import { Forum, Thread } from '../../types';
import { collection, orderBy, query, where } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

// Components (You'll need to create these)
import ForumThreadCard from '../../components/Forum/ForumThreadCard.tsx';
import CreateThreadForm from '../../components/Forum/CreateThreadForm';

const ForumDetailsPage: React.FC = () => {
  const router = useRouter();
  const { forumId, courseId } = router.query;
  const { user } = useAuth();

  // Fetch Forum Details
  const { docData: forum, loading: forumLoading, error: forumError } =
    useFirestoreDocument(`courses/${courseId}/forums/${forumId}`);

  // Fetch Threads for the Forum
  const threadsQuery = query(
    collection(db, `courses/${courseId}/forums/${forumId}/threads`),
    orderBy('createdAt', 'desc')
  );
  const { data: threads, loading: threadsLoading, error: threadsError } =
    useFirestoreCollectionData(threadsQuery.toString());

  if (forumLoading || threadsLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (forumError || threadsError) {
    // Handle error
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Alert severity="error">An error occurred while fetching forum data. Please try again later.</Alert>
      </Box>
    );
  }

  // Handle case where forum data is not available
  if (!forum) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Alert severity="error">Forum not found.</Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Forum Title and Description */}
      <Typography variant="h4" align="center" gutterBottom>
        {forum.title}
      </Typography>
      <Typography variant="body1" align="center" gutterBottom>
        {forum.description}
      </Typography>

      <Divider sx={{ my: 2 }} />

      {/* Create Thread Button (for authenticated users) */}
      {user && (
        <Button variant="contained" component={Link} href={`/forums/${forumId}/create-thread?courseId=${courseId}`}>
          Create New Thread
        </Button>
      )}

      {/* Threads List */}
      {threads.length === 0 ? (
        <Typography variant="body1" align="center" gutterBottom>
          No threads yet. Start a discussion!
        </Typography>
      ) : (
        <List>
          {threads.map((thread: Thread) => (
            <ListItem key={thread.id}>
              {/* Make sure ForumThreadCard receives necessary props: thread, forumId, etc. */}
              <ForumThreadCard thread={thread} forumId={forumId} courseId={courseId} />
            </ListItem>
          ))}
        </List>
      )}

      {/* Conditionally Display CreateThreadForm */}
      {/* ... (add your logic for when to show this) ...  */}
    </Box>
  );
};

export default ForumDetailsPage;

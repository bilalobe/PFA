import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useFirestoreDocument } from '../../../hooks/useFirestore';
import { useAuth } from '../../../hooks/useAuth';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  List,
  ListItem,
  TextField,
  Button,
  Pagination,
  IconButton,
  Tooltip,
  Modal,
} from '@mui/material';
import { ForumPost, User } from '../../../interfaces/types';
import {
  collection,
  orderBy,
  query,
  addDoc,
  serverTimestamp,
  getDocs,
  limit,
  startAfter,
  Query,
  DocumentData,
} from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import ForumPostDisplay from '../../../components/Forum/ForumPostDisplay'; // Adjust path if needed
import { moderationApi } from '../../../utils/api'; // Assuming you have a moderationApi

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const ForumThreadPage = () => {
  const router = useRouter();
  const { forumId, threadId, courseId } = router.query;
  const { user } = useAuth();

  const { docData: thread, loading: threadLoading, error: threadError } = useFirestoreDocument(`courses/${courseId}/forums/${forumId}/threads/${threadId}`);

  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [lastVisible, setLastVisible] = useState<any | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(10); // Adjust as needed

  const fetchPosts = useCallback(async () => {
    try {
      let postsQuery = query(
        collection(db, `courses/${courseId}/forums/${forumId}/threads/${threadId}/posts`) as unknown as Query<DocumentData>,
        orderBy('createdAt', 'asc'),
        limit(postsPerPage)
      );

      if (lastVisible) {
        postsQuery = query(postsQuery, startAfter(lastVisible));
      }

      const querySnapshot = await getDocs(postsQuery);
      const fetchedPosts = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPosts((prevPosts) => [...prevPosts, ...fetchedPosts] as ForumPost[]);
      setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  }, [lastVisible, postsPerPage, courseId, forumId, threadId]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // State for New Comment Form
  const [newComment, setNewComment] = useState('');

  // Handle Comment Submission
  const handleCommentSubmit = async (postId: string) => {
    if (newComment.trim() === '') {
      return;
    }

    try {
      const commentsRef = collection(db, `courses/${courseId}/forums/${forumId}/threads/${threadId}/posts/${postId}/comments`);
      await addDoc(commentsRef, {
        postId: postId,
        content: newComment,
        author: user?.uid,
        createdAt: serverTimestamp()
      });

      setNewComment('');

    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  // Handle Pagination
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
    if (value > currentPage) {
      fetchPosts();
    }
  };

  // Moderation Features
  const [, setShowModerationOptions] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleModerationClick = (user: User) => {
    setSelectedUser(user);
    handleOpen();
  };

  const handleCloseModerationOptions = () => {
    setShowModerationOptions(false);
    setSelectedUser(null);
    handleClose();
  };

  const handleWarnUser = async () => {
    if (selectedUser) {
      try {
        await moderationApi.warnUser(selectedUser.uid);
        handleCloseModerationOptions();
      } catch (error) {
        console.error("Error warning user:", error);
      }
    }
  };

  const handleBanUser = async () => {
    if (selectedUser) {
      try {
        await moderationApi.banUser(selectedUser.uid);
        handleCloseModerationOptions();
      } catch (error) {
        console.error("Error banning user:", error);
      }
    }
  };

  // ... Loading and Error State Handling ...
  if (threadLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (threadError) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Alert severity="error">An error occurred while fetching forum data. Please try again later.</Alert>
      </Box>
    );
  }

  if (!thread || !posts) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Alert severity="error">Thread not found.</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" align="center" gutterBottom>
        {thread.title}
      </Typography>

      {/* List of Posts in the Thread */}
      <List>
        {(posts as ForumPost[]).map((post: ForumPost) => (
          <ListItem key={post.id} sx={{ mb: 3 }}>
            <ForumPostDisplay post={post} forumId={''} threadId={''} courseId={''} onCommentSubmit={function (postId: string): void {
              throw new Error('Function not implemented.');
            } } />
            {/* Moderation Options (for authorized users) */}
            {user && user.userType === 'teacher' && (
              <Tooltip title="Moderation Options">
                <IconButton onClick={() => handleModerationClick(post.author)}>
                  {/* ... Use a suitable icon for moderation options ... */}
                </IconButton>
              </Tooltip>
            )}

            {/* Comment Form */}
            <Box sx={{ mt: 2 }}>
              <TextField
                label="Add a Comment"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                fullWidth
                multiline
                rows={2}
              />
              <Button variant="contained" onClick={() => handleCommentSubmit(post.id)} sx={{ mt: 1 }}>
                Post Comment
              </Button>
            </Box>
          </ListItem>
        ))}
      </List>

      {/* Pagination */}
      {posts.length > postsPerPage && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Pagination
            count={Math.ceil(posts.length / postsPerPage)}
            page={currentPage}
            onChange={handlePageChange}
          />
        </Box>
      )}

      {/* Moderation Options Modal (or similar) */}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Moderation Options for {selectedUser?.displayName}
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            Choose an action:
          </Typography>
          <Button variant="contained" onClick={handleWarnUser} sx={{ mt: 2 }}>
            Warn User
          </Button>
          <Button variant="contained" color="error" onClick={handleBanUser} sx={{ mt: 2 }}>
            Ban User
          </Button>
          <Button variant="outlined" onClick={handleCloseModerationOptions} sx={{ mt: 2 }}>
            Cancel
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default ForumThreadPage;

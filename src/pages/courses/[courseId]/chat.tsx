import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../hooks/useAuth';
import { useFirestore, useFirestoreCollectionData } from '../../../hooks/useFirestore';
import { collection, addDoc, serverTimestamp, orderBy, query, where } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import { Box, TextField, Button, Typography, List, ListItem, ListItemText, CircularProgress, Alert, Pagination } from '@mui/material';
import { ChatMessage } from '../../../types'; // Make sure you have this in your types
import { useMemo, useCallback } from 'react';

// ... (Other imports for styling)

const CourseChatPage = () => {
  const router = useRouter();
  const { courseId } = router.query;
  const { user } = useAuth();
  const { createDocument } = useFirestore();
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const chatContainerRef = useRef(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [messagesPerPage] = useState(10); // Adjust as needed
  const [lastVisible, setLastVisible] = useState<any | null>(null);

  // Fetch Existing Messages from Firestore (Real-time updates)
  useEffect(() => {
    if (courseId && user) {
      const unsubscribe = db.collection('chatRooms')
        .doc(`course_${courseId}`) // Get the chat room document for the course
        .collection('messages')
        .orderBy('timestamp', 'asc') // Order messages by timestamp
        .onSnapshot((snapshot) => {
          // Update messages state
          setMessages(snapshot.docs.map((doc) => doc.data()));
        });

      return () => unsubscribe(); // Clean up the listener when the component unmounts
    }
  }, [courseId, user]);

  // Fetch Messages with Pagination
  const fetchMessages = useCallback(async () => {
    try {
      let messagesQuery = query(
        db.collection('chatRooms')
          .doc(`course_${courseId}`)
          .collection('messages'),
        orderBy('timestamp', 'asc'),
        limit(messagesPerPage)
      );

      if (lastVisible) {
        messagesQuery = query(messagesQuery, startAfter(lastVisible));
      }

      const querySnapshot = await getDocs(messagesQuery);
      const fetchedMessages = querySnapshot.docs.map((doc) => doc.data());
      setMessages((prevMessages) => [...prevMessages, ...fetchedMessages]);
      setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, [lastVisible, messagesPerPage, courseId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Handle Sending a New Message to Firestore
  const handleSendMessage = async () => {
    if (newMessage.trim() !== '' && courseId && user) {
      try {
        await createDocument(`chatRooms/course_${courseId}/messages`, {
          sender: user.uid,
          message: newMessage,
          timestamp: serverTimestamp()
        });
        setNewMessage(''); // Clear the input field
        // Focus on the input field again after sending
        if (inputRef.current) {
          inputRef.current.focus();
        }
      } catch (error) {
        // Handle the error and provide user feedback
        console.error('Error sending message:', error);
      }
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Pagination
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
    if (value > currentPage) {
      fetchMessages();
    }
  };

  // ... (Other UI elements)

  return (
    <Box>
      <Typography variant="h4" align="center" gutterBottom>
        Chat for Course: {/* ... Display the course title (you may need to fetch it separately) */}
      </Typography>

      {/* Chat Messages */}
      <Box ref={chatContainerRef} sx={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}>
        <List>
          {messages.map((message: ChatMessage, index) => (
            <ListItem key={index}>
              <ListItemText
                primary={<Typography variant="body1">{message.sender}:</Typography>}
                secondary={<Typography variant="body2">{message.message}</Typography>}
              />
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Input Field and Button */}
      <Box sx={{ mt: 2, display: 'flex' }}>
        <TextField
          label="Enter your message"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          fullWidth
          inputRef={inputRef}
        />
        <Button variant="contained" onClick={handleSendMessage} sx={{ ml: 1 }}>
          Send
        </Button>
      </Box>

      {/* Pagination */}
      {messages.length > messagesPerPage && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Pagination
            count={Math.ceil(messages.length / messagesPerPage)}
            page={currentPage}
            onChange={handlePageChange}
          />
        </Box>
      )}
    </Box>
  );
};

export default CourseChatPage;

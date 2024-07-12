import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../hooks/useAuth';
import { useFirestore, useFirestoreDocument } from '../../../hooks/useFirestore';
import {
  Box,
  TextField,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
} from '@mui/material';
import { ChatMessage } from '../../../interfaces/types';
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  FirestoreError,
  collectionGroup,
} from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import io from 'socket.io-client';

// The URL of your socket.io server
const socket = io('http://localhost:5000');

const PrivateChat: React.FC = () => {
  const router = useRouter();
  const { userId } = router.query;
  const { user: currentUser } = useAuth();
  useFirestore<ChatMessage>('chatRooms');

  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Get other user's display name (adapt this based on your data model!)
  const { docData: otherUser } = useFirestoreDocument(`users/${userId}`);

  // Dynamic Chat Room ID
  const chatRoomId = useMemo(() => {
    // Create a unique ID that's consistent regardless of the user initiating the chat.
    if (currentUser && userId && typeof userId === 'string') {
      // Sort user IDs to make room name consistent
      const sortedIds = [currentUser.uid, userId].sort();
      return `private-${sortedIds[0]}-${sortedIds[1]}`;
    }
    return null;
  }, [userId, currentUser?.uid]);

  // Retrieve Chat Messages
  useEffect(() => {
    if (chatRoomId) {
      const messagesQuery = query(
        collectionGroup(db, 'messages'),
        orderBy('createdAt', 'asc')
      );

      const unsubscribe = onSnapshot(
        messagesQuery,
        (snapshot) => {
          const messagesData = snapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
          })) as unknown as ChatMessage[];
          setMessages(messagesData);
          setLoading(false);
        },
        (error: FirestoreError) => {
          console.error('Error getting chat messages:', error);
          setError('Could not load messages.');
          setLoading(false);
        }
      );

      // Cleanup listener
      return () => unsubscribe();
    }
    return;
  }, [chatRoomId]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Join the Chat Room
  useEffect(() => {
    if (currentUser && chatRoomId) {
      // Join the room through socket.io
      socket.emit('join', { roomId: chatRoomId });

      // Listen for typing indicators
      socket.on('typing', (data: any) => {
        if (data.user !== currentUser.uid) {
          // Ignore your own typing events
          console.log(data.user + (data.isTyping ? ' is typing...' : ' stopped typing'));
          // ... (Implement logic to display typing indicator to the user) ...
        }
      });

      return () => {
        // Leave the room
        socket.emit('leave', { roomId: chatRoomId });
      };
    }
    return;
  }, [currentUser, chatRoomId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    socket.emit('typing', { isTyping: true, roomId: chatRoomId });
  };

  // Handle sending a message
  const handleSendMessage = async (event: React.FormEvent) => {
    event.preventDefault();

    // Basic input validation
    if (newMessage.trim() === '') {
      return;
    }

    if (!currentUser) {
      setError('User not logged in.');
      return;
    }

    try {
      const messagePayload: ChatMessage = {
        sender: 'user',
        message: newMessage,
        roomId: chatRoomId!,
        createdAt: serverTimestamp(),
      };

      // Add the new message to the messages collection
      await addDoc(
        collection(db, 'chatRooms', chatRoomId!, 'messages'),
        messagePayload
      );
      setNewMessage('');
    } catch (error: any) {
      // Handle the error
      console.error('Error sending message:', error);
      setError('Error sending message.');
    }
    return;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!currentUser) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Typography variant="h5">Please log in to chat.</Typography>
      </Box>
    );
  }

  if (!chatRoomId) {
    // Handle the case where the chat room ID is missing
    // ... You might want to redirect the user or display an error message
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Typography variant="h5">Chat room not found.</Typography>
      </Box>
    );
  }

  // Ensure the other user exists before displaying the chat
  if (!otherUser) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Typography variant="h5">User not found.</Typography>
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      height="100vh"
      padding={2}
      ref={chatContainerRef}
    >
      <Typography variant="h5">Chat with {otherUser?.username}</Typography>
      <List sx={{ flexGrow: 1, overflowY: 'auto' }}>
        {messages.map((message) => (
          <ListItem key={message.id}>
            <ListItemText
              primary={<Typography variant="body1">{message.message}</Typography>}
              secondary={
                message.createdAt && (
                  <Typography variant="caption">
                    {new Date(message.createdAt.seconds * 1000).toLocaleString()}
                  </Typography>
                )
              }
            />
          </ListItem>
        ))}
      </List>
      <Box display="flex" alignItems="center" mt={2}>
        <TextField
          fullWidth
          value={newMessage}
          onChange={handleInputChange}
          placeholder="Type your message..."
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSendMessage}
          disabled={newMessage.trim() === ''}
        >
          Send
        </Button>
      </Box>
    </Box>
  );
};

export default PrivateChat;

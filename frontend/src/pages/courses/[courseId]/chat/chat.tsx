import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';
import { joinChatRoom, leaveChatRoom, sendChatMessage } from '@/types/features/chat-function/chatSlice';
import { Typography, TextField, Button, List, ListItem, ListItemText, Box } from '@mui/material';
import io from 'socket.io-client';
import { RootState } from '@/types/store';

const socket = io('http://localhost:8000');

function CourseChat() {
  const router = useRouter();
  const { courseId } = router.query;
  const dispatch = useDispatch();
  const messages = useSelector((state: RootState) => state.chat.messages);
  const user = useSelector((state: RootState) => state.auth.user);
  const [newMessage, setNewMessage] = useState('');
  const chatContainerRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (courseId && user) {
      dispatch(joinChatRoom({
        roomId: `course_${courseId}`,
        username: ''
      }));

      socket.on('chat_message', (message) => {
        // Assuming there's a function to handle receiving a chat message that's not part of the redux slice
        // For example, updating the local state or another method to handle the incoming message
      });

      // Scroll to the bottom when a new message is received
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }

      return () => {
        dispatch(leaveChatRoom());
        socket.off('chat_message');
      };
    }
  }, [courseId, dispatch, user]);

  const handleSendMessage = () => {
    if (newMessage.trim() !== '' && user) {
      const message = {
        message: newMessage,
        roomId: `course_${courseId}`,
        sender: user.username,
      };
      socket.emit('chat_message', message);
      dispatch(sendChatMessage(message));
      setNewMessage('');
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(event.target.value);
    // Assuming there's a method to handle typing indicator that's not part of the redux slice
    // For example, emitting a socket event for typing indication
  };

  return (
    <Box>
      <Typography variant="h4">Course Chat</Typography>
      <List ref={chatContainerRef}>
        {messages.map((message, index) => (
          <ListItem key={index}>
            <ListItemText primary={`${message.sender}: ${message.message}`} />
          </ListItem>
        ))}
      </List>
      <TextField
        value={newMessage}
        onChange={handleInputChange}
        variant="outlined"
        placeholder="Type a message..."
        fullWidth
      />
      <Button onClick={handleSendMessage} variant="contained" color="primary">
        Send
      </Button>
    </Box>
  );
}

export default CourseChat;
import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';
import { joinChatRoom, leaveChatRoom, sendChatMessage, receiveChatMessage, setTypingIndicator } from '../../actions/chatActions';
import { Typography, TextField, Button, List, ListItem, ListItemText, Box } from '@mui/material';
import io from 'socket.io-client';

const socket = io('http://localhost:8000');

function CourseChat() {
  const router = useRouter();
  const { courseId } = router.query;
  const dispatch = useDispatch();
  const messages = useSelector(state => state.chat.messages);
  const user = useSelector(state => state.auth.user);
  const [newMessage, setNewMessage] = useState('');
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (courseId && user) {
      dispatch(joinChatRoom(`course_${courseId}`, user.username));

      socket.on('chat_message', (message) => {
        dispatch(receiveChatMessage(message));
      });

      // Scroll to the bottom when a new message is received
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;

      return () => {
        dispatch(leaveChatRoom(`course_${courseId}`, user.username));
        socket.off('chat_message');
      };
    }
  }, [courseId, dispatch, user]);

  const handleSendMessage = () => {
    if (newMessage.trim() !== '') {
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

  const handleInputChange = (event) => {
    setNewMessage(event.target.value);
    socket.emit('typing', { is_typing: event.target.value !== '', roomId: `course_${courseId}` });
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

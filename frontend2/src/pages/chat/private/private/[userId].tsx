import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import io from 'socket.io-client';
import { useSelector, useDispatch } from 'react-redux';
import { Box, TextField, Button, List, ListItem, ListItemText, Typography } from '@mui/material';
import { joinChatRoom, leaveChatRoom, receiveChatMessage, sendChatMessage } from '../../store/actions/chatActions';
import { selectMessages } from '../../store/selectors/chatSelectors';
import { selectUser } from '../../store/selectors/authSelectors';

const socket = io('http://localhost:8000');

function PrivateChat() {
  const router = useRouter();
  const { userId } = router.query;
  const dispatch = useDispatch();
  const messages = useSelector(selectMessages);
  const user = useSelector(selectUser);

  const [newMessage, setNewMessage] = useState('');
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (userId && user) {
      dispatch(joinChatRoom(`private_${userId}`)); // Join the private room

      socket.on('chat_message', (message) => {
        dispatch(receiveChatMessage(message));
      });

      return () => {
        dispatch(leaveChatRoom(`private_${userId}`));
        socket.off('chat_message');
      };
    }
  }, [userId, dispatch, user]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim() !== '') {
      const message = {
        sender: user.username,
        message: newMessage,
        roomId: `private_${userId}`,
      };
      socket.emit('chat_message', message);
      dispatch(sendChatMessage(message));
      setNewMessage('');
    }
  };

  const handleInputChange = (event) => {
    setNewMessage(event.target.value);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Private Chat with {userId}
      </Typography>
      <Box
        ref={chatContainerRef}
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          mb: 2,
          border: '1px solid #ccc',
          borderRadius: '8px',
          p: 2,
        }}
      >
        <List>
          {messages.map((message, index) => (
            <ListItem key={index} sx={{ display: 'flex', justifyContent: message.sender === user.username ? 'flex-end' : 'flex-start' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: message.sender === user.username ? 'flex-end' : 'flex-start' }}>
                <Typography variant="subtitle2" color="textSecondary">
                  {message.sender}
                </Typography>
                <ListItemText
                  primary={message.message}
                  sx={{
                    backgroundColor: message.sender === user.username ? '#e0e0e0' : '#f0f0f0',
                    borderRadius: '10px',
                    p: 1,
                    maxWidth: '75%',
                  }}
                />
              </Box>
            </ListItem>
          ))}
        </List>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <TextField
          value={newMessage}
          onChange={handleInputChange}
          variant="outlined"
          fullWidth
          placeholder="Type your message..."
          sx={{ mr: 1 }}
        />
        <Button variant="contained" color="primary" onClick={handleSendMessage}>
          Send
        </Button>
      </Box>
    </Box>
  );
}

export default PrivateChat;

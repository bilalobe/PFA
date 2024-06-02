import React, { useState, useEffect, useRef } from 'react';
import { Box, TextField, Button, Typography, Avatar, List, ListItem, ListItemText, CircularProgress } from '@mui/material';
import io from 'socket.io-client';

const socket = io('http://localhost:8000'); // Adjust port if necessary

function Chat({ roomName }) { 
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const chatContainerRef = useRef(null); 

  useEffect(() => {
    socket.emit('join_room', { roomName });

    socket.on('chat_message', (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight; 
      }
    });

    socket.on('online_users', (data) => {
      setOnlineUsers(data.users);
    });

    socket.on('typing_indicator', (data) => {
      if (data.is_typing) {
        setTypingUsers((prevTypingUsers) => [...prevTypingUsers, data.user]);
      } else {
        setTypingUsers((prevTypingUsers) => prevTypingUsers.filter((user) => user !== data.user));
      }
    });

    return () => {
      socket.emit('leave_room', { roomName });
      socket.disconnect();
    };
  }, [roomName]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() !== '') {
      socket.emit('chat_message', {
        roomName,
        message: newMessage,
      });
      setNewMessage('');
    }
  };

  const handleInputChange = (event) => {
    setNewMessage(event.target.value);
    socket.emit('typing_indicator', {
      roomName,
      user: 'Anonymous', 
      is_typing: event.target.value !== '',
    });
  };

  return (
    <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Typography variant="h5" gutterBottom>
        Chat Room: {roomName}
      </Typography>

      <Box ref={chatContainerRef} sx={{ flexGrow: 1, overflowY: 'auto', mb: 2 }}>
        <List>
          {messages.map((message, index) => (
            <ListItem key={index} alignItems="flex-start">
              <Avatar alt={message.user} src={'/path/to/avatar.jpg'} sx={{ mr: 2 }} />
              <ListItemText
                primary={`${message.user}: ${message.message}`}
                secondary={new Date(message.timestamp).toLocaleTimeString()}
              />
            </ListItem>
          ))}
        </List>
        {typingUsers.length > 0 && (
          <Typography variant="body2" color="textSecondary">
            Typing: {typingUsers.join(', ')}
          </Typography>
        )}
      </Box>

      <Box component="form" onSubmit={sendMessage} sx={{ display: 'flex', alignItems: 'center' }}>
        <TextField
          value={newMessage}
          onChange={handleInputChange}
          placeholder="Type a message..."
          fullWidth
          variant="outlined"
          sx={{ mr: 2 }}
        />
        <Button type="submit" variant="contained" color="primary">
          Send
        </Button>
      </Box>

      <Box mt={3}>
        <Typography variant="h6">Online Users:</Typography>
        {onlineUsers.length === 0 ? (
          <CircularProgress />
        ) : (
          <List>
            {onlineUsers.map((user, index) => (
              <ListItem key={index}>
                <ListItemText primary={user} />
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Box>
  );
}

export default Chat;

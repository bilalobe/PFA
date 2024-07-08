import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';
import { Typography, TextField, Button, List, ListItem, ListItemText, Box } from '@mui/material';
import io from 'socket.io-client';
import { getMessaging, getToken, onMessage } from "firebase/messaging";

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
        username: user.username
      }));

      socket.on('chat_message', (message) => {
        dispatch(sendChatMessage(message));
      });

      // Request permission and get token for notifications
      const messaging = getMessaging();
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          console.log('Notification permission granted.');
          getToken(messaging, { vapidKey: 'YOUR_VAPID_KEY' }).then((currentToken) => {
            if (currentToken) {
              console.log(currentToken);
            } else {
              console.log('No registration token available. Request permission to generate one.');
            }
          });
        }
      });

      onMessage(messaging, (payload) => {
        console.log('Message received. ', payload);
        // Handle foreground messages
      });

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
      sendNotification(message);
      setNewMessage('');
    }
  };

 const sendNotification = async (message) => {
  try {
    const response = await fetch('https://your-backend.com/api/notifications/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: message.message,
        sender: message.sender,
        roomId: message.roomId,
      }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    console.log('Notification sent successfully:', data);
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(event.target.value);
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
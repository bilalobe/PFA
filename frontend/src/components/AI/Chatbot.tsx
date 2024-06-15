import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TextField, Button, List, ListItem, ListItemText } from '@mui/material';

function Chatbot() {
  const [userInput, setUserInput] = useState('');
  const [conversation, setConversation] = useState([]);

  const sendMessage = async () => {
    if (userInput.trim()) {
      const newConversation = [...conversation, { sender: 'user', message: userInput }];
      setConversation(newConversation);
      setUserInput('');

      try {
        const response = await axios.post('/api/chatbot/', { message: userInput });
        setConversation([...newConversation, { sender: 'bot', message: response.data.reply }]);
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  return (
    <div>
      <List>
        {conversation.map((chat: { message: any; sender: string; }, index: any) => (
          <ListItem key={index}>
            <ListItemText
              primary={chat.message}
              secondary={chat.sender === 'user' ? 'You' : 'Chatbot'}
            />
          </ListItem>
        ))}
      </List>
      <TextField
        label="Type your message..."
        value={userInput}
        onChange={(e: { target: { value: any; }; }) => setUserInput(e.target.value)}
        onKeyPress={(e: { key: string; }) => e.key === 'Enter' && sendMessage()}
        fullWidth
      />
      <Button variant="contained" color="primary" onClick={sendMessage}>
        Send
      </Button>
    </div>
  );
}

export default Chatbot;

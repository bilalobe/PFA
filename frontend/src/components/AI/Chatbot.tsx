import React, { useState, useCallback } from 'react';
import axios from 'axios';
import { TextField, Button, List, ListItem, ListItemText } from '@mui/material';

interface ChatMessage {
  sender: 'user' | 'bot';
  message: string;
}

interface ChatbotProps {
  welcomeMessage: string;
  notRecognizedMessage: string;
  autoResponseDelay: number;
  timeoutMessage: string;
}

const Chatbot: React.FC<ChatbotProps> = ({
}) => {
  const [userInput, setUserInput] = useState<string>('');
  const [conversation, setConversation] = useState<ChatMessage[]>([]);

  const sendMessage = useCallback(async () => {
    if (userInput.trim()) {
      const newConversation: ChatMessage[] = [...conversation, { sender: 'user', message: userInput }];
      setConversation(newConversation);
      setUserInput('');

      try {
        const response = await axios.post('/api/chatbot/', { message: userInput });
        setConversation([...newConversation, { sender: 'bot', message: response.data.reply }]);
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  }, [userInput, conversation]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  }, [sendMessage]);

  return (
    <div>
      <List>
        {conversation.map((chat, index) => (
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
        onChange={(e) => setUserInput(e.target.value)}
        onKeyDown={handleKeyPress}
        fullWidth
      />
      <Button variant="contained" color="primary" onClick={sendMessage}>
        Send
      </Button>
    </div>
  );
};

export default Chatbot;

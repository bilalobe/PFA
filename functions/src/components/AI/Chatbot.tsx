import React, { useState } from 'react';
import { List, ListItem, ListItemText, TextField, Button, Box } from '@mui/material';
import { useFirestore, FirestoreHook } from '../../hooks/useFirestore';
import { useAuth } from '../../hooks/useAuth'; 
import { collection, addDoc, serverTimestamp, query, orderBy, DocumentData } from 'firebase/firestore'; 
import { db } from '../../firebaseConfig';
import { aiApi } from '../../utils/api'; 
import { ChatbotProps } from '../../interfaces/props';

const Chatbot: React.FC<ChatbotProps> = ({ chatRoomId }) => {
  const { user } = useAuth();
  const chatMessagesRef = collection(db, 'chatRooms', chatRoomId, 'messages'); 

  // @ts-ignore
  const { data: messages, loading, error } = useFirestore(query<DocumentData>(chatMessagesRef, orderBy('timestamp', 'asc'))) as FirestoreHook<DocumentData>;

  const [userInput, setUserInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); // State for when chatbot response is being fetched

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (userInput.trim() !== "") { 
      setIsSubmitting(true);
      try {
        // Send user's message to Firestore
        await addDoc(chatMessagesRef, {
          sender: user?.uid, // Send user UID instead of 'user' 
          message: userInput,
          timestamp: serverTimestamp()
        });
 
        // Get Chatbot's response using Genkit Flow (or a direct call to Gemini) 
        const response = await aiApi.getChatbotResponse(userInput); // Assume this calls a Genkit flow
 
        await addDoc(chatMessagesRef, {
          sender: 'chatbot', 
          message: response,
          timestamp: serverTimestamp()
        });
 
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsSubmitting(false); 
        setUserInput(''); 
      }
    }
  };

  return (
    <Box>
      {/* Display Chat Messages */}
      <List>
        {messages?.map((message: DocumentData, index: number) => ( // Use 'any' for message type
          <ListItem key={index}>
            <ListItemText
              primary={message.message}
              secondary={message.sender === user?.uid ? 'You' : 'Chatbot'}
            />
          </ListItem>
        ))}
      </List>

      {/* Handle Loading State */}
      {loading && (
        <Box>Loading...</Box>
      )}

      {/* Handle Error State */}
      {error && (
        <Box>Error: {(error as any).message}</Box>
      )}

      {/* Input Area and Button */}
      <form onSubmit={handleSubmit}>
        <TextField
          label="Type a message..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          fullWidth
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Sending...' : 'Send'}
        </Button>
      </form>
    </Box>
  );
};

export default Chatbot;

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Avatar,
  ListItemAvatar,
  Divider,
  CircularProgress
} from '@mui/material';
import { Send } from '@mui/icons-material';
import { db } from '../../firebaseConfig';
import { collection, addDoc, query, orderBy, limit, serverTimestamp, where, getDocs } from 'firebase/firestore';
import { signalTyping, subscribeToParticipantActions } from '../../services/liveSessionService';

interface LiveSessionChatProps {
  sessionId: string;
  userId: string;
  displayName: string;
}

interface ChatMessage {
  id: string;
  text: string;
  userId: string;
  displayName: string;
  timestamp: any;
}

const LiveSessionChat: React.FC<LiveSessionChatProps> = ({ sessionId, userId, displayName }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [userTyping, setUserTyping] = useState<{[key: string]: boolean}>({});
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  
  const messagesRef = collection(db, `liveSessions/${sessionId}/messages`);
  const messageQuery = query(messagesRef, orderBy('timestamp', 'asc'), limit(100));

  // Handle sending a new message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newMessage.trim() === '') return;
    
    try {
      await addDoc(messagesRef, {
        text: newMessage,
        userId,
        displayName,
        timestamp: serverTimestamp()
      });
      
      setNewMessage('');
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  
  // Scroll to bottom of messages list
  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Handle typing indicator
  const handleTyping = () => {
    signalTyping(sessionId, userId);
  };
  
  // Load initial messages
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const querySnapshot = await getDocs(messageQuery);
        const loadedMessages = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as ChatMessage[];
        
        setMessages(loadedMessages);
        setLoading(false);
        scrollToBottom();
      } catch (error) {
        console.error('Error loading messages:', error);
        setLoading(false);
      }
    };
    
    loadMessages();
  }, []);
  
  // Subscribe to new messages
  useEffect(() => {
    const unsubscribe = onSnapshot(messageQuery, (snapshot) => {
      const newMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ChatMessage[];
      
      setMessages(newMessages);
      
      // Only auto-scroll if we're already near the bottom
      if (isNearBottom()) {
        scrollToBottom();
      }
    });
    
    return () => unsubscribe();
  }, [sessionId]);
  
  // Check if scrolled near bottom (within 100px)
  const isNearBottom = () => {
    if (!endOfMessagesRef.current) return true;
    
    const container = endOfMessagesRef.current.parentElement;
    if (!container) return true;
    
    const scrollPosition = container.scrollTop + container.clientHeight;
    return container.scrollHeight - scrollPosition < 100;
  };
  
  // Subscribe to typing indicators
  useEffect(() => {
    const unsubscribeActions = subscribeToParticipantActions(
      sessionId,
      () => {}, // onRaiseHand
      () => {}, // onLowerHand
      (typingUserId) => {
        if (typingUserId !== userId) {
          // Set typing indicator for this user
          setUserTyping(prev => ({ ...prev, [typingUserId]: true }));
          
          // Clear typing indicator after 2 seconds
          setTimeout(() => {
            setUserTyping(prev => ({ ...prev, [typingUserId]: false }));
          }, 2000);
        }
      }
    );
    
    return () => {
      unsubscribeActions();
    };
  }, [sessionId, userId]);

  return (
    <Paper elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Live Chat
      </Typography>
      
      {/* Messages area */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', mb: 2, minHeight: 300 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <CircularProgress />
          </Box>
        ) : (
          <List>
            {messages.map((msg) => (
              <ListItem key={msg.id} alignItems="flex-start">
                <ListItemAvatar>
                  <Avatar>{msg.displayName?.[0]?.toUpperCase() || '?'}</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography component="span" variant="body1">
                      {msg.displayName} {msg.userId === userId && "(You)"}
                    </Typography>
                  }
                  secondary={
                    <>
                      <Typography component="span" variant="body2" color="text.primary">
                        {msg.text}
                      </Typography>
                      <Typography variant="caption" display="block" color="text.secondary">
                        {msg.timestamp?.toDate ? msg.timestamp.toDate().toLocaleTimeString() : 'Sending...'}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            ))}
            <div ref={endOfMessagesRef} />
          </List>
        )}
        
        {/* Typing indicators */}
        {Object.entries(userTyping).map(([uid, isTyping]) => 
          isTyping && <Typography variant="caption" key={uid} sx={{ pl: 2 }}>Someone is typing...</Typography>
        )}
      </Box>
      
      {/* Message input */}
      <Box component="form" onSubmit={handleSendMessage} sx={{ display: 'flex' }}>
        <TextField
          fullWidth
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyUp={() => handleTyping()}
          variant="outlined"
          size="small"
        />
        <Button 
          type="submit" 
          variant="contained" 
          color="primary" 
          sx={{ ml: 1 }}
          disabled={!newMessage.trim()}
        >
          <Send />
        </Button>
      </Box>
    </Paper>
  );
};

export default LiveSessionChat;
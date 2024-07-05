import React, { useEffect, useState, memo } from 'react';
import { auth } from '../../../firebaseConfig';
import Chatbot from '@/components/AI/Chatbot';
import { onAuthStateChanged } from 'firebase/auth';

interface User {
  uid: string;
  email: string | null;
  displayName: string;
  photoURL: string;
  emailVerified: boolean;
}

interface Message {
  sender: string;
  message: string;
}

interface ChatbotProps {
  user: User;
  conversation: Message[];
}

const ChatbotContainer: React.FC<ChatbotProps> = memo(() => {
  const [user, setUser] = useState<null | User>(null);
  const [conversation, setConversation] = useState<Message[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        const userMapped: User = {
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName || 'Anonymous',
          photoURL: currentUser.photoURL || '',
          emailVerified: currentUser.emailVerified,
        };
        setUser(userMapped);
        // Optionally fetch conversation history from Firestore or Realtime Database
        const welcomeMessage: Message = { sender: 'bot', message: `Hello, ${userMapped.displayName}! How can I assist you today?` };
        setConversation([welcomeMessage]);
      } else {
        setUser(null);
        setConversation([]);
      }
    }, (error) => {
      console.error("Failed to subscribe to auth changes", error);
    });

    return () => unsubscribe();
  }, []);

  if (!user) {
    return <div>Please log in to access the chatbot.</div>;
  }

  return (
    <div>
      <Chatbot user={user} conversation={conversation} />
    </div>
  );
});

export default ChatbotContainer;
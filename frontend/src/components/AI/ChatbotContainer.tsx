import React, { useEffect, useState, memo } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../../firebaseConfig';
import Chatbot from '@/components/AI/Chatbot';
import { useChatbotConfig } from '@/components/AI/ChatbotConfig';

interface User {
  uid: string;
  email: string | null;
  displayName: string;
  photoURL: string;
  emailVerified: boolean;
}

const ChatbotContainer: React.FC = memo(() => {
  const [user, setUser] = useState<User | null>(null);
  const [conversation, setConversation] = useState<{ sender: string; message: string }[]>([]);
  const { welcomeMessage, notRecognizedMessage, autoResponseDelay, timeoutMessage } = useChatbotConfig();

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
        const welcomeMsg = { sender: 'bot', message: `Hello, ${userMapped.displayName}! How can I assist you today?` };
        setConversation([welcomeMsg]);
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
    <Chatbot
      welcomeMessage={welcomeMessage}
      notRecognizedMessage={notRecognizedMessage}
      autoResponseDelay={autoResponseDelay}
      timeoutMessage={timeoutMessage}
    />
  );
});

export default ChatbotContainer;

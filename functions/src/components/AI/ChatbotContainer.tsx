import React, { useEffect, useState, memo } from 'react';
import { auth } from '../../firebaseConfig';
import Chatbot from './Chatbot';
import { onAuthStateChanged } from 'firebase/auth';
import { User, ChatMessage } from '../../interfaces/types';
import { ChatbotProps } from '../../interfaces/props';

const ChatbotContainer: React.FC<ChatbotProps> = memo(({ conversation: propsConversation, chatRoomId }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentConversation, setCurrentConversation] = useState<ChatMessage[]>(propsConversation);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userMapped: User = {
          uid: user.uid,
          email: user.email ?? '',
          displayName: user.displayName || 'Anonymous',
          photoURL: user.photoURL || '',
          emailVerified: user.emailVerified,
          id: '',
          name: '',
          role: ''
        };
        setCurrentUser(userMapped);
        // Optionally fetch conversation history from Firestore or Realtime Database
        const welcomeMessage: ChatMessage = { sender: 'bot', message: `Hello, ${userMapped.displayName}! How can I assist you today?` };
        setCurrentConversation([welcomeMessage]);
      } else {
        setCurrentUser(null);
        setCurrentConversation([]);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setCurrentConversation(propsConversation);
  }, [propsConversation]);

  if (!currentUser) {
    return <div>Please log in to access the chatbot.</div>;
  }

  return (
    <div>
      <React.Fragment>
        <Chatbot chatRoomId={chatRoomId} user={currentUser} conversation={currentConversation} children={undefined} />
      </React.Fragment>
    </div>
  );
});

export default ChatbotContainer;
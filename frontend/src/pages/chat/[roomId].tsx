import React, { ReactNode, useEffect, useState } from 'react';
import { db } from '../../../../firebaseConfig';
import { collection, query, onSnapshot, addDoc, orderBy } from 'firebase/firestore';
import axios from 'axios';

const ChatRoom = () => {
  const [messages, setMessages] = useState<{ text: ReactNode; id: string }[]>([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const q = query(collection(db, "chats"), orderBy("createdAt"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messages = querySnapshot.docs.map(doc => ({
        id: doc.id,
        text: doc.data().text,
        ...doc.data()
      }));
      setMessages(messages);
    });

    return () => unsubscribe();
  }, []);

  const handleSendMessage = async (message) => {
    try {
      const response = await axios.post('/api/chat/ask-gemini', { prompt: message });
      const botMessage = {
        id: `gemini-${Date.now()}`,
        text: response.data,
      };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error('Error interacting with chatbot:', error);
    }
  };

  const sendMessage = async () => {
    if (newMessage.trim() === '') return;
    await addDoc(collection(db, "chats"), {
      text: newMessage,
      createdAt: new Date()
    });
    await handleSendMessage(newMessage);
    setNewMessage('');
  };

  return (
    <div>
      <div>
        {messages.map(message => (
          <p key={message.id}>{message.text}</p>
        ))}
      </div>
      <input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default ChatRoom;
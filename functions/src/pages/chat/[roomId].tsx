import React, { ReactNode, useEffect, useState } from 'react';
import { db } from '../../../../firebaseConfig';
import { collection, query, onSnapshot, addDoc, orderBy } from 'firebase/firestore';

const ChatRoom = () => {
  const [messages, setMessages] = useState<{
    text: ReactNode; id: string; 
}[]>([]);
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

  const sendMessage = async () => {
    if (newMessage.trim() === '') return;
    await addDoc(collection(db, "chats"), {
      text: newMessage,
      createdAt: new Date()
    });
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
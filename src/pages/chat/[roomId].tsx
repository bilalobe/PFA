import React, { useEffect, useState } from 'react';
import { db } from '../../firebaseConfig';
import { collection, query, onSnapshot, orderBy, QueryDocumentSnapshot, DocumentData, CollectionReference, addDoc, Query } from 'firebase/firestore';

const ChatRoom = () => {
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<DocumentData[]>([]);

  useEffect(() => {
    const chatsCollectionRef: CollectionReference<DocumentData> = collection(db, "chats");
    const q: Query<DocumentData> = query(chatsCollectionRef, orderBy("createdAt"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messages = querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
        id: doc.id,
        text: doc.data().text,
        ...doc.data()
      }));
      setMessages(messages);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [db]);

  const sendMessage = async () => {
    if (newMessage.trim() === '') return;

    try {
      await addDoc(collection(db, "chats"), {
        text: newMessage,
        createdAt: new Date()
      });
      setNewMessage('');
    } catch (error) {
      console.error("Error adding document: ", error);
    }
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

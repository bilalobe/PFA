import React, { useEffect, useState } from 'react';
import { getDatabase, ref, onValue, off } from 'firebase/database';

interface Message {
  id: string;
  text: string;
  senderId: string;
}

const MessageParser = ({ chatId }: { chatId: string }) => {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const db = getDatabase();
    const messagesRef = ref(db, `messages/${chatId}`);
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const messagesData: Message[] = [];
      snapshot.forEach(childSnapshot => {
        const message = childSnapshot.val();
        messagesData.push({
          id: childSnapshot.key,
          text: message.text,
          senderId: message.senderId,
        });
      });
      setMessages(messagesData);
    }, (error) => {
      console.error("Firebase read failed: ", error);
    });

    return () => off(messagesRef, 'value', unsubscribe);
  }, [chatId]);

  return (
    <div>
      {messages.map((message) => (
        <p key={message.id}>{message.text} (Sent by: {message.senderId})</p>
      ))}
    </div>
  );
};

export default MessageParser;
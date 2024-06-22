import { useEffect, useState } from 'react';
import { getDatabase, ref, push, onValue, off } from 'firebase/database';

function ChatRoom({ roomId }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const db = getDatabase();
    const messagesRef = ref(db, `chatRooms/${roomId}/messages`);
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const messagesData = snapshot.val() || [];
      setMessages(Object.values(messagesData));
    });

    return () => off(messagesRef, 'value', unsubscribe);
  }, [roomId]);

  const sendMessage = () => {
    const db = getDatabase();
    const messagesRef = ref(db, `chatRooms/${roomId}/messages`);
    push(messagesRef, newMessage);
    setNewMessage('');
  };

  return (
    <div>
      <ul>
        {messages.map((message, index) => (
          <li key={index}>{message}</li>
        ))}
      </ul>
      <input
        type="text"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default ChatRoom;
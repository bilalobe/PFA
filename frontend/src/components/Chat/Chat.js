import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:8000'); // Adjust port if needed

function Chat({ roomName }) { // Pass roomName as a prop
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const chatContainerRef = useRef(null); // Ref for the chat container

  useEffect(() => {
    socket.emit('join_room', { roomName }); // Send join_room event

    socket.on('chat_message', (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight; 
    });

    socket.on('online_users', (data) => {
      setOnlineUsers(data.users);
    });

    socket.on('typing_indicator', (data) => {
      if (data.is_typing) {
        setTypingUsers((prevTypingUsers) => [...prevTypingUsers, data.user]);
      } else {
        setTypingUsers((prevTypingUsers) => prevTypingUsers.filter((user) => user !== data.user));
      }
    });

    return () => {
      socket.emit('leave_room', { roomName });
      socket.disconnect();
    };
  }, [roomName]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() !== '') {
      socket.emit('chat_message', {
        roomName,
        message: newMessage,
      });
      setNewMessage('');
    }
  };

  const handleInputChange = (event) => {
    setNewMessage(event.target.value);
    socket.emit('typing_indicator', {
      roomName,
      user: 'Anonymous', // replace with actual user
      is_typing: event.target.value !== '',
    });
  };

  return (
    <div className="chat-container">
      <div className="messages" ref={chatContainerRef}>
        {messages.map((message, index) => (
          <div key={index} className="message">
            <strong>{message.user}</strong>: {message.message} <span>({new Date(message.timestamp).toLocaleTimeString()})</span>
          </div>
        ))}
        {typingUsers.length > 0 && (
          <div className="typing-indicator">Typing: {typingUsers.join(', ')}</div>
        )}
      </div>

      <form onSubmit={sendMessage}>
        <input 
          type="text"
          value={newMessage}
          onChange={handleInputChange}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>

      <div className="online-users">
        <h3>Online Users:</h3>
        <ul>
          {onlineUsers.map((user, index) => (
            <li key={index}>{user}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Chat;

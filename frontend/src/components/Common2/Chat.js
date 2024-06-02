import React, { useState } from 'react';
import axios from 'axios';

function Chat() {
  const [message, setMessage] = useState('');
  const [chatLog, setChatLog] = useState([]);

  const handleInputChange = (e) => {
    setMessage(e.target.value);
  };

  const handleSendMessage = async () => {
    try {
      const response = await axios.post('http://localhost:8000/api/chatbot/chat/', { message });
      setChatLog([...chatLog, { user: 'You', text: message }, { user: 'Bot', text: response.data[0]?.text }]);
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div>
      <div>
        {chatLog.map((log, index) => (
          <div key={index}>
            <strong>{log.user}:</strong> {log.text}
          </div>
        ))}
      </div>
      <input type="text" value={message} onChange={handleInputChange} />
      <button onClick={handleSendMessage}>Send</button>
    </div>
  );
}

export default Chat;

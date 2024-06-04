// src/components/ChatBot.js
import React, { useEffect, useState } from 'react';
import { DirectLine } from 'botframework-webchat';
import { ReactWebChat } from 'botframework-webchat';

const ChatBot = () => {
  const [directLine, setDirectLine] = useState(null);

  useEffect(() => {
    const token = 'YOUR_DIRECT_LINE_TOKEN';
    const directLineInstance = new DirectLine({
      token: token,
    });
    setDirectLine(directLineInstance);
  }, []);

  if (!directLine) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ height: '500px', width: '500px' }}>
      <ReactWebChat directLine={directLine} userID="userID" />
    </div>
  );
};

export default ChatBot;

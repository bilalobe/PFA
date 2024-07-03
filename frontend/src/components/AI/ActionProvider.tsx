import { useState, useCallback } from 'react';

interface ChatBotMessage {
  text: string;
  id?: string;
}

const ActionProvider = ({ createChatBotMessage, children }) => {
  const [messages, setMessages] = useState<ChatBotMessage[]>([]);

  const updateChatbotState = useCallback((message: ChatBotMessage) => {
    setMessages((prevMessages) => [...prevMessages, message]);
  }, []);

  const greet = useCallback(() => {
    const greetingMessage = createChatBotMessage("Hello friend!");
    updateChatbotState(greetingMessage);
  }, [createChatBotMessage, updateChatbotState]);

  const handleUnknown = useCallback(() => {
    const message = createChatBotMessage("I'm not sure what you mean. Can you rephrase?");
    updateChatbotState(message);
  }, [createChatBotMessage, updateChatbotState]);

  return children({ greet, handleUnknown, messages });
};

export default ActionProvider;
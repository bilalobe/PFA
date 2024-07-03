import React, { createContext, useContext, ReactNode } from 'react';

interface ChatbotConfig {
  welcomeMessage: string;
  notRecognizedMessage: string;
  autoResponseDelay: number;
  timeoutMessage: string;
}

const chatbotConfig: ChatbotConfig = {
  welcomeMessage: "Hello! How can I assist you today?",
  notRecognizedMessage: "I'm sorry, I didn't understand that. Can you try rephrasing?",
  autoResponseDelay: 500, 
  timeoutMessage: "I'm sorry, I'm currently unavailable. Please try again later.",
};

const ChatbotConfigContext = createContext<ChatbotConfig | undefined>(undefined);

export const ChatbotConfigProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <ChatbotConfigContext.Provider value={chatbotConfig}>
      {children}
    </ChatbotConfigContext.Provider>
  );
};

export const useChatbotConfig = (): ChatbotConfig => {
  const context = useContext(ChatbotConfigContext);
  if (context === undefined) {
    throw new Error('useChatbotConfig must be used within a ChatbotConfigProvider');
  }
  return context;
};

export default ChatbotConfigProvider;
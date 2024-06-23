// Path: frontend/src/components/AI/chatbotConfig.ts

interface ChatbotConfig {
    welcomeMessage: string;
    notRecognizedMessage: string;
    autoResponseDelay: number; // in milliseconds
    timeoutMessage: string;
}

const chatbotConfig: ChatbotConfig = {
    welcomeMessage: "Hello! How can I assist you today?",
    notRecognizedMessage: "I'm sorry, I didn't understand that. Can you try rephrasing?",
    autoResponseDelay: 500, // Respond after a 500ms delay to simulate typing
    timeoutMessage: "I'm sorry, I'm currently unavailable. Please try again later.",

};

export default chatbotConfig;
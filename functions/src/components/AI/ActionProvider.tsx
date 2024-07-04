
class ActionProvider {
  createChatBotMessage: any;
  setState: any;
  createClientMessage: any;
  constructor(createChatBotMessage, setStateFunc, createClientMessage) {
    this.createChatBotMessage = createChatBotMessage;
    this.setState = setStateFunc;
    this.createClientMessage = createClientMessage;
  }

  // Example action: greeting the user
  greet() {
    const greetingMessage = this.createChatBotMessage("Hello friend!");
    this.updateChatbotState(greetingMessage);
  }

  // Example action: handling unknown commands
  handleUnknown() {
    const message = this.createChatBotMessage("I'm not sure what you mean. Can you rephrase?");
    this.updateChatbotState(message);
  }

  // Function to update the state of the chatbot conversation
  updateChatbotState(message) {
    this.setState(prevState => ({
      ...prevState,
      messages: [...prevState.messages, message]
    }));
  }
}

export default ActionProvider;
class ActionProvider {
  createChatBotMessage: (message: string) => any;
  setState: (stateFunc: (prevState: any) => any) => void;
  createClientMessage: (message: string) => any;

  constructor(
    createChatBotMessage: (message: string) => any,
    setStateFunc: (stateFunc: (prevState: any) => any) => void,
    createClientMessage: (message: string) => any
  ) {
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
  updateChatbotState(message: any) {
    this.setState(prevState => ({
      ...prevState,
      messages: [...prevState.messages, message]
    }));
  }
}

export default ActionProvider;
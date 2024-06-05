// frontend2/src/redux/actions/chatActions.ts

import { createAction, PayloadAction } from '@reduxjs/toolkit';

interface ChatMessage {
  roomId: string;
  username: string;
  text: string;
  // add other properties as needed
}

interface TypingIndicator {
  username: string;
  isTyping: boolean;
}

export const joinChatRoom = createAction<string>('chat/joinChatRoom');
export const leaveChatRoom = createAction<string>('chat/leaveChatRoom');

export const sendChatMessage = createAction<ChatMessage>('chat/sendChatMessage');
export const receiveChatMessage = createAction<ChatMessage>('chat/receiveChatMessage');

export const setTypingIndicator = createAction<TypingIndicator>('chat/setTypingIndicator');

export const fetchChatMessages = createAction<string>('chat/fetchChatMessages');

export const setOnlineUsers = createAction<string[]>('chat/setOnlineUsers');

export type ChatActionTypes = PayloadAction<string> | PayloadAction<ChatMessage> | PayloadAction<TypingIndicator> | PayloadAction<string[]>;
import { createAction } from '@reduxjs/toolkit';

export const joinChatRoom = createAction('chat/joinChatRoom', (roomId, username) => ({
    payload: {
        roomId,
        username,
    },
}));

export const leaveChatRoom = createAction('chat/leaveChatRoom', (roomId, username) => ({
    payload: {
        roomId,
        username,
    },
}));

export const sendChatMessage = createAction('chat/sendChatMessage', (roomId, username, text) => ({
    payload: {
        roomId,
        username,
        text,
    },
}));

export const receiveChatMessage = createAction('chat/receiveChatMessage', (message) => ({
    payload: message,
}));

export const setTypingIndicator = createAction('chat/setTypingIndicator', (username, isTyping) => ({
    payload: {
        username,
        isTyping,
    },
}));

export const fetchChatMessages = createAction('chat/fetchChatMessages', (roomId) => ({
    payload: roomId,
}));

export const setOnlineUsers = createAction('chat/setOnlineUsers', (users) => ({
    payload: users,
}));
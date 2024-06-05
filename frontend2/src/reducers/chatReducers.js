import { createReducer } from '@reduxjs/toolkit';
import { joinChatRoom, leaveChatRoom, sendChatMessage, receiveChatMessage, setTypingIndicator, fetchChatMessages, setOnlineUsers } from './chatActions';

const initialState = {
    roomId: null,
    username: null,
    messages: [],
    onlineUsers: [],
    typingUsers: [],
};

const chatReducer = createReducer(initialState, (builder) => {
    builder
        .addCase(joinChatRoom, (state, action) => {
            state.roomId = action.payload.roomId;
            state.username = action.payload.username;
        })
        .addCase(leaveChatRoom, (state, action) => {
            state.roomId = null;
            state.username = null;
            state.messages = [];
            state.onlineUsers = [];
            action.payload.roomId;
        })
        .addCase(sendChatMessage, (state, action) => {
            state.messages.push({
                roomId: action.payload.roomId,
                username: action.payload.username,
                text: action.payload.text,
            });
        })
        .addCase(receiveChatMessage, (state, action) => {
            state.messages.push(action.payload);
        })
        .addCase(setTypingIndicator, (state, action) => {
            const { username, isTyping } = action.payload;
            const index = state.typingUsers.indexOf(username);
            if (isTyping && index === -1) {
                state.typingUsers.push(username);
            } else if (!isTyping && index !== -1) {
                state.typingUsers.splice(index, 1);
            }
        })
        .addCase(fetchChatMessages, (state, action) => {
            // This action would typically be handled in a middleware, not in the reducer
        })
        
        .addCase(setOnlineUsers, (state, action) => {
            state.onlineUsers = action.payload;
        });
});

export default chatReducer;
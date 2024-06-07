import { setOnlineUsers, setTypingIndicator } from '@/redux/actions/chatActions';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ChatState {
    roomId: string | null;
    username: string | null;
    messages: Array<any>; // Replace 'any' with the actual message type
    onlineUsers: Array<string>;
    typingUsers: Array<string>;
}

const initialState: ChatState = {
    roomId: null,
    username: null,
    messages: [],
    onlineUsers: [],
    typingUsers: [],
};

const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        joinChatRoom: (state, action: PayloadAction<{roomId: string, username: string}>) => {
            state.roomId = action.payload.roomId;
            state.username = action.payload.username;
        },
        leaveChatRoom: (state) => {
            state.roomId = null;
            state.username = null;
            state.messages = [];
            state.onlineUsers = [];
        },
        sendChatMessage: (state, action: PayloadAction<{message: string}>) => {
            state.messages.push({
                roomId: state.roomId,
                username: state.username,
                text: action.payload.message,
            });
        },
        receiveChatMessage: (state, action: PayloadAction<any>) => {
            state.messages.push(action.payload);
        },
        setTypingIndicator: (state, action: PayloadAction<{username: string, isTyping: boolean}>) => {
            const { username, isTyping } = action.payload;
            const index = state.typingUsers.indexOf(username);
            if (isTyping && index === -1) {
                state.typingUsers.push(username);
            } else if (!isTyping && index !== -1) {
                state.typingUsers.splice(index, 1);
            }
        },
        setOnlineUsers: (state, action: PayloadAction<string[]>) => {
            state.onlineUsers = action.payload;
        },
    },
});

export const { joinChatRoom, leaveChatRoom, sendChatMessage } = chatSlice.actions;

export default chatSlice.reducer;
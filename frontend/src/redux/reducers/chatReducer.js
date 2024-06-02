// chatReducer.js

import {
    JOIN_CHAT_ROOM_REQUEST,
    JOIN_CHAT_ROOM_SUCCESS,
    JOIN_CHAT_ROOM_FAILURE,
    LEAVE_CHAT_ROOM_REQUEST,
    LEAVE_CHAT_ROOM_SUCCESS,
    LEAVE_CHAT_ROOM_FAILURE,
    SEND_CHAT_MESSAGE_REQUEST,
    SEND_CHAT_MESSAGE_SUCCESS,
    SEND_CHAT_MESSAGE_FAILURE,
    RECEIVE_CHAT_MESSAGE,
    SET_TYPING_INDICATOR,
    FETCH_CHAT_MESSAGES_REQUEST,
    FETCH_CHAT_MESSAGES_SUCCESS,
    FETCH_CHAT_MESSAGES_FAILURE,
    SET_ONLINE_USERS,
} from '../actions/types';

const initialState = {
    messages: [],
    loading: false,
    error: null,
    typingUsers: [],
    currentRoom: null,
    onlineUsers: [],
};

const chatReducer = (state = initialState, action) => {
    switch (action.type) {
        case JOIN_CHAT_ROOM_REQUEST:
            return { ...state, loading: true };
        case JOIN_CHAT_ROOM_SUCCESS:
            return { ...state, loading: false, currentRoom: action.payload };
        case JOIN_CHAT_ROOM_FAILURE:
            return { ...state, loading: false, error: action.payload };
        case LEAVE_CHAT_ROOM_REQUEST:
            return { ...state, loading: true };
        case LEAVE_CHAT_ROOM_SUCCESS:
            return { ...state, loading: false, currentRoom: null, messages: [], onlineUsers: [] };
        case LEAVE_CHAT_ROOM_FAILURE:
            return { ...state, loading: false, error: action.payload };
        case SEND_CHAT_MESSAGE_REQUEST:
            return { ...state, loading: true };
        case SEND_CHAT_MESSAGE_SUCCESS:
            return { ...state, loading: false, messages: [...state.messages, action.payload] };
        case SEND_CHAT_MESSAGE_FAILURE:
            return { ...state, loading: false, error: action.payload };
        case RECEIVE_CHAT_MESSAGE:
            return { ...state, messages: [...state.messages, action.payload] };
        case SET_TYPING_INDICATOR:
            const { user, isTyping } = action.payload;
            if (isTyping) {
                return { ...state, typingUsers: [...state.typingUsers, user] };
            } else {
                return { ...state, typingUsers: state.typingUsers.filter((u) => u !== user) };
            }
        case FETCH_CHAT_MESSAGES_REQUEST:
            return { ...state, loading: true };
        case FETCH_CHAT_MESSAGES_SUCCESS:
            return { ...state, loading: false, messages: action.payload };
        case FETCH_CHAT_MESSAGES_FAILURE:
            return { ...state, loading: false, error: action.payload };
        case SET_ONLINE_USERS:
            return { ...state, onlineUsers: action.payload };
        default:
            return state;
    }
};

export default chatReducer;

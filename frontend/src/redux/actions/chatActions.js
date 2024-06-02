import axios from 'axios';
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
} from './types';

// Actions to handle joining and leaving chat rooms
export const joinChatRoomRequest = () => ({ type: JOIN_CHAT_ROOM_REQUEST });
export const joinChatRoomSuccess = (roomName) => ({ type: JOIN_CHAT_ROOM_SUCCESS, payload: roomName });
export const joinChatRoomFailure = (error) => ({ type: JOIN_CHAT_ROOM_FAILURE, payload: error });

export const leaveChatRoomRequest = () => ({ type: LEAVE_CHAT_ROOM_REQUEST });
export const leaveChatRoomSuccess = (roomName) => ({ type: LEAVE_CHAT_ROOM_SUCCESS, payload: roomName });
export const leaveChatRoomFailure = (error) => ({ type: LEAVE_CHAT_ROOM_FAILURE, payload: error });

// Actions to handle sending and receiving messages
export const sendChatMessageRequest = () => ({ type: SEND_CHAT_MESSAGE_REQUEST });
export const sendChatMessageSuccess = (message) => ({ type: SEND_CHAT_MESSAGE_SUCCESS, payload: message });
export const sendChatMessageFailure = (error) => ({ type: SEND_CHAT_MESSAGE_FAILURE, payload: error });

export const receiveChatMessage = (message) => ({ type: RECEIVE_CHAT_MESSAGE, payload: message });

// Actions to handle typing indicators
export const setTypingIndicator = (user, isTyping) => ({ type: SET_TYPING_INDICATOR, payload: { user, isTyping } });

// Actions to fetch chat messages
export const fetchChatMessagesRequest = () => ({ type: FETCH_CHAT_MESSAGES_REQUEST });
export const fetchChatMessagesSuccess = (messages) => ({ type: FETCH_CHAT_MESSAGES_SUCCESS, payload: messages });
export const fetchChatMessagesFailure = (error) => ({ type: FETCH_CHAT_MESSAGES_FAILURE, payload: error });

export const fetchChatMessages = (roomName) => {
    return async (dispatch) => {
        dispatch(fetchChatMessagesRequest());
        try {
            const response = await axios.get(`/api/messages/${roomName}/`);
            dispatch(fetchChatMessagesSuccess(response.data));
        } catch (error) {
            dispatch(fetchChatMessagesFailure(error.message));
        }
    };
};

// Actions to handle online users
export const setOnlineUsers = (users) => ({ type: SET_ONLINE_USERS, payload: users });

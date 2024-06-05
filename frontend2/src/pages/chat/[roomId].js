import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import io from 'socket.io-client';
import { useSelector, useDispatch } from 'react-redux';
import { joinChatRoom, leaveChatRoom, sendChatMessage, receiveChatMessage, setTypingIndicator, fetchChatMessages, setOnlineUsers } from '../../actions/chatActions';
import { Box, TextField, Button, Typography, List, ListItem, ListItemText, CircularProgress } from '@mui/material';

const socket = io('http://localhost:8000'); // Replace with your backend URL and port

function ChatPage() {
    const router = useRouter();
    const { roomId } = router.query; // Get the roomId from the URL
    const dispatch = useDispatch();
    const messages = useSelector(state => state.chat.messages);
    const onlineUsers = useSelector(state => state.chat.onlineUsers);
    const typingUsers = useSelector(state => state.chat.typingUsers);
    const user = useSelector(state => state.auth.user); // Get user from auth slice
    const isLoading = useSelector(state => state.chat.isLoading); // Get loading state from chat slice

    const chatContainerRef = useRef(null);
    const [messageText, setMessageText] = useState('');

    useEffect(() => {
        if (roomId && user) {
            dispatch(joinChatRoom(roomId, user.username));
            dispatch(fetchChatMessages(roomId));

            socket.on('chat_message', (message) => {
                dispatch(receiveChatMessage(message));
            });

            socket.on('online_users', (users) => {
                dispatch(setOnlineUsers(users));
            });

            socket.on('typing_indicator', (data) => {
                dispatch(setTypingIndicator(data.user, data.isTyping));
            });

            return () => {
                dispatch(leaveChatRoom(roomId, user.username));
                socket.off('chat_message');
                socket.off('online_users');
                socket.off('typing_indicator');
            };
        }
    }, [roomId, dispatch, user]);

    const handleSendMessage = (event) => {
        event.preventDefault();
        if (messageText.trim() !== '') {
            dispatch(sendChatMessage(roomId, user.username, messageText));
            socket.emit('chat_message', { roomId, user: user.username, text: messageText });
            setMessageText('');
        }
    };

    const handleTypingIndicator = (event) => {
        event.preventDefault();
        const isTyping = event.target.value.trim() !== '';
        socket.emit('typing_indicator', { roomId, user: user.username, isTyping });
    };

    return (
        <Box p={3}>
            <Typography variant="h4">Chat Room: {roomId}</Typography>

            {isLoading ? (
                <CircularProgress />
            ) : (
                <List ref={chatContainerRef}>
                    {messages.map((message, index) => (
                        <ListItem key={index}>
                            <ListItemText primary={message.user} secondary={message.text} />
                        </ListItem>
                    ))}
                </List>
            )}

            <Typography variant="h6">Online Users</Typography>
            <List>
                {onlineUsers.map((user, index) => (
                    <ListItem key={index}>
                        <ListItemText primary={user} />
                    </ListItem>
                ))}
            </List>

            <Typography variant="h6">Typing Users</Typography>
            <List>
                {typingUsers.map((user, index) => (
                    <ListItem key={index}>
                        <ListItemText primary={user} />
                    </ListItem>
                ))}
            </List>

            <form onSubmit={handleSendMessage}>
                <TextField
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type a message..."
                />
                <Button type="submit">Send</Button>
            </form>

            <form onSubmit={handleTypingIndicator}>
                <TextField
                    placeholder="Type something to see typing indicator..."
                />
            </form>
        </Box>
    );
}

export default ChatPage;

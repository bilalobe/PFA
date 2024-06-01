import express from 'express';
const app = express();
import uploadRoute from './routes/uploadRoute';
import { createServer } from 'http';
const server = createServer(app);
import { Server } from "socket.io";
const io = new Server(server);

// Use the upload route
app.use(uploadRoute);

// WebSocket logic
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('join_room', (data) => {
    socket.join(data.roomName);
    console.log(`User joined room: ${data.roomName}`);
  });

  socket.on('chat_message', (data) => {
    io.to(data.roomName).emit('chat_message', {
      user: 'Anonymous', // Replace with actual user
      message: data.message,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('typing_indicator', (data) => {
    io.to(data.roomName).emit('typing_indicator', {
      user: data.user,
      is_typing: data.is_typing
    });
  });

  socket.on('leave_room', (data) => {
    socket.leave(data.roomName);
    console.log(`User left room: ${data.roomName}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Start the server
server.listen(8000, () => {
  console.log('Server started on port 8000');
});


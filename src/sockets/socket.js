require("dotenv").config();
const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("../utils/user.js");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5500",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("user_connected", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    // Welcome current user
    socket.emit("message", "Welcome to ChatCord!");

    // Broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit("message", `${user.username} has joined the chat`);

    // Send users and room info
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  socket.on("send_message", (msg) => {
    const user = getCurrentUser(socket.id);

    io.to(user.room).emit("message", msg);
  });

  socket.on("typing", () => {
    const user = getCurrentUser(socket.id);
    socket.broadcast.emit("user_typing", user);
  });

  socket.on("disconnect", () => {
    userLeave(socket.id);
    io.emit("user_list_updated", "User left the chat");
    console.log("Client disconnected");
  });
});

httpServer.listen(8000, () => {
  console.log(`HTTP Server is running on port 8000`);
});

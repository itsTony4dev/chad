require("dotenv").config();
const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5500",
    methods: ["GET", "POST"],
  },
});


const activeUsers = new Map();

io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("user_connected", (userData) => {
    activeUsers.set(socket.id, userData);
    io.emit("user_list_updated", Array.from(activeUsers.values()));
  });

  socket.on("send_message", (message) => {
    io.emit("message", {
      ...message,
      socketId: socket.id,
      sent: false,
    });
  });

  socket.on("typing", () => {
    const user = activeUsers.get(socket.id);
    socket.broadcast.emit("user_typing", user);
  });

  socket.on("disconnect", () => {
    activeUsers.delete(socket.id);
    io.emit("user_list_updated", Array.from(activeUsers.values()));
    console.log("Client disconnected");
  });
});

httpServer.listen(8000, () => {
    console.log(`HTTP Server is running on port 8000`);
  });
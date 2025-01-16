const socket = io("http://localhost:8000");

const messageInput = document.querySelector(".message-input");
const sendButton = document.querySelector(".send-button");
const messagesContainer = document.querySelector(".messages-container");

socket.on("connect", () => {
  console.log("Connected to server");
});

socket.on("message", (message) => {
  const messageElement = document.createElement("div");
  messageElement.classList.add("message", message.sent ? "sent" : "received");

  messageElement.innerHTML = `
        <div>${message.content}</div>
        <div class="message-time">${new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}</div>
    `;

  messagesContainer.appendChild(messageElement);

  messagesContainer.scrollTop = messagesContainer.scrollHeight;
});

function sendMessage() {
  const content = messageInput.value.trim();
  if (!content) {
    return;
  }

  socket.emit("send_message", {
    content,
    timestamp: new Date(),
    sender: "user",
  });

  messageInput.value = "";
  messageInput.focus();
}

sendButton.addEventListener("click", sendMessage);
messageInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    sendMessage();
  }
});

socket.emit("user_connected", {
  username: "user",
  room: "room",
});

// Optional: Handle typing indicators
messageInput.addEventListener("input", () => {
  socket.emit("typing");
});

// Listen for typing events
socket.on("user_typing", (user) => {
  // Add typing indicator logic here
  console.log(`${user} is typing...`);
});
socket.on("disconnect", () => {
  console.log("Disconnected from server");
});

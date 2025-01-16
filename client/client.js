const socket = io("http://localhost:8000");

const messageInput = document.querySelector(".message-input");
const sendButton = document.querySelector(".send-button");
const messagesContainer = document.querySelector(".messages-container");

socket.on("connect", () => {
  console.log("Connected to server");
});

document.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    const avatarElement = link.querySelector(".conversation-item .avatar");
    const nameElement = link.querySelector(".name");

    if (avatarElement && nameElement) {
      const avatar = avatarElement.textContent;
      const name = nameElement.textContent;

      document.querySelector(".chat-header .avatar").textContent = avatar;
      document.querySelector(".chat-header .name").textContent = name;
    } else {
      console.warn("Avatar or name not found in the clicked link.");
    }

    const url = new URL(link.href);
    const queryString = url.search || url.hash.slice(1);
    const parsed = Qs.parse(queryString, { ignoreQueryPrefix: true });

    const { room } = parsed;

    if (room) {
      console.log(`Joining room: ${room}`);
      socket.emit("user_connected", {
        username: "user",
        room,
      });
    } else {
      console.warn("Room parameter is missing or invalid.");
    }
  });
});

socket.on("user_joined", (userId) => {
  console.log(`User ${userId} joined the room`);
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

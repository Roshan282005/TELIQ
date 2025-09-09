import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import axios from "axios";

const SOCKET_URL = "http://localhost:5000"; // backend URL

export default function ChatRoom({ token, currentUser }) {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typingUsers, setTypingUsers] = useState({});
  const socketRef = useRef();

  // Fetch chats
  useEffect(() => {
    if (currentUser && currentUser.id) {
      fetch(`http://localhost:5000/api/chats?userId=${currentUser.id}`)
        .then((res) => res.json())
        .then((data) => setChats(data))
        .catch((err) => console.error("Error fetching chats:", err));
    }
  }, [currentUser]);

  // Connect Socket.IO
  useEffect(() => {
    socketRef.current = io(SOCKET_URL, { auth: { token } });

    // Listen for messages
    socketRef.current.on("receive_message", (msg) => {
      if (selectedChat && selectedChat._id === msg.chatId) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    // Listen for read receipts
    socketRef.current.on("message_read", ({ messageId, userId }) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === messageId ? { ...m, read: true } : m))
      );
    });

    // Listen for reactions
    socketRef.current.on("message_reaction", ({ messageId, reactions }) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === messageId ? { ...m, reactions } : m))
      );
    });

    // Typing indicator
    socketRef.current.on("typing", ({ userId, isTyping }) => {
      setTypingUsers((prev) => ({ ...prev, [userId]: isTyping }));
    });

    return () => socketRef.current.disconnect();
  }, [token, selectedChat]);

  // Fetch messages when chat is selected
  useEffect(() => {
    if (selectedChat) {
      axios
        .get(`${SOCKET_URL}/api/messages/${selectedChat._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setMessages(res.data))
        .catch((err) => console.error("Error fetching messages:", err));

      // Join chat room
      socketRef.current.emit("join_chat", { chatId: selectedChat._id });
    }
  }, [selectedChat, token]);

  // Handle input change
  const handleChange = (e) => {
    setText(e.target.value);
    if (selectedChat)
      socketRef.current.emit("typing", {
        chatId: selectedChat._id,
        isTyping: e.target.value.length > 0,
      });
  };

  // Send message
  const handleSend = () => {
    if (!text.trim() || !selectedChat) return;
    socketRef.current.emit("send_message", {
      chatId: selectedChat._id,
      text: text.trim(),
    });
    setText("");
    socketRef.current.emit("typing", { chatId: selectedChat._id, isTyping: false });
  };

  // Mark message as read
  const handleRead = (messageId) => {
    if (selectedChat)
      socketRef.current.emit("mark_read", { chatId: selectedChat._id, messageId });
  };

  // Add reaction
  const addReaction = (messageId, reaction) => {
    socketRef.current.emit("add_reaction", { messageId, reaction });
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Chat List Sidebar */}
      <div
        style={{
          width: "350px",
          backgroundColor: "#f0f0f0",
          borderRight: "1px solid #e0e0e0",
          padding: "10px",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            backgroundColor: "#075e54",
            color: "white",
            padding: "10px",
            borderRadius: "5px 5px 0 0",
          }}
        >
          <h3 style={{ margin: 0 }}>Chats</h3>
        </div>
        {chats.length === 0 ? (
          <p style={{ textAlign: "center", color: "#666" }}>No chats</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, backgroundColor: "white" }}>
            {chats.map((chat) => (
              <li
                key={chat._id}
                onClick={() => setSelectedChat(chat)}
                style={{
                  margin: "0",
                  padding: "10px",
                  display: "flex",
                  alignItems: "center",
                  borderBottom: "1px solid #e0e0e0",
                  cursor: "pointer",
                  backgroundColor: selectedChat?._id === chat._id ? "#d9fdd3" : "white",
                }}
              >
                <img
                  src={chat.profilePic || "https://via.placeholder.com/50"}
                  alt="Profile"
                  style={{ width: "50px", height: "50px", borderRadius: "50%" }}
                />
                <div style={{ marginLeft: "10px", flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <b style={{ color: "#333" }}>
                      {chat.username || chat.phone || chat.email}
                    </b>
                    <small style={{ color: "#666" }}>
                      {chat.updatedAt ? new Date(chat.updatedAt).toLocaleString() : ""}
                    </small>
                  </div>
                  <p style={{ margin: "5px 0", color: "#666", fontSize: "14px" }}>
                    {chat.lastMessage || "No messages yet"}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Chat Window */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div
          style={{
            flex: 1,
            padding: "10px",
            overflowY: "auto",
            backgroundColor: "#e5ddd5",
          }}
        >
          {messages.map((msg) => (
            <div
              key={msg._id}
              className={`message ${msg.senderId === currentUser._id ? "own" : ""}`}
              style={{
                backgroundColor: msg.senderId === currentUser._id ? "#dcf8c6" : "white",
                padding: "8px 12px",
                borderRadius: "7px",
                margin: "5px 0",
                maxWidth: "60%",
                alignSelf: msg.senderId === currentUser._id ? "flex-end" : "flex-start",
                position: "relative",
              }}
              onMouseEnter={() => handleRead(msg._id)}
            >
              <span>{msg.text}</span>
              {msg.reactions?.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    gap: "5px",
                    marginTop: "3px",
                  }}
                >
                  {msg.reactions.map((r) => (
                    <span key={r.userId}>{r.reaction}</span>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          <div style={{ fontStyle: "italic", color: "#555" }}>
            {Object.entries(typingUsers).map(
              ([uid, typing]) => typing && <span key={uid}>Someone is typing...</span>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div
          style={{
            display: "flex",
            padding: "10px",
            backgroundColor: "#f0f0f0",
            borderTop: "1px solid #e0e0e0",
          }}
        >
          <input
            type="text"
            value={text}
            onChange={handleChange}
            placeholder="Type a message..."
            style={{ flex: 1, padding: "10px", borderRadius: "20px", border: "1px solid #ccc" }}
          />
          <button
            onClick={handleSend}
            style={{
              marginLeft: "10px",
              backgroundColor: "#075e54",
              color: "white",
              border: "none",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              cursor: "pointer",
            }}
          >
            ➤
          </button>
        </div>

        {/* Reactions example */}
        <div
          style={{
            display: "flex",
            padding: "5px 10px",
            gap: "5px",
            backgroundColor: "#f0f0f0",
          }}
        >
          {["👍", "❤️", "😂", "😮", "😢"].map((emoji) => (
            <button
              key={emoji}
              onClick={() =>
                addReaction(messages[messages.length - 1]?._id, emoji)
              }
              style={{ cursor: "pointer", fontSize: "18px", background: "none", border: "none" }}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

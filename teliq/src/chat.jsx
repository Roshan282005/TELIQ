import { useEffect, useState } from "react";
import socket from "../socket"; // ✅ central socket instance

export default function Chat({ user, selectedChat }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [userPresence, setUserPresence] = useState({});
  const [isInCall, setIsInCall] = useState(false);

  useEffect(() => {
    if (!user || !selectedChat) return;

    const roomId = `${user.id}_${selectedChat._id}`;

    // Notify server about online status
    socket.emit("userOnline", user.id);

    // Listen for incoming messages
    socket.on("receiveMessage", (msg) => {
      if (msg.roomId === roomId) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    // Presence updates
    socket.on("userPresence", ({ userId, status }) => {
      setUserPresence((prev) => ({ ...prev, [userId]: status }));
    });

    // Call events
    socket.on("callStarted", ({ callerId, roomId: callRoomId }) => {
      if (callRoomId === roomId) {
        alert(`Call started by ${callerId}`);
      }
    });

    socket.on("callEnded", ({ callerId, roomId: callRoomId }) => {
      if (callRoomId === roomId) {
        alert(`Call ended by ${callerId}`);
        setIsInCall(false);
      }
    });

    // Cleanup listeners only (not socket.disconnect!)
    return () => {
      socket.off("receiveMessage");
      socket.off("userPresence");
      socket.off("callStarted");
      socket.off("callEnded");
    };
  }, [user, selectedChat]);

  // Send message
  const sendMessage = () => {
    if (!newMessage || !user || !selectedChat) return;
    const roomId = `${user.id}_${selectedChat._id}`;
    const msgData = {
      senderId: user.id,
      receiverId: selectedChat._id,
      content: newMessage,
      roomId,
    };
    socket.emit("sendMessage", msgData);
    setNewMessage("");
  };

  const roomId = user && selectedChat ? `${user.id}_${selectedChat._id}` : "";

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", backgroundColor: "#ece5dd", backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')", backgroundSize: "cover" }}>
      <div style={{ backgroundColor: "#075e54", color: "white", padding: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0 }}>{selectedChat ? selectedChat.username : "Chat"}</h2>
        <div>
          <button
            onClick={() => {
              if (!isInCall) {
                socket.emit("startCall", { callerId: user.id, roomId });
                setIsInCall(true);
              } else {
                socket.emit("endCall", { callerId: user.id, roomId });
                setIsInCall(false);
              }
            }}
            style={{ background: "none", border: "none", color: "white", cursor: "pointer", fontSize: "18px" }}
          >
            {isInCall ? "📞 End" : "📞 Call"}
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "10px" }}>
        {messages.map((m) => (
          <div
            key={m._id || Math.random()}
            style={{
              margin: "5px 0",
              padding: "8px 12px",
              borderRadius: "7.5px",
              maxWidth: "70%",
              wordWrap: "break-word",
              backgroundColor: m.senderId === user.id ? "#dcf8c6" : "#fff",
              marginLeft: m.senderId === user.id ? "auto" : "0",
              marginRight: m.senderId === user.id ? "0" : "auto",
              boxShadow: "0 1px 0.5px rgba(0,0,0,0.13)",
            }}
          >
            {m.content}
            <small
              style={{
                display: "block",
                color: "#999",
                fontSize: "12px",
                textAlign: "right",
                marginTop: "4px",
              }}
            >
              {m.timestamp ? new Date(m.timestamp).toLocaleTimeString() : ""}
            </small>
          </div>
        ))}
      </div>

      <div style={{ padding: "10px", backgroundColor: "#f0f0f0", display: "flex" }}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message"
          style={{ flex: 1, padding: "10px", borderRadius: "20px", border: "1px solid #ccc", marginRight: "10px" }}
        />
        <button
          onClick={sendMessage}
          style={{ backgroundColor: "#25d366", color: "white", border: "none", padding: "10px 20px", borderRadius: "20px", cursor: "pointer" }}
        >
          Send
        </button>
      </div>
    </div>
  );
}

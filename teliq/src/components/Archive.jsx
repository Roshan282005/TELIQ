import { useEffect, useState } from "react";

export default function Archive() {
  const [archivedChats, setArchivedChats] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/api/archived-chats")
      .then((res) => res.json())
      .then((data) => setArchivedChats(data))
      .catch((err) => console.error("Error fetching archived chats:", err));
  }, []);

  const filteredChats = archivedChats.filter((chat) =>
    chat.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ width: "300px", borderRight: "1px solid #e0e0e0", padding: "10px" }}>
      <h3>Archived Chats</h3>
      <input
        type="text"
        placeholder="Search archived chats"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ width: "100%", padding: "8px", borderRadius: "20px", border: "1px solid #ccc" }}
      />
      <ul style={{ listStyle: "none", padding: 0, marginTop: "10px" }}>
        {filteredChats.map((chat) => (
          <li key={chat._id} style={{ margin: "10px 0", display: "flex", alignItems: "center" }}>
            <img
              src={chat.profilePic || "https://via.placeholder.com/50"}
              alt="Profile"
              style={{ width: "50px", height: "50px", borderRadius: "50%" }}
            />
            <div style={{ marginLeft: "10px" }}>
              <b>{chat.username || chat.phone}</b>
              <p style={{ margin: 0, color: "#666" }}>{chat.lastMessage || "No messages"}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

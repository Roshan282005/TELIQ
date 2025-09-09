import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

export default function ContactsList({ contacts }) {
  const [presence, setPresence] = useState({});

  useEffect(() => {
    socket.on("userPresence", ({ userId, status }) => {
      setPresence((prev) => ({ ...prev, [userId]: status }));
    });

    return () => socket.disconnect();
  }, []);

  return (
    <div style={{ border: "1px solid gray", padding: "10px", width: "200px" }}>
      <h3>Contacts</h3>
      {!contacts || contacts.length === 0 ? (
        <p>No contacts</p>
      ) : (
        <ul>
          {contacts.map((contact) => (
            <li key={contact._id} style={{ margin: "5px 0" }}>
              <img
                src={contact.profilePic || "https://via.placeholder.com/40"}
                alt="Profile"
                style={{ width: "40px", height: "40px", borderRadius: "50%" }}
              />
              <div>
                <b>{contact.username || contact.email}</b>
                <p>Last login: {new Date(contact.lastLogin).toLocaleString()}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

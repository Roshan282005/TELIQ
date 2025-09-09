import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

export default function CallUI({ user }) {
  const [calls, setCalls] = useState([]);
  const [isInCall, setIsInCall] = useState(false);
  const [currentCall, setCurrentCall] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/calls")
      .then((res) => res.json())
      .then((data) => setCalls(data))
      .catch((err) => console.error("Error fetching calls:", err));

    socket.on("callStarted", ({ callerId, roomId }) => {
      if (roomId === user?.uid + "_room") {
        setIsInCall(true);
        setCurrentCall({ callerId, roomId });
      }
    });

    socket.on("callEnded", ({ callerId, roomId }) => {
      if (roomId === user?.uid + "_room") {
        setIsInCall(false);
        setCurrentCall(null);
      }
    });

    return () => socket.disconnect();
  }, [user]);

  const startCall = (roomId) => {
    socket.emit("startCall", { callerId: user.uid, roomId });
    setIsInCall(true);
    setCurrentCall({ callerId: user.uid, roomId });
  };

  const endCall = () => {
    socket.emit("endCall", { callerId: user.uid, roomId: currentCall.roomId });
    setIsInCall(false);
    setCurrentCall(null);
  };

  return (
    <div style={{ width: "300px", borderRight: "1px solid #e0e0e0", padding: "10px" }}>
      <h3>Calls</h3>
      {isInCall && (
        <div style={{ backgroundColor: "#dcf8c6", padding: "10px", borderRadius: "10px", marginBottom: "10px" }}>
          <p>In call with {currentCall.callerId}</p>
          <button onClick={endCall} style={{ backgroundColor: "#ff4444", color: "white", border: "none", padding: "5px 10px", borderRadius: "5px" }}>
            End Call
          </button>
        </div>
      )}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {calls.map((call) => (
          <li key={call._id} style={{ margin: "10px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <img
                src={call.profilePic || "https://via.placeholder.com/50"}
                alt="Profile"
                style={{ width: "50px", height: "50px", borderRadius: "50%" }}
              />
              <div style={{ marginLeft: "10px" }}>
                <b>{call.username || call.phone}</b>
                <p style={{ margin: 0, color: "#666" }}>{call.type} call</p>
              </div>
            </div>
            <button onClick={() => startCall(call.roomId)} style={{ backgroundColor: "#25d366", color: "white", border: "none", padding: "5px 10px", borderRadius: "5px" }}>
              Call
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

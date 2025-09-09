import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  withCredentials: true,
  transports: ["websocket"], // force websocket, avoids polling spam
});

export default socket;

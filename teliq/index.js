
// index.js (ES Module version, Node v22, Firebase key fix + socket handlers)
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import admin from "firebase-admin";

// ------------------- __dirname fix -------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ------------------- EXPRESS APP -------------------
const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// ------------------- MONGO -------------------
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/teliq";
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("Mongo connection error:", err));

// ------------------- SCHEMAS / MODELS -------------------
const { Schema, model, Types } = mongoose;

const UserSchema = new Schema(
  {
    name: String,
    username: String,
    email: { type: String, unique: true, sparse: true },
    phone: { type: String, unique: true, sparse: true },
    password: String,
    passwordHash: String,
    uid: String,
    provider: { type: String, default: "manual" },
    profilePic: String,
    lastLogin: Date,
  },
  { timestamps: true }
);

const ChatSchema = new Schema(
  {
    name: String,
    isGroup: { type: Boolean, default: false },
    participants: [{ type: Types.ObjectId, ref: "User" }],
    lastMessage: String,
  },
  { timestamps: true }
);

const MessageSchema = new Schema(
  {
    chatId: { type: Types.ObjectId, ref: "Chat", required: false },
    senderId: { type: Types.ObjectId, ref: "User", required: false },
    sender: String,
    receiver: String,
    text: String,
    content: String,
    mediaUrl: String,
    roomId: String,
    timestamp: { type: Date, default: Date.now },
    read: { type: Boolean, default: false },
    reactions: [
      {
        userId: { type: Types.ObjectId, ref: "User" },
        reaction: String,
      },
    ],
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

const User = model("User", UserSchema);
const Chat = model("Chat", ChatSchema);
const Message = model("Message", MessageSchema);

// ------------------- JWT HELPERS -------------------
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
function signToken(user) {
  return jwt.sign(
    { _id: user._id, email: user.email, name: user.name || user.username },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}
function verifyTokenRaw(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

// ------------------- AUTH ROUTES -------------------

// Register (manual)
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!email && !phone)
      return res.status(400).json({ error: "Email or phone required" });

    const existing = await User.findOne({ $or: [{ email }, { phone }] });
    if (existing) return res.status(400).json({ error: "User already exists" });

    const user = new User({ name, email, phone, password });
    await user.save();

    const token = signToken(user);
    res.json({ token, user });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Register failed" });
  }
});

// Manual login
app.post("/api/login", async (req, res) => {
  try {
    const { email, phone, password } = req.body;
    const user = await User.findOne({ $or: [{ email }, { phone }] });
    if (!user || user.password !== password) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = signToken(user);
    res.json({ token, user });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});


// ------------------- FIREBASE LOGIN -------------------
if (!admin.apps.length) {
  try {
    if (
      !process.env.FIREBASE_PROJECT_ID ||
      !process.env.FIREBASE_CLIENT_EMAIL ||
      !process.env.FIREBASE_PRIVATE_KEY ||
      !process.env.FIREBASE_DB_URL
    ) {
      throw new Error(
        "Firebase environment variables are missing. Check your .env file."
      );
    }

    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY
        .replace(/\\n/g, "\n") // convert literal \n to real newlines
        .replace(/^"(.*)"$/, "$1") // remove surrounding quotes if present
        .trim(),
    };

    if (
      !serviceAccount.privateKey ||
      !serviceAccount.privateKey.startsWith("-----BEGIN PRIVATE KEY-----")
      ) {
      throw new Error(
        "Firebase private key is empty or incorrectly formatted."
      );
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DB_URL,
    });

    console.log("✅ Firebase Admin initialized");
  } catch (err) {
    console.error("❌ Firebase Admin init error:", err);
  }
}


app.post("/api/google-login", async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: "No token provided" });

    const decoded = await admin.auth().verifyIdToken(token);
    let user = await User.findOne({ email: decoded.email });

    if (!user) {
      user = new User({
        name: decoded.name,
        email: decoded.email,
        uid: decoded.uid,
        provider: "google",
        profilePic: decoded.picture,
        lastLogin: new Date(),
      });
      await user.save();
    } else {
      user.lastLogin = new Date();
      await user.save();
    }

    const jwtToken = signToken(user);
    res.json({ token: jwtToken, user });
  } catch (err) {
    console.error("Google login error:", err);
    res.status(500).json({ error: "Google sign in failed" });
  }
});

// ------------------- SERVE FRONTEND -------------------
const distPath = path.join(__dirname, "dist");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get("*", (req, res) =>
    res.sendFile(path.join(distPath, "index.html"))
  );
  console.log("✅ Serving frontend from /dist");
}

// ------------------- SOCKET.IO -------------------
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: true, credentials: true } });

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) return next(new Error("No token"));
    const raw = token.startsWith("Bearer ") ? token.slice(7) : token;
    const user = verifyTokenRaw(raw);
    if (!user) return next(new Error("Invalid token"));
    socket.user = user;
    next();
  } catch {
    next(new Error("Authentication error"));
  }
});

io.on("connection", (socket) => {
  if (!socket.user) {
    socket.disconnect(true);
    return;
  }
  console.log(
    "✅ Socket connected:",
    socket.user.name || socket.user.email || socket.user._id
  );

  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log(`📌 User ${socket.user._id} joined room ${roomId}`);
  });

  socket.on("sendMessage", async ({ chatId, roomId, text }) => {
    try {
      const message = new Message({
        chatId,
        roomId,
        senderId: socket.user._id,
        sender: socket.user.name,
        text,
        timestamp: new Date(),
      });
      await message.save();
      io.to(roomId || chatId).emit("newMessage", message);
    } catch (err) {
      console.error("Send message error:", err);
    }
  });

  socket.on("typing", (roomId) => {
    socket.to(roomId).emit("typing", { user: socket.user._id });
  });
  socket.on("stopTyping", (roomId) => {
    socket.to(roomId).emit("stopTyping", { user: socket.user._id });
  });

  socket.on("markRead", async ({ chatId }) => {
    try {
      await Message.updateMany(
        { chatId, receiver: socket.user._id, read: false },
        { $set: { read: true } }
      );
      io.to(chatId).emit("messagesRead", {
        chatId,
        userId: socket.user._id,
      });
    } catch (err) {
      console.error("Mark read error:", err);
    }
  });

  socket.on("reactMessage", async ({ messageId, reaction }) => {
    try {
      const msg = await Message.findById(messageId);
      if (msg) {
        msg.reactions.push({ userId: socket.user._id, reaction });
        await msg.save();
        io.to(msg.chatId || msg.roomId).emit("messageReaction", {
          messageId,
          userId: socket.user._id,
          reaction,
        });
      }
    } catch (err) {
      console.error("React message error:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.user._id);
  });
});

// ------------------- HEALTH CHECK -------------------
app.get("/", (req, res) => res.send("TELIQ Backend API is running..."));

// ------------------- START SERVER -------------------
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 API running on port ${PORT}`));

// ------------------- EXPORTS FOR TESTING -------------------
export { app, server, io, mongoose, User, Chat, Message };

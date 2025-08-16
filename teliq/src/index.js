require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// --- Mongo ---
mongoose.connect(process.env.MONGO_URI).then(() => console.log('Mongo connected'));

// --- Schemas ---
const { Schema, model, Types } = mongoose;

const UserSchema = new Schema({
  name: String,
  email: { type: String, unique: true },
  passwordHash: String,
  profilePic: String,
  status: { type: String, default: 'Hey there! I am using Teliq.' },
  lastSeen: Date,
}, { timestamps: true });

const ChatSchema = new Schema({
  name: String,                // for groups
  isGroup: { type: Boolean, default: false },
  participants: [{ type: Types.ObjectId, ref: 'User' }],
  lastMessage: String,
}, { timestamps: true });

const MessageSchema = new Schema({
  chatId: { type: Types.ObjectId, ref: 'Chat' },
  senderId: { type: Types.ObjectId, ref: 'User' },
  text: String,
  mediaUrl: String,
  read: { type: Boolean, default: false },
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });

const User = model('User', UserSchema);
const Chat = model('Chat', ChatSchema);
const Message = model('Message', MessageSchema);

// --- Helpers ---
const bcrypt = require('bcrypt');
const sign = (user) =>
  jwt.sign({ _id: user._id, email: user.email, name: user.name }, process.env.JWT_SECRET, { expiresIn: '7d' });

const auth = async (req, res, next) => {
  try {
    const hdr = req.headers.authorization || '';
    const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'No token' });
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (e) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// --- Auth routes ---
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  const exist = await User.findOne({ email });
  if (exist) return res.status(409).json({ message: 'Email already used' });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash });
  return res.json({ token: sign(user), user });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(400).json({ message: 'Invalid credentials' });
  return res.json({ token: sign(user), user });
});

// --- Chat routes ---
app.get('/api/chats', auth, async (req, res) => {
  const uid = req.user._id;
  const chats = await Chat.find({ participants: uid })
    .sort({ updatedAt: -1 })
    .lean();

  // Attach \"other\" user for 1:1 chats
  const usersById = Object.fromEntries((await User.find().lean()).map(u => [String(u._id), u]));
  const mapped = chats.map(c => {
    const other = !c.isGroup
      ? usersById[String(c.participants.find(p => String(p) !== uid))] || null
      : null;
    return { ...c, other: other ? { _id: other._id, name: other.name } : null };
  });
  res.json(mapped);
});

app.post('/api/chats/with/:userId', auth, async (req, res) => {
  const a = req.user._id, b = req.params.userId;
  let chat = await Chat.findOne({ isGroup: false, participants: { $all: [a, b], $size: 2 } });
  if (!chat) chat = await Chat.create({ isGroup: false, participants: [a, b] });
  res.json(chat);
});

// --- Messages routes ---
app.get('/api/messages/:chatId', auth, async (req, res) => {
  const list = await Message.find({ chatId: req.params.chatId }).sort({ createdAt: 1 }).lean();
  res.json(list);
});

// --- Server & Socket.io ---
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: true, credentials: true },
});

io.use((socket, next) => {
  try {
    const { token } = socket.handshake.auth || {};
    if (!token) return next(new Error('No token'));
    socket.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (e) {
    next(new Error('Bad token'));
  }
});

io.on('connection', (socket) => {
  // join a chat room
  socket.on('join_chat', ({ chatId }) => {
    if (chatId) socket.join(String(chatId));
  });

  // send message
  socket.on('send_message', async ({ chatId, text }) => {
    if (!chatId || !text?.trim()) return;
    const msg = await Message.create({
      chatId,
      text: text.trim(),
      senderId: socket.user._id,
    });

    // update chat meta
    const chat = await Chat.findByIdAndUpdate(
      chatId,
      { lastMessage: msg.text, updatedAt: new Date() },
      { new: true }
    ).lean();

    // notify participants
    io.to(String(chatId)).emit('receive_message', msg);
    // update chat list ordering
    for (const s of await io.in(String(chatId)).fetchSockets()) {
      s.emit('chat_updated', chat);
    }
  });

  socket.on('disconnect', () => {});
});

server.listen(process.env.PORT, () => console.log('API on', process.env.PORT));

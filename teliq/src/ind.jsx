import React, { useEffect, useMemo, useRef, useState } from "react";
import io from "socket.io-client";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const styles = {
  app: "w-full h-screen flex bg-[#111b21] text-[#e9edef] overflow-hidden",
  sidebar: "w-[80px] min-w-[80px] h-full border-r border-[#233138] flex flex-col items-center py-4 bg-[#202c33]",
  chatList: "flex-1 overflow-y-auto custom-scroll",
  chatItem: "px-4 py-3 flex gap-3 items-center hover:bg-[#202c33] cursor-pointer border-b border-[#233138]",
  avatar: "w-10 h-10 rounded-full bg-[#2a3942] flex items-center justify-center text-sm",
  chatMeta: "flex-1 min-w-0",
  chatName: "text-[15px] truncate",
  chatSub: "text-[12px] text-[#8696a0] truncate",
  chatTime: "text-[11px] text-[#8696a0]",
  main: "flex-1 h-full flex flex-col",
  header: "h-[60px] px-4 flex items-center justify-between bg-[#202c33] border-b border-[#233138]",
  messages: "flex-1 overflow-y-auto p-6 bg-[url('https://i.imgur.com/8kq0y44.png')] bg-cover bg-center",
  inputRow: "p-3 bg-[#202c33] flex items-center gap-2",
  input: "flex-1 px-4 py-2 rounded-lg bg-[#111b21] text-[15px] outline-none placeholder:text-[#8696a0]",
  sendBtn: "px-4 py-2 rounded-lg bg-[#00a884] hover:bg-[#029e7e] text-[#111b21] font-medium",
  dayTag: "mx-auto my-4 w-fit px-3 py-1 text-[12px] rounded-lg bg-[#233138] text-[#cdd3d7]",
};

const timeHHMM = (d) => new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

function Bubble({ m, me }) {
  const mine = m.senderId === me?._id;
  return (
    <div className={`w-full flex mb-2 ${mine ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[70%] px-3 py-2 rounded-lg shadow-sm text-[14px] leading-snug break-words ${mine ? "bg-[#005c4b] text-[#e9edef] rounded-tr-none" : "bg-[#202c33] text-[#e9edef] rounded-tl-none"}`}>
        {m.text && <div className="whitespace-pre-wrap">{m.text}</div>}
        <div className="mt-1 text-[11px] text-[#b0b7bb] flex items-center gap-1 justify-end">
          <span>{timeHHMM(m.createdAt || Date.now())}</span>
          {m.read ? <span title="Read">✔✔</span> : <span title="Sent">✔</span>}
        </div>
      </div>
    </div>
  );
}

function Login({ onLoggedIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await axios.post(`${API_URL}/api/auth/login`, { email, password });
      localStorage.setItem("teliq_token", data.token);
      localStorage.setItem("teliq_user", JSON.stringify(data.user));
      onLoggedIn({ token: data.token, user: data.user });
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-[#0b141a]">
      <form onSubmit={submit} className="w-full max-w-sm bg-[#111b21] p-6 rounded-xl border border-[#233138]">
        <h2 className="text-xl font-semibold mb-4 text-[#e9edef]">Sign in</h2>
        <input className="w-full mb-3 px-3 py-2 rounded bg-[#202c33] text-[#e9edef]" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        <input className="w-full mb-4 px-3 py-2 rounded bg-[#202c33] text-[#e9edef]" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
        {error && <div className="text-red-400 text-sm mb-2">{error}</div>}
        <button disabled={loading} className={styles.sendBtn + " w-full justify-center flex"}>{loading ? "Signing in..." : "Sign in"}</button>
      </form>
    </div>
  );
}

export default function Ind() {
  const [me, setMe] = useState(() => {
    const u = localStorage.getItem("teliq_user");
    return u ? JSON.parse(u) : null;
  });
  const socketRef = useRef(null);
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState("");
  const messagesEnd = useRef(null);

  const [activeTab, setActiveTab] = useState("chats");

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, activeChat]);

  useEffect(() => {
    if (!me) return;
    axios.defaults.baseURL = API_URL;
    axios.defaults.headers.common["Authorization"] = `Bearer ${localStorage.getItem("teliq_token")}`;
    const loadChats = async () => {
      try {
        const { data } = await axios.get("/api/chats");
        setChats(data);
        if (!activeChat && data.length) setActiveChat(data[0]);
      } catch (e) {
        console.error("Load chats error", e);
      }
    };
    loadChats();
    const s = io(API_URL, { transports: ["websocket"], auth: { token: localStorage.getItem("teliq_token") } });
    socketRef.current = s;
    s.on("receive_message", (m) => { if (m.chatId === activeChat?._id) setMsgs((prev) => [...prev, m]); });
    s.on("chat_updated", (c) => {
      setChats((prev) => {
        const i = prev.findIndex((x) => x._id === c._id);
        if (i >= 0) {
          const copy = [...prev];
          copy[i] = c;
          return copy.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        }
        return [c, ...prev];
      });
    });
    return () => s.disconnect();
  }, [me]);

  useEffect(() => {
    if (!me || !activeChat || !socketRef.current) return;
    (async () => {
      try {
        const { data } = await axios.get(`/api/messages/${activeChat._id}`);
        setMsgs(data);
      } catch (e) {
        console.error("Load messages error", e);
      }
    })();
    socketRef.current.emit("join_chat", { chatId: activeChat._id });
  }, [activeChat, me]);

  const send = () => {
    if (!text.trim() || !activeChat) return;
    const payload = { chatId: activeChat._id, text: text.trim() };
    const temp = { _id: `tmp_${Date.now()}`, chatId: activeChat._id, text: payload.text, senderId: me._id, createdAt: new Date().toISOString(), read: false };
    setMsgs((prev) => [...prev, temp]);
    setText("");
    socketRef.current.emit("send_message", payload);
  };

  const logout = () => {
    localStorage.removeItem("teliq_token");
    localStorage.removeItem("teliq_user");
    setMe(null);
  };

  if (!me) return <Login onLoggedIn={({ user }) => setMe(user)} />;

  const menuItems = [
    { id: "chats", icon: "chat", label: "🇨🇭🇦🇹🇸" },
    { id: "logs", icon: "mobile", label: "🇱🇴🇬🇸" },
    { id: "status", icon: "camera", label: "🇸🇹🇦🇹🇺🇸" },
  ];

  return (
    <div className={styles.app}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        {menuItems.map((item) => (
          <div key={item.id} className={`p-4 cursor-pointer ${activeTab === item.id ? "bg-[#2a3942]" : ""}`} onClick={() => setActiveTab(item.id)} title={item.label}>
            {item.icon === "chat" && <i className="fas fa-comments text-white text-xl"></i>}
            {item.icon === "mobile" && <i className="fa fa-phone text-white text-xl"></i>}
            {item.icon === "camera" && <i className="fa fa-camera text-white text-xl"></i>}
          </div>
        ))}
        <button onClick={logout} className="mt-auto mb-4 px-2 py-1 bg-red-500 rounded text-white text-xs">Logout</button>
      </aside>

      {/* Main area */}
      {activeTab === "chats" && (
        <>
          {/* Chat list */}
          <div className="w-[280px] border-r border-[#233138] flex flex-col">
            <div className="p-3 border-b border-[#233138] font-semibold">Chats</div>
            <div className={styles.chatList}>
              {chats.map((c) => (
                <div key={c._id} className={styles.chatItem + (activeChat?._id === c._id ? " bg-[#202c33]" : "")} onClick={() => setActiveChat(c)}>
                  <div className={styles.avatar}>{c.isGroup ? "G" : (c.other?.name?.[0] || "C").toUpperCase()}</div>
                  <div className={styles.chatMeta}>
                    <div className="flex items-center justify-between gap-3">
                      <div className={styles.chatName}>{c.isGroup ? c.name : c.other?.name || "Chat"}</div>
                      <div className={styles.chatTime}>{c.updatedAt ? timeHHMM(c.updatedAt) : ""}</div>
                    </div>
                    <div className={styles.chatSub}>{c.lastMessage || "No messages yet"}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat window */}
          <main className={styles.main}>
            {activeChat ? (
              <>
                <div className={styles.header}>
                  <div className="flex items-center gap-3">
                    <div className={styles.avatar}>{activeChat?.other?.name?.[0]?.toUpperCase() || "C"}</div>
                    <div>
                      <div className="text-sm font-semibold">{activeChat?.isGroup ? activeChat?.name : activeChat?.other?.name}</div>
                      <div className="text-[11px] text-[#8696a0]">last seen recently</div>
                    </div>
                  </div>
                  <div className="text-[#8696a0] text-sm">🔍 📞 🎥 ⋮</div>
                </div>
                <div className={styles.messages}>
                  <div className={styles.dayTag}>Today</div>
                  {msgs.map((m) => <Bubble key={m._id} m={m} me={me} />)}
                  <div ref={messagesEnd} />
                </div>
                <div className={styles.inputRow}>
                  <input className={styles.input} placeholder="Type a message" value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} />
                  <button onClick={send} className={styles.sendBtn}>Send</button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-[#8696a0]">Select a chat</div>
            )}
          </main>
        </>
      )}

      {activeTab === "logs" && (
        <main className="flex-1 flex items-center justify-center text-white text-xl">📞 Logs placeholder</main>
      )}
      {activeTab === "status" && (
        <main className="flex-1 flex items-center justify-center text-white text-xl">📸 Status placeholder</main>
      )}
    </div>
  );
}

const css = `.custom-scroll{scrollbar-width:thin;scrollbar-color:#32434a transparent}
.custom-scroll::-webkit-scrollbar{width:8px}
.custom-scroll::-webkit-scrollbar-thumb{background:#32434a;border-radius:6px}`;
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.innerHTML = css;
  document.head.appendChild(style);
}

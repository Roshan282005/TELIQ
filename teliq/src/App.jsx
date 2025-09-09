import { useState } from "react";
import Tabs from "./components/Tabs";
import ChatList from "./components/ChatList.jsx";
import Archive from "./components/Archive.jsx";
import CallUI from "./components/CallUI.jsx";
import ProfileSetup from "./components/ProfileSetup.jsx";
import Login from "./components/Login.jsx";


export default function App() {
  const [activeTab, setActiveTab] = useState("chats");
  const [selectedChat, setSelectedChat] = useState(null);
  const [user, setUser] = useState(null); // Logged-in user
  const [contacts, setContacts] = useState([]); // User contacts

  // Sidebar content
  const renderSidebar = () => {
    switch (activeTab) {
      case "chats":
        return (
          <ChatList
            onSelectChat={setSelectedChat}
            user={user}
            contacts={contacts}
          />
        );
      case "archive":
        return <Archive />;
      case "calls":
        return <CallUI user={user} />;
      case "profile":
        return <ProfileSetup user={user} onUpdate={setUser} />;
      default:
        return null;
    }
  };

  // Main chat area
  const renderMain = () => {
    if (activeTab === "chats" && selectedChat) {
      return (
        <Chat
          token={user?.token}
          currentUser={user}
          chatId={selectedChat._id}
        />
      );
    }
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f0f0f0",
        }}
      >
        <h2>Select a chat to start messaging</h2>
      </div>
    );
  };

  // Show login first if no user
  if (!user) {
    return (
      <Login
        onLogin={(userData, contactList) => {
          setUser(userData);
          setContacts(contactList);
          setActiveTab("chats");
        }}
      />
    );
  }

  return (
    <div style={{ display: "flex", height: "100vh", backgroundColor: "#f0f0f0" }}>
      {/* Left tabs */}
      <div
        style={{
          width: "70px",
          backgroundColor: "#075e54",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "10px 0",
        }}
      >
        <Tabs activeTab={activeTab} onSelectTab={setActiveTab} />
      </div>

      {/* Sidebar */}
      <div
        style={{
          width: "350px",
          backgroundColor: "white",
          borderRight: "1px solid #e0e0e0",
          overflowY: "auto",
        }}
      >
        {renderSidebar()}
      </div>

      {/* Main content */}
      <div style={{ flex: 1 }}>{renderMain()}</div>
    </div>
  );
}

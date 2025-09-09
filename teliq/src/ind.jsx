import React, { useState } from "react";
import "./index.css";
import ChatGPTIcon from "./ChatGPTIcon";

function Inn() {
  const [activeTab, setActiveTab] = useState("chats");

  const menuItems = [
    { id: "chats", icon: "chat", label: "🇨🇭🇦🇹🇸" },
    { id: "logs", icon: "mobile", label: "🇱🇴🇬🇸" },
    { id: "status", icon: "camera", label: "🇸🇹🇦🇹🇺🇸" },
  ];

  return (
    <>
      {/* FontAwesome */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css"
      />

      {/* Sidebar Menu */}
      <div className="sidebar">
        {menuItems.map((item) => (
          <div
            key={item.id}
            className={`sidebar-item ${activeTab === item.id ? "active" : ""}`}
            onClick={() => setActiveTab(item.id)}
            title={item.label} // Tooltip
          >
            {/* Left green line */}
            {activeTab === item.id && <div className="active-indicator"></div>}

            {/* Icons */}
            {item.icon === "chat" && (
              <div className="comment">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="chat-icon"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  <line x1="9" y1="10" x2="15" y2="10" />
                  <line x1="9" y1="14" x2="13" y2="14" />
                </svg>
              </div>
            )}

            {item.icon === "mobile" && (
              <div className="phone">
                <i className="fa fa-phone"></i>
              </div>
            )}

            {item.icon === "camera" && (
              <div className="statuss">
                <div className="status-icon">
                  <div className="camera">
                    <div className="lens"></div>
                  </div>
                  <div className="green-dot"></div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Dynamic Content */}
      <div className="innerContainer">
        {activeTab === "chats" && (
          <>
            <h2>Chats</h2>
            <ul>
              <li>John Doe</li>
              <li>Jane Smith</li>
              <li>Mike Ross</li>
            </ul>
          </>
        )}

        {activeTab === "logs" && (
          <>
            <h2>Logs</h2>
            <ul>
              <li>Missed Call - Jane</li>
              <li>Incoming Call - Mike</li>
            </ul>
          </>
        )}

        {activeTab === "status" && (
          <>
            <h2>Status</h2>
            <ul>
              <li>John posted a status</li>
              <li>Mike updated status</li>
            </ul>
          </>
        )}
      </div>

      {/* Header / Top Section */}
      <div className="container">
        <h1 className="h1">
          <i className="fab fa-whatsapp"></i> 𐌕𐌄𐌋𐌉𐌒
        </h1>

        <div className="navBar">
          <div className="ham-menu" style={{ zIndex: 2 }}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>

      <div>
        <hr />
      </div>

      {/* ChatGPT AI Icon */}
      <div
        className="chatgpt-ai"
        style={{ marginTop: "150px", marginLeft: "10px" }}
      >
        <ChatGPTIcon size={50} />
      </div>
    </>
  );
}

export default Inn;

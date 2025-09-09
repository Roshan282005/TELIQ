import React from "react";
import { FaComments, FaArchive, FaPhone, FaUser } from "react-icons/fa";

const tabs = [
  { id: "chats", label: "Chats", icon: <FaComments size={24} /> },
  { id: "archive", label: "Archive", icon: <FaArchive size={24} /> },
  { id: "calls", label: "Calls", icon: <FaPhone size={24} /> },
  { id: "profile", label: "Profile", icon: <FaUser size={24} /> },
];

export default function Tabs({ activeTab, onSelectTab }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onSelectTab(tab.id)}
          style={{
            width: "50px",
            height: "50px",
            margin: "5px 0",
            borderRadius: "12px",
            border: "none",
            backgroundColor: activeTab === tab.id ? "#25d366" : "transparent",
            color: activeTab === tab.id ? "white" : "#ccc",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "0.2s",
          }}
          onMouseEnter={(e) => {
            if (activeTab !== tab.id) e.currentTarget.style.backgroundColor = "#128c7e";
          }}
          onMouseLeave={(e) => {
            if (activeTab !== tab.id) e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          {tab.icon}
        </button>
      ))}
    </div>
  );
}

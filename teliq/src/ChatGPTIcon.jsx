import React from "react";
import "./index.css";

const ChatGPTIcon = ({ size = 60 }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 240 240"
      fill="none"
      className="chatgpt-ai"
    >
      <defs>
        <linearGradient id="chatgptGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00C6FF">
            <animate
              attributeName="stop-color"
              values="#00C6FF; #7D2AE8; #FF0080; #00C6FF"
              dur="5s"
              repeatCount="indefinite"
            />
          </stop>
          <stop offset="50%" stopColor="#7D2AE8">
            <animate
              attributeName="stop-color"
              values="#7D2AE8; #FF0080; #00C6FF; #7D2AE8"
              dur="5s"
              repeatCount="indefinite"
            />
          </stop>
          <stop offset="100%" stopColor="#FF0080">
            <animate
              attributeName="stop-color"
              values="#FF0080; #00C6FF; #7D2AE8; #FF0080"
              dur="5s"
              repeatCount="indefinite"
            />
          </stop>
        </linearGradient>
      </defs>

      {/* ChatGPT Icon Path */}
      <path
        d="M132.6 22.1c-13.5-7.8-30.6-7.8-44.1 0l-44 25.3c-13.5 7.8-22 22.2-22 37.7v50.6c0 15.5 8.5 29.9 22 37.7l44 25.3c13.5 7.8 30.6 7.8 44.1 0l44-25.3c13.5-7.8 22-22.2 22-37.7V85.1c0-15.5-8.5-29.9-22-37.7l-44-25.3z"
        stroke="url(#chatgptGradient)"
        strokeWidth="12"
        fill="none"
      />
      <path
        d="M120 60a60 60 0 1060 60 60 60 0 00-60-60zm0 18a42 42 0 11-42 42 42 42 0 0142-42z"
        stroke="url(#chatgptGradient)"
        strokeWidth="10"
        fill="none"
      />
    </svg>
  );
};

export default ChatGPTIcon;

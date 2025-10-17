// Notification.js
import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";

// Global reference
let addNotificationGlobal;

// Call this function anywhere to show notification
export const notify = (message, type = "info", duration = 5000) => {
  if (addNotificationGlobal) {
    addNotificationGlobal({ message, type, duration });
  }
};

export default function NotificationContainer() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    addNotificationGlobal = ({ message, type, duration }) => {
      const id = Date.now();
      setNotifications((prev) => [...prev, { id, message, type, duration }]);
      // Auto remove notification after duration
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, duration);
    };
  }, []);

  const getTypeClasses = (type) => {
    switch (type) {
      case "success":
        return "bg-green-500";
      case "error":
        return "bg-red-500";
      case "warning":
        return "bg-yellow-500";
      default:
        return "bg-blue-500";
    }
  };

  return (
    <div className="fixed top-5 left-1/2 transform -translate-x-1/2 flex flex-col gap-3 z-50 pointer-events-none">
      {notifications.map((n) => (
        <div
          key={n.id}
          className={`relative px-6 py-3 rounded-lg shadow-lg text-white font-medium overflow-hidden pointer-events-auto ${getTypeClasses(
            n.type
          )} animate-slide-in`}
        >
          {n.message}

          {/* Progress bar */}
          <div
            className="absolute bottom-0 left-0 h-1 bg-white/70"
            style={{
              width: "100%",
              animation: `progressBar ${n.duration}ms linear forwards`,
            }}
          ></div>
        </div>
      ))}

      {/* Tailwind keyframes */}
      <style>
        {`
          @keyframes progressBar {
            0% { width: 100%; }
            100% { width: 0%; }
          }

          .animate-slide-in {
            animation: slideIn 0.3s ease-out;
          }

          @keyframes slideIn {
            0% { transform: translateY(-20px); opacity: 0; }
            100% { transform: translateY(0); opacity: 1; }
          }
        `}
      </style>
    </div>
  );
}

// Mount once in App.js
export const mountNotifications = () => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  root.render(<NotificationContainer />);
};

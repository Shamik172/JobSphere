import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";

let addNotificationGlobal;

export const notify = (message, type = "info", duration = 4000) => {
  if (addNotificationGlobal) {
    addNotificationGlobal({ message, type, duration });
  }
};

const toastConfig = {
  success: {
    icon: CheckCircle2,
    border: "rgba(16, 185, 129, 0.45)",
    badgeBg: "rgba(16, 185, 129, 0.15)",
    badgeText: "#059669",
    darkBadgeText: "#34D399",
    bar: "linear-gradient(90deg, #10B981, #34D399)",
  },
  error: {
    icon: XCircle,
    border: "rgba(239, 68, 68, 0.45)",
    badgeBg: "rgba(239, 68, 68, 0.15)",
    badgeText: "#DC2626",
    darkBadgeText: "#F87171",
    bar: "linear-gradient(90deg, #EF4444, #F87171)",
  },
  warning: {
    icon: AlertTriangle,
    border: "rgba(245, 158, 11, 0.45)",
    badgeBg: "rgba(245, 158, 11, 0.15)",
    badgeText: "#D97706",
    darkBadgeText: "#FBBF24",
    bar: "linear-gradient(90deg, #F59E0B, #FBBF24)",
  },
  info: {
    icon: Info,
    border: "rgba(14, 165, 233, 0.45)",
    badgeBg: "rgba(14, 165, 233, 0.15)",
    badgeText: "#0284C7",
    darkBadgeText: "#38BDF8",
    bar: "linear-gradient(90deg, #0EA5E9, #38BDF8)",
  },
};

export default function NotificationContainer() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    addNotificationGlobal = ({ message, type = "info", duration = 4000 }) => {
      const id = Date.now() + Math.random().toString(36).substring(2, 6);
      setNotifications((prev) => [...prev, { id, message, type, duration, isExiting: false }]);
      setTimeout(() => dismissNotification(id), duration);
    };
  }, []);

  const dismissNotification = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isExiting: true } : n))
    );
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 250);
  };

  return (
    <div className="fixed top-5 right-1/2 translate-x-1/2 sm:translate-x-0 sm:right-6 flex flex-col gap-2.5 z-[99999] pointer-events-none w-[90vw] max-w-[380px]">
      <style>{`
        @keyframes toastSlideIn {
          0% { opacity: 0; transform: translateY(-14px) scale(0.96); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes toastShrink {
          from { width: 100%; }
          to { width: 0%; }
        }
        .js-toast-active { animation: toastSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .js-toast-out { opacity: 0; transform: translateY(-8px) scale(0.95); transition: all 0.25s ease; }
      `}</style>

      {notifications.map((n) => {
        const conf = toastConfig[n.type] || toastConfig.info;
        const Icon = conf.icon;

        return (
          <div
            key={n.id}
            style={{ borderColor: conf.border }}
            className={`relative flex items-center gap-3 px-4 py-3.5 rounded-2xl overflow-hidden pointer-events-auto border shadow-2xl backdrop-blur-3xl transition-all
              bg-white/95 text-slate-900 border-white/90 shadow-slate-900/10
              dark:bg-slate-900/90 dark:text-slate-100 dark:border-white/15 dark:shadow-black/70
              ${n.isExiting ? "js-toast-out" : "js-toast-active"}
            `}
          >
            {/* Status icon badge */}
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
              style={{ background: conf.badgeBg }}
            >
              <Icon size={18} strokeWidth={2.4} style={{ color: conf.badgeText }} className="dark:hidden" />
              <Icon size={18} strokeWidth={2.4} style={{ color: conf.darkBadgeText }} className="hidden dark:block" />
            </div>

            {/* Notification message (Solid high-contrast text) */}
            <div className="flex-1 min-w-0 pr-1">
              <p className="text-xs sm:text-[13px] font-bold leading-snug text-slate-800 dark:text-slate-100">
                {n.message}
              </p>
            </div>

            {/* Manual dismiss */}
            <button
              type="button"
              onClick={() => dismissNotification(n.id)}
              className="shrink-0 p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
            >
              <X size={15} />
            </button>

            {/* Countdown line */}
            <div
              className="absolute bottom-0 left-0 h-[2.5px] rounded-full"
              style={{
                background: conf.bar,
                animation: `toastShrink ${n.duration}ms linear forwards`,
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

export const mountNotifications = () => {
  if (typeof document === "undefined") return;
  const existing = document.getElementById("jobsphere-notification-root");
  if (existing) return;

  const container = document.createElement("div");
  container.id = "jobsphere-notification-root";
  document.body.appendChild(container);
  const root = createRoot(container);
  root.render(<NotificationContainer />);
};
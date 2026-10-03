import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Search } from "lucide-react";
import { useTheme } from "../../context/ThemeContext.jsx";

export default function ListModal({
  title,
  subtitle,
  icon: Icon,
  onClose,
  search,
  onSearch,
  searchPlaceholder = "Search…",
  isEmpty = false,
  emptyText = "Nothing matches your search.",
  children,
}) {
  const { isDark } = useTheme();

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return createPortal(
    <div className={`lp-page ${isDark ? "dark" : ""}`}>
      <div
        className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/60 backdrop-blur-sm sm:items-center sm:p-6"
        onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="lp-glass-card flex max-h-[85vh] w-full flex-col overflow-hidden rounded-t-3xl sm:max-w-lg sm:rounded-3xl shadow-2xl">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-[var(--lp-pill-border)] p-4">
            {Icon && (
              <div className="lp-icon-chip">
                <Icon size={17} strokeWidth={2.4} />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-base font-black text-[var(--lp-text-title)]">{title}</h2>
              {subtitle && (
                <p className="truncate text-xs font-semibold text-[var(--lp-text-muted)]">{subtitle}</p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-white transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* Search Bar */}
          {onSearch && (
            <div className="px-4 pt-3">
              <div className="relative">
                <Search
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => onSearch(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="glass-input h-10 w-full rounded-xl pl-9 pr-3 text-xs sm:text-sm font-semibold"
                />
              </div>
            </div>
          )}

          {/* Body */}
          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-4">
            {isEmpty ? (
              <p className="py-10 text-center text-xs font-bold text-[var(--lp-text-muted)]">{emptyText}</p>
            ) : (
              children
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
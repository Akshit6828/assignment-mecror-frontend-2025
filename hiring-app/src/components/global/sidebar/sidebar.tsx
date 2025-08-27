import React, { useEffect, useRef } from "react";
import "./sidebar.scss";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  position?: "left" | "right";
  width?: string; // e.g. "300px"
}

export default function Sidebar({
  open,
  onClose,
  children,
  position = "left",
  width = "300px",
}: SidebarProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      setTimeout(() => closeBtnRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Click outside to close
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!open) return;
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open, onClose]);

  return (
    <div
      className={`sidebar-overlay ${open ? "open" : ""}`}
      aria-hidden={!open}
    >
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        className={`sidebar-panel ${position} ${open ? "open" : ""}`}
        style={{ width }}
      >
        <div className="sidebar-header">
          <div className="sidebar-title">Menu</div>
          <button
            ref={closeBtnRef}
            aria-label="Close sidebar"
            onClick={onClose}
            className="sidebar-close-btn"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="sidebar-body">{children}</div>
      </aside>
    </div>
  );
}

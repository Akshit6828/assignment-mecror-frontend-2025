import React from "react";
import "./modal.scss";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  modalBackgroundColor?: string; // 👈 accept background color as prop
  children: React.ReactNode;
  showCloseIcon?: Boolean;
  modalClass?: String;
}

export default function Modal({
  isOpen,
  onClose,
  modalBackgroundColor = "while",
  children,
  showCloseIcon = false,
  modalClass = "",
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="overlay">
      <div
        className={`modal ${modalClass}`}
        style={{ backgroundColor: modalBackgroundColor }}
      >
        {showCloseIcon && (
          <span className="close-button" onClick={onClose}>
            ✕
          </span>
        )}
        {children}
      </div>
    </div>
  );
}

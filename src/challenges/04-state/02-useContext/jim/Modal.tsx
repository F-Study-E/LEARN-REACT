import { useState, type ChangeEvent, type ReactNode } from "react";
import { ModalContext, useModalContext } from "./useModal";

export default function Modal({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  return (
    <ModalContext.Provider value={{ isOpen, open, close }}>
      {children}
    </ModalContext.Provider>
  );
}

Modal.Trigger = function Trigger({ children }: { children: ReactNode }) {
  const { open } = useModalContext();
  return (
    <div onClick={open} style={{ display: "inline-block", cursor: "pointer" }}>
      {children}
    </div>
  );
};

Modal.Overlay = function Overlay({ children }: { children: ReactNode }) {
  const { isOpen, close } = useModalContext();
  if (!isOpen) return null;

  return (
    <div
      onClick={close}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
      }}
    >
      {/* 클릭 이벤트가 Overlay까지 버블링되지 않도록 차단 */}
      <div onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  );
};

Modal.Content = function Content({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "12px",
        padding: "24px",
        minWidth: "360px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
      }}
    >
      {children}
    </div>
  );
};

Modal.Header = function Header({ children }: { children: ReactNode }) {
  const { close } = useModalContext();
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "16px",
        paddingBottom: "16px",
        borderBottom: "1px solid #e5e7eb",
      }}
    >
      <span style={{ fontSize: "16px", fontWeight: 600, color: "#111827" }}>
        {children}
      </span>
      <button
        onClick={close}
        style={{
          border: "none",
          background: "none",
          fontSize: "18px",
          color: "#9ca3af",
          cursor: "pointer",
          lineHeight: 1,
        }}
      >
        ✕
      </button>
    </div>
  );
};

Modal.Body = function Body({ children }: { children: ReactNode }) {
  return (
    <div style={{ color: "#374151", fontSize: "14px", lineHeight: "1.6" }}>
      {children}
    </div>
  );
};

Modal.Footer = function Footer({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        gap: "8px",
        marginTop: "24px",
        paddingTop: "16px",
        borderTop: "1px solid #e5e7eb",
      }}
    >
      {children}
    </div>
  );
};

Modal.CloseButton = function CloseButton({
  label = "닫기",
}: {
  label?: string;
}) {
  const { close } = useModalContext();
  return (
    <button
      onClick={close}
      style={{
        padding: "8px 16px",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        background: "#ffffff",
        color: "#374151",
        fontSize: "14px",
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
};

// --- Button ---

type ButtonVariant = "primary" | "danger" | "ghost";

const buttonStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    background: "#3b82f6",
    color: "#fff",
    border: "none",
  },
  danger: {
    background: "#ef4444",
    color: "#fff",
    border: "none",
  },
  ghost: {
    background: "#ffffff",
    color: "#374151",
    border: "1px solid #e5e7eb",
  },
};

Modal.Button = function Button({
  children,
  variant = "primary",
  onClick,
  close: shouldClose = false,
}: {
  children: ReactNode;
  variant?: ButtonVariant;
  onClick?: () => void;
  close?: boolean; // true면 클릭 시 모달 닫힘
}) {
  const { close } = useModalContext();

  const handleClick = () => {
    onClick?.();
    if (shouldClose) close();
  };

  return (
    <button
      onClick={handleClick}
      style={{
        ...buttonStyles[variant],
        padding: "8px 16px",
        borderRadius: "8px",
        fontSize: "14px",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
};

// --- Input ---

type InputType = "text" | "email" | "password" | "number";

Modal.Input = function Input({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
}: {
  label?: string;
  type?: InputType;
  placeholder?: string;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      {label && (
        <label style={{ fontSize: "13px", color: "#6b7280" }}>{label}</label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        style={{
          width: "100%",
          padding: "8px 12px",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          fontSize: "14px",
          color: "#111827",
          outline: "none",
          boxSizing: "border-box",
        }}
      />
    </div>
  );
};

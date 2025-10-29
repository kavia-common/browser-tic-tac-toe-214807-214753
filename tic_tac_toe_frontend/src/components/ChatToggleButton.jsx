import React from "react";

/**
 * Floating toggle button to open/close chat.
 */

// PUBLIC_INTERFACE
export default function ChatToggleButton({ isOpen, onToggle }) {
  return (
    <button
      className={`chat-toggle ${isOpen ? "open" : ""}`}
      onClick={onToggle}
      aria-label={isOpen ? "Hide assistant" : "Show assistant"}
      title={isOpen ? "Hide assistant" : "Ask the game assistant"}
    >
      {isOpen ? "Close" : "Chat"}
    </button>
  );
}

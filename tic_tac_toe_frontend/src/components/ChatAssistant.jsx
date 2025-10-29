import React, { useEffect, useMemo, useRef, useState } from "react";
import { chatWithOpenAI, suggestNextMove } from "../openaiClient";

/**
 * ChatAssistant: A collapsible chat widget for strategy or rules help.
 * - Floating bottom-right when closed shows a round toggle button (handled by ChatToggleButton).
 * - When open, shows a panel with messages, an input, and send button.
 * - Theme adheres to the light theme defined in App.css.
 */

// PUBLIC_INTERFACE
export default function ChatAssistant({
  isOpen,
  onClose,
  board = Array(9).fill(null),
  nextPlayer = "X",
}) {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! Ask me about Tic Tac Toe strategy or rules." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const abortRef = useRef(null);
  const listRef = useRef(null);

  const canSend = input.trim().length > 0 && !loading;

  const systemPrompt = useMemo(
    () => ({
      role: "system",
      content:
        "You are a helpful Tic Tac Toe assistant. Provide concise, friendly guidance using the current board state if provided.",
    }),
    []
  );

  useEffect(() => {
    // Auto-scroll to bottom on new messages
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSuggest = () => {
    const move = suggestNextMove(board, nextPlayer);
    if (move === null || move === undefined) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "It looks like there are no available moves." },
      ]);
      return;
    }
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: `Suggestion: Consider placing ${nextPlayer} in square ${move + 1} for a stronger position.`,
      },
    ]);
  };

  const send = async () => {
    if (!canSend) return;
    const userMsg = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const controller = new AbortController();
      abortRef.current = controller;

      const augmentedMessages = [
        systemPrompt,
        ...messages,
        userMsg,
        {
          role: "user",
          content:
            `FYI, current board is: ${JSON.stringify(board)}; next player: ${nextPlayer}.` +
            " Use this to tailor your advice.",
        },
      ];

      const { content } = await chatWithOpenAI({
        messages: augmentedMessages,
        signal: controller.signal,
      });

      setMessages((prev) => [...prev, { role: "assistant", content }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I couldn't reach the assistant. " +
            (err?.message || "Please try again later."),
        },
      ]);
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="chat-assistant-root" role="dialog" aria-label="Tic Tac Toe Assistant">
      <div className="chat-header">
        <div className="chat-title">Game Assistant</div>
        <div className="chat-header-actions">
          <button className="chat-suggest-btn" onClick={handleSuggest} title="Suggest next move">
            Suggest
          </button>
          <button className="chat-close-btn" onClick={onClose} aria-label="Close assistant">
            ✕
          </button>
        </div>
      </div>

      <div className="chat-messages" ref={listRef}>
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`chat-message ${m.role === "user" ? "user" : "assistant"}`}
          >
            {m.content}
          </div>
        ))}
        {loading && <div className="chat-message assistant">Thinking…</div>}
      </div>

      <div className="chat-input-row">
        <textarea
          className="chat-input"
          placeholder="Ask about rules or strategy…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          rows={2}
        />
        <button className="chat-send-btn" onClick={send} disabled={!canSend}>
          Send
        </button>
      </div>
    </div>
  );
}

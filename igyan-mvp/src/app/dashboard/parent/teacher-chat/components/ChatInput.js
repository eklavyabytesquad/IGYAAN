"use client";

import { useState } from "react";
import { MESSAGE_FLAGS } from "./constants";

export default function ChatInput({ onSend, sending, defaultFlag = "general" }) {
  const [message, setMessage] = useState("");
  const [flag, setFlag] = useState(defaultFlag);

  const handleSend = () => {
    if (!message.trim()) return;
    onSend(message.trim(), flag);
    setMessage("");
    if (defaultFlag === "general") setFlag("general");
  };

  return (
    <div className="border-t border-zinc-200 dark:border-zinc-700 p-3 bg-white dark:bg-zinc-900">
      {/* Flag selector */}
      <div className="flex items-center gap-2 mb-2 overflow-x-auto pb-1">
        <span className="text-xs text-zinc-500 dark:text-zinc-400 whitespace-nowrap">Tag:</span>
        {Object.entries(MESSAGE_FLAGS).map(([key, val]) => (
          <button
            key={key}
            onClick={() => setFlag(key)}
            className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-all whitespace-nowrap ${
              flag === key
                ? key === "general"
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                  : val.color + " ring-2 ring-offset-1 ring-current"
                : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
            }`}
          >
            {val.icon} {val.label}
          </button>
        ))}
      </div>

      <div className="flex items-end gap-2">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder={
            flag === "complaint"
              ? "Describe your complaint..."
              : flag === "homework"
              ? "Ask about homework..."
              : "Type a message..."
          }
          rows={2}
          className="flex-1 rounded-xl border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-800 px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button
          onClick={handleSend}
          disabled={sending || !message.trim()}
          className="rounded-xl bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white p-3 transition-colors"
        >
          {sending ? (
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" strokeDasharray="60" strokeDashoffset="20" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

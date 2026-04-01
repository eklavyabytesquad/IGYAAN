"use client";

import { useState, useRef, useEffect } from "react";
import { MESSAGE_FLAGS } from "./constants";

export default function ChatMessages({ messages, userId, classTeacherName, formatTime }) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="h-[500px] overflow-y-auto p-4 space-y-3" style={{ background: 'var(--dashboard-background)' }}>
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full" style={{ color: 'var(--dashboard-muted)' }}>
          <span className="text-4xl mb-2">💬</span>
          <p className="text-sm">No messages yet. Start a conversation with the class teacher!</p>
        </div>
      ) : (
        messages.map((msg) => {
          const isMe = msg.sender_id === userId;
          const flagInfo = MESSAGE_FLAGS[msg.flag] || MESSAGE_FLAGS.general;
          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                  isMe
                    ? "text-white rounded-br-md"
                    : "rounded-bl-md"
                }`}
                style={
                  isMe
                    ? { background: 'var(--dashboard-primary)' }
                    : { background: 'var(--dashboard-surface-solid)', color: 'var(--dashboard-heading)', border: '1px solid var(--dashboard-border)' }
                }
              >
                {/* Sender label for teacher messages */}
                {!isMe && (
                  <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--dashboard-primary)' }}>
                    {classTeacherName || "Class Teacher"}
                  </p>
                )}

                {/* Flag badge */}
                {msg.flag !== "general" && (
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-bold mb-1 ${
                      isMe ? "bg-white/20 text-white" : flagInfo.color
                    }`}
                  >
                    {flagInfo.icon} {flagInfo.label}
                  </span>
                )}
                <p className="text-sm whitespace-pre-wrap">{msg.message_text}</p>
                <div className={`flex items-center gap-1 mt-1 ${isMe ? "justify-end" : "justify-start"}`}>
                  <span className={`text-xs ${isMe ? "text-white/70" : ""}`} style={!isMe ? { color: 'var(--dashboard-muted)' } : undefined}>
                    {formatTime(msg.created_at)}
                  </span>
                  {isMe && msg.is_read && <span className="text-xs text-white/70">✓✓</span>}
                  {isMe && !msg.is_read && <span className="text-xs text-white/50">✓</span>}
                </div>
              </div>
            </div>
          );
        })
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}

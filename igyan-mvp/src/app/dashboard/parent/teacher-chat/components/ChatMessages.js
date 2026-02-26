"use client";

import { useState, useRef, useEffect } from "react";
import { MESSAGE_FLAGS } from "./constants";

export default function ChatMessages({ messages, userId, classTeacherName, formatTime }) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="h-[500px] overflow-y-auto p-4 space-y-3 bg-zinc-50 dark:bg-zinc-950">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-zinc-400">
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
                    ? "bg-green-500 text-white rounded-br-md"
                    : "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700 rounded-bl-md"
                }`}
              >
                {/* Sender label for teacher messages */}
                {!isMe && (
                  <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-0.5">
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
                  <span className={`text-xs ${isMe ? "text-green-100" : "text-zinc-400"}`}>
                    {formatTime(msg.created_at)}
                  </span>
                  {isMe && msg.is_read && <span className="text-xs text-green-100">✓✓</span>}
                  {isMe && !msg.is_read && <span className="text-xs text-green-200">✓</span>}
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

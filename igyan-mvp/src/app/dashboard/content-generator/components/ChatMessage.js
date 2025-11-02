'use client';

import { Bot, User } from 'lucide-react';

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex items-end gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <span className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
          <Bot size={18} />
        </span>
      )}

      <div
        className={`max-w-[85%] rounded-3xl px-5 py-4 text-sm leading-relaxed shadow-lg md:max-w-[75%] ${
          isUser
            ? 'bg-linear-to-r from-emerald-500 via-teal-500 to-sky-500 text-white'
            : 'bg-white/90 text-zinc-800 backdrop-blur dark:bg-zinc-800/90 dark:text-zinc-100'
        }`}
      >
        {message.showTemplateButton && (
          <div className={`mb-3 flex items-center gap-2 border-b pb-3 text-xs font-semibold uppercase tracking-wide ${
            isUser ? 'border-white/30 text-white/90' : 'border-zinc-200 dark:border-zinc-600 text-indigo-500 dark:text-indigo-300'
          }`}>
            {message.type === 'ppt' ? '📊 Presentation ready' : '📄 Document ready'}
          </div>
        )}
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>

      {isUser && (
        <span className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
          <User size={18} />
        </span>
      )}
    </div>
  );
}

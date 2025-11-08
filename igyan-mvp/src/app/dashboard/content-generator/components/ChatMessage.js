'use client';

import { Bot, User } from 'lucide-react';

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex items-end gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <span className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full" style={{ backgroundColor: 'var(--dashboard-primary-light)', color: 'var(--dashboard-primary)' }}>
          <Bot size={18} />
        </span>
      )}

      <div
        className={`max-w-[85%] rounded-3xl px-5 py-4 text-sm leading-relaxed shadow-lg md:max-w-[75%]`}
        style={isUser ? 
          { background: 'var(--dashboard-primary)', color: 'white' } : 
          { backgroundColor: 'var(--dashboard-surface-solid)', color: 'var(--dashboard-text)' }
        }
      >
        {message.showTemplateButton && (
          <div className={`mb-3 flex items-center gap-2 pb-3 text-xs font-semibold uppercase tracking-wide`} style={{ 
            borderBottom: isUser ? '1px solid rgba(255,255,255,0.3)' : '1px solid var(--dashboard-border)',
            color: isUser ? 'rgba(255,255,255,0.9)' : 'var(--dashboard-primary)'
          }}>
            {message.type === 'ppt' ? '📊 Presentation ready' : '📄 Document ready'}
          </div>
        )}
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>

      {isUser && (
        <span className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full" style={{ backgroundColor: 'var(--dashboard-primary-light)', color: 'var(--dashboard-primary)' }}>
          <User size={18} />
        </span>
      )}
    </div>
  );
}

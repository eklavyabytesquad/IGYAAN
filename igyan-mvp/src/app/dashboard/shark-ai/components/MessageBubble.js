'use client';

import { Loader2 } from 'lucide-react';

export default function MessageBubble({ message }) {
  return (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
      <div
        className={`max-w-[90%] md:max-w-[80%] rounded-xl px-4 py-3 shadow-md ${
          message.role === 'user'
            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 rounded-br-sm text-white'
            : 'dashboard-card rounded-bl-sm'
        }`}
      >
        {message.role === 'assistant' && (
          <div className="flex items-center gap-2 mb-2 pb-2" style={{ borderBottom: '1px solid var(--dashboard-border)' }}>
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
              AI
            </div>
            <span className="text-xs font-semibold" style={{ color: 'var(--dashboard-muted)' }}>Shark AI</span>
          </div>
        )}
        
        {/* User message - simple white text */}
        {message.role === 'user' ? (
          <p className="text-white text-sm leading-relaxed font-medium whitespace-pre-wrap">
            {message.content}
          </p>
        ) : (
          /* Assistant message - formatted with styling */
          <div className="text-sm leading-relaxed">
            {message.content.split('\n').map((line, i) => {
              // Handle headers with emojis
              if (line.startsWith('# ')) {
                const content = line.substring(2).trim();
                return (
                  <div key={i} className="mb-3 mt-1">
                    <h1 className="text-lg md:text-xl font-bold" style={{ color: 'var(--dashboard-heading)' }}>
                      {content}
                    </h1>
                    <div className="h-0.5 w-16 rounded-full mt-1.5" style={{ background: 'var(--dashboard-primary)' }}></div>
                  </div>
                );
              }
              if (line.startsWith('## ')) {
                const content = line.substring(3).trim();
                return (
                  <h2 key={i} className="text-base md:text-lg font-bold mb-2 mt-3 flex items-center gap-2" style={{ color: 'var(--dashboard-heading)' }}>
                    <span className="w-0.5 h-4 rounded-full" style={{ background: 'var(--dashboard-primary)' }}></span>
                    {content}
                  </h2>
                );
              }
              if (line.startsWith('### ')) {
                const content = line.substring(4).trim();
                return (
                  <h3 key={i} className="text-sm md:text-base font-semibold mb-1.5 mt-2" style={{ color: 'var(--dashboard-text)' }}>
                    {content}
                  </h3>
                );
              }
              // Handle bullet points with better styling
              if (line.startsWith('• ') || line.startsWith('- ')) {
                const content = line.substring(2).trim();
                const boldMatch = content.match(/\*\*(.*?)\*\*/);
                if (boldMatch) {
                  const parts = content.split(/\*\*(.*?)\*\*/);
                  return (
                    <div key={i} className="flex items-start gap-2 mb-1.5 ml-1">
                      <span className="mt-0.5 text-base shrink-0" style={{ color: 'var(--dashboard-primary)' }}>•</span>
                      <span className="flex-1 text-sm leading-relaxed">
                        {parts.map((part, idx) => 
                          idx % 2 === 1 ? (
                            <strong key={idx} className="font-bold" style={{ color: 'var(--dashboard-heading)' }}>{part}</strong>
                          ) : (
                            <span key={idx} style={{ color: 'var(--dashboard-text)' }}>{part}</span>
                          )
                        )}
                      </span>
                    </div>
                  );
                }
                return (
                  <div key={i} className="flex items-start gap-2 mb-1.5 ml-1">
                    <span className="mt-0.5 text-base shrink-0" style={{ color: 'var(--dashboard-primary)' }}>•</span>
                    <span className="flex-1 text-sm leading-relaxed" style={{ color: 'var(--dashboard-text)' }}>{content}</span>
                  </div>
                );
              }
              // Handle bold text with background highlight
              if (line.includes('**')) {
                const parts = line.split(/\*\*(.*?)\*\*/);
                return (
                  <p key={i} className="mb-2 text-sm leading-relaxed">
                    {parts.map((part, idx) => 
                      idx % 2 === 1 ? (
                        <strong key={idx} className="font-bold" style={{ color: 'var(--dashboard-heading)' }}>{part}</strong>
                      ) : (
                        <span key={idx} style={{ color: 'var(--dashboard-text)' }}>{part}</span>
                      )
                    )}
                  </p>
                );
              }
              // Regular paragraph with better line height
              if (line.trim()) {
                return <p key={i} className="mb-2 text-sm leading-relaxed" style={{ color: 'var(--dashboard-text)' }}>{line}</p>;
              }
              return <div key={i} className="h-1"></div>;
            })}
          </div>
        )}
      </div>
    </div>
  );
}

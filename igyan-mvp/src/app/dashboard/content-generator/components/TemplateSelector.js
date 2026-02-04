'use client';

import { Palette } from 'lucide-react';

export default function TemplateSelector({ templates, selectedTemplate, onSelect, type }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
          <Palette size={18} />
        </span>
        <div>
          <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            Choose a {type === 'ppt' ? 'presentation' : type === 'shark-ppt' ? 'pitch deck' : 'PDF'} style
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Instantly update the look and feel before downloading
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {templates.map((template) => {
          const isActive = selectedTemplate?.id === template.id;
          // PPT and Shark-PPT use hex colors, PDF uses RGB arrays
          const usesHex = type === 'ppt' || type === 'shark-ppt';
          const primaryColor = usesHex
            ? `#${template.colors.primary}`
            : `rgb(${template.colors.primary.join(',')})`;
          const secondaryColor = usesHex
            ? `#${template.colors.secondary}`
            : `rgb(${template.colors.secondary.join(',')})`;

          return (
            <button
              key={template.id}
              onClick={() => onSelect(template)}
              className={`group relative overflow-hidden rounded-2xl border bg-white/90 p-3 text-left transition-all dark:bg-zinc-900/80 ${
                isActive
                  ? 'border-indigo-500 shadow-lg shadow-indigo-500/20'
                  : 'border-transparent hover:border-indigo-300 hover:shadow-md hover:shadow-indigo-200/60 dark:hover:shadow-indigo-900/40'
              }`}
              type="button"
            >
              <div className="mb-3 flex items-center gap-2">
                <div className="h-10 w-10 rounded-xl border border-white/80 shadow-sm" style={{ background: primaryColor }} />
                <div className="h-8 w-8 rounded-xl border border-white/80 shadow-sm" style={{ background: secondaryColor }} />
              </div>

              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                {template.name}
              </p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                {type === 'ppt' ? 'Slide deck' : type === 'shark-ppt' ? 'Pitch deck' : 'Document'} palette
              </p>

              {isActive && (
                <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-indigo-500" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

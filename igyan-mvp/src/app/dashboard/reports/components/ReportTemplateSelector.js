'use client';

import { Palette } from 'lucide-react';

export const reportTemplates = [
  {
    id: 'professional',
    name: 'Professional Blue',
    primary: [99, 102, 241],
    secondary: [79, 70, 229],
    accent: [165, 180, 252],
    text: [31, 41, 55],
  },
  {
    id: 'success',
    name: 'Success Green',
    primary: [16, 185, 129],
    secondary: [5, 150, 105],
    accent: [167, 243, 208],
    text: [6, 78, 59],
  },
  {
    id: 'professional-dark',
    name: 'Professional Dark',
    primary: [55, 65, 81],
    secondary: [31, 41, 55],
    accent: [156, 163, 175],
    text: [17, 24, 39],
  },
  {
    id: 'ocean',
    name: 'Ocean Blue',
    primary: [14, 165, 233],
    secondary: [2, 132, 199],
    accent: [186, 230, 253],
    text: [7, 89, 133],
  },
  {
    id: 'sunset',
    name: 'Sunset Orange',
    primary: [251, 146, 60],
    secondary: [234, 88, 12],
    accent: [254, 215, 170],
    text: [124, 45, 18],
  },
  {
    id: 'royal',
    name: 'Royal Purple',
    primary: [147, 51, 234],
    secondary: [126, 34, 206],
    accent: [233, 213, 255],
    text: [88, 28, 135],
  },
];

export default function ReportTemplateSelector({ selectedTemplate, onSelect, reportType }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Palette className="text-indigo-600 dark:text-indigo-400" size={20} />
        <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Choose Report Color Theme
        </h4>
      </div>
      
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {reportTemplates.map((template) => (
          <button
            key={template.id}
            onClick={() => onSelect(template)}
            className={`group relative rounded-xl border-2 p-3 transition ${
              selectedTemplate.id === template.id
                ? `border-${reportType === 'class' ? 'indigo' : 'emerald'}-500 bg-${reportType === 'class' ? 'indigo' : 'emerald'}-50 dark:bg-${reportType === 'class' ? 'indigo' : 'emerald'}-900/20`
                : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600'
            }`}
          >
            <div className="space-y-2">
              <div className="flex gap-1">
                <div
                  className="h-6 w-6 rounded-md shadow-sm"
                  style={{ backgroundColor: `rgb(${template.primary.join(',')})` }}
                />
                <div
                  className="h-6 w-6 rounded-md shadow-sm"
                  style={{ backgroundColor: `rgb(${template.secondary.join(',')})` }}
                />
              </div>
              <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                {template.name}
              </p>
            </div>
            
            {selectedTemplate.id === template.id && (
              <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-blue-500" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

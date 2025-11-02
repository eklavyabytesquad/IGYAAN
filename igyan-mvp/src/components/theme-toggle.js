"use client";

import { useTheme } from "@/components/theme-provider";

export default function ThemeToggle({ className = "" }) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle color theme"
      className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200/70 bg-white/85 text-zinc-700 shadow-sm transition-colors hover:border-sky-400 hover:text-sky-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 dark:border-zinc-700/80 dark:bg-zinc-900/80 dark:text-zinc-200 dark:hover:border-sky-500 dark:hover:text-sky-300 ${className}`}
    >
      {isDark ? (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v.01M21 12h.01M12 21v.01M3 12h.01M5.6 5.6l.01.01M18.39 5.6l.01.01M18.39 18.4l.01-.01M5.6 18.4l.01-.01"
          />
          <circle cx="12" cy="12" r="4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 12.79A9 9 0 1111.21 3c-.14.63-.21 1.28-.21 1.94 0 5.02 4.06 9.08 9.08 9.08.66 0 1.31-.07 1.92-.2z"
          />
        </svg>
      )}
    </button>
  );
}

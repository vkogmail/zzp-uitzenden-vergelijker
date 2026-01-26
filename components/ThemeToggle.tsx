"use client";

import { useTheme } from "./ThemeProvider";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="fixed top-8 right-8 p-3 rounded-full transition-all z-50 flex items-center justify-center cursor-pointer"
      style={{
        background: 'var(--color-surface-dark)',
        color: 'var(--color-white)',
        boxShadow: 'var(--shadow-l)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.opacity = '0.9';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = '1';
      }}
      title={theme === "light" ? "Schakel naar donkere modus" : "Schakel naar lichte modus"}
      aria-label={theme === "light" ? "Schakel naar donkere modus" : "Schakel naar lichte modus"}
    >
      {theme === "light" ? (
        <Moon className="w-5 h-5" />
      ) : (
        <Sun className="w-5 h-5" />
      )}
    </button>
  );
}

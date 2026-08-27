"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "fth-theme";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const current =
      document.documentElement.dataset.theme === "light"
        ? "light"
        : "dark";

    setTheme(current);
    setMounted(true);
  }, []);

  function changeTheme(newTheme: Theme) {
    document.documentElement.dataset.theme = newTheme;
    document.documentElement.style.colorScheme = newTheme;

    localStorage.setItem(STORAGE_KEY, newTheme);

    setTheme(newTheme);
  }

  if (!mounted) return null;

  return (
    <div
      className="fth-theme-toggle"
      role="group"
      aria-label="Choose appearance"
    >
      <button
        type="button"
        onClick={() => changeTheme("light")}
        aria-pressed={theme === "light"}
        className={
          theme === "light"
            ? "fth-theme-option fth-theme-option-active"
            : "fth-theme-option"
        }
      >
        <span aria-hidden="true">☀</span>
        <span>Light</span>
      </button>

      <button
        type="button"
        onClick={() => changeTheme("dark")}
        aria-pressed={theme === "dark"}
        className={
          theme === "dark"
            ? "fth-theme-option fth-theme-option-active"
            : "fth-theme-option"
        }
      >
        <span aria-hidden="true">☾</span>
        <span>Dark</span>
      </button>

      <style jsx>{`
        .fth-theme-option {
          display: flex;
          align-items: center;
          gap: 7px;

          border: 0;
          border-radius: 999px;

          padding: 9px 13px;

          background: transparent;
          color: var(--muted);

          font-size: 12px;
          font-weight: 800;

          cursor: pointer;
        }

        .fth-theme-option:hover {
          color: var(--foreground);
        }

        .fth-theme-option-active {
          background: linear-gradient(
            135deg,
            var(--brand-primary),
            var(--brand-secondary)
          );

          color: white;

          box-shadow: 0 5px 18px var(--brand-soft);
        }

        :global(
            :root[data-theme="dark"]
              .fth-theme-option-active
          ) {
          color: #071009;
        }

        @media (max-width: 640px) {
          .fth-theme-option {
            padding: 8px 10px;
          }
        }
      `}</style>
    </div>
  );
}
"use client";

import { useEffect } from "react";
import { zustandStore } from "@/zustand/store";
import type { Theme } from "@/zustand/store";

const STORAGE_KEY = "typespace_theme";

function loadThemeFromStorage(): Theme | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === "light" || raw === "dark") return raw;
  return null;
}

export default function ThemeProvider() {
  const theme = zustandStore((s) => s.theme);
  const setTheme = zustandStore((s) => s.setTheme);

  useEffect(() => {
    const stored = loadThemeFromStorage();
    if (stored) setTheme(stored);
  }, [setTheme]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  return null;
}

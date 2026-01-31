"use client";

import { zustandStore } from "@/zustand/store";
import SunIcon from "./SunIcon";
import MoonIcon from "./MoonIcon";

export default function ThemeToggle() {
  const { theme, setTheme } = zustandStore();
  const isLight = theme === "light";

  function toggleTheme() {
    setTheme(isLight ? "dark" : "light");
  }

  return (
    <button
      onClick={toggleTheme}
      className={`rounded-full p-2 duration-300 transition-transform border cursor-pointer ${
        isLight
          ? "bg-zinc-100 text-zinc-500 border-zinc-200 hover:bg-zinc-200"
          : "bg-[rgba(39,39,43,0.4)] text-[#33E092] border-zinc-800 hover:border-zinc-700"
      } ${isLight ? "-rotate-180" : "rotate-0"}`}
      aria-label="Toggle theme"
      title={isLight ? "Switch to dark theme" : "Switch to light theme"}
    >
      {isLight ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

import { useEffect } from 'react';
import { zustandStore } from '../zustand/store';

export const useKeyboardShortcuts = () => {
  const { setNote } = zustandStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        const isCtrlOrCmd = e.ctrlKey || e.metaKey;

        if (isCtrlOrCmd && e.altKey && e.key.toLowerCase() === "c") {
          e.preventDefault();
          clearPage();
        }

        if (isCtrlOrCmd && e.altKey && e.key.toLowerCase() === "l") {
          e.preventDefault();
          const { theme, setTheme } = zustandStore.getState();
          setTheme(theme === "light" ? "dark" : "light");
        }
      
      if (e.key === "F11") {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [setNote]);

};

export const clearPage = () => {
    zustandStore.getState().setNote("");
};

export const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
};

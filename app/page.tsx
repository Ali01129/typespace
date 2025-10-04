"use client";

import { useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import { zustandStore } from '../zustand/store';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

export default function Page() {
  const { note, setNote } = zustandStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Use the custom keyboard shortcuts hook
  useKeyboardShortcuts();

  useEffect(() => {
    const savedNote = localStorage.getItem("note");
    if (savedNote) setNote(savedNote);
  }, []);

  useEffect(() => {
    localStorage.setItem("note", note);
  }, [note]);

  return (
    <main className="flex min-h-screen flex-col bg-black text-white">
      {/* Navbar */}
      <Navbar note={note} />

      {/* Editor */}
      <div className="flex-1 flex justify-center p-4">
        <textarea
          ref={textareaRef}
          className="w-full max-w-2xl h-[70vh] p-4 font-mono text-sm shadow-lg rounded-lg focus:outline-none scrollbar-none overflow-y-scroll resize-none bg-black text-white"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Start typing..."
        />
      </div>
    </main>
  );
}

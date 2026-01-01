"use client";

import Navbar from "../components/Navbar";
import TextEditor from "../components/TextEditor";
import { zustandStore } from "../zustand/store";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";

export default function Page() {
  const { note } = zustandStore();

  useKeyboardShortcuts();

  return (
    <main className="flex min-h-screen flex-col bg-black text-white">
      <Navbar note={note} />

      <div className="flex-1 flex justify-center p-4">
        <TextEditor />
      </div>
    </main>
  );
}

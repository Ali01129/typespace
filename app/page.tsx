"use client";

import { useEffect, useState } from "react";

export default function Page() {
  const [note, setNote] = useState("");

  useEffect(() => {
    const savedNote = localStorage.getItem("note");
    if (savedNote) setNote(savedNote);
  }, []);

  useEffect(() => {
    localStorage.setItem("note", note);
  }, [note]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black p-4">
      <textarea
        className="w-full max-w-2xl h-[70vh] p-4 font-mono text-lg shadow-lg rounded-lg focus:outline-none scrollbar-none overflow-y-scroll resize-none"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Start typing..."
      />
    </main>
  );
}

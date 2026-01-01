"use client";

import { useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import { zustandStore } from "../zustand/store";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";

const LINE_HEIGHT = "24px";
const MAX_CHARS_PER_LINE = 80;

export default function Page() {
  const { note, setNote } = zustandStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const [activeLine, setActiveLine] = useState(1);

  useKeyboardShortcuts();

  // Load from localStorage
  useEffect(() => {
    const savedNote = localStorage.getItem("note");
    if (savedNote) setNote(savedNote);
  }, [setNote]);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("note", note);
  }, [note]);

  // Force hard line breaks at character limit
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const lines = value.split("\n");
    const result: string[] = [];

    for (let line of lines) {
      while (line.length > MAX_CHARS_PER_LINE) {
        let breakIndex = line.lastIndexOf(" ", MAX_CHARS_PER_LINE);

        if (breakIndex === -1) {
          breakIndex = MAX_CHARS_PER_LINE;
        }

        result.push(line.slice(0, breakIndex));
        line = line.slice(breakIndex).trimStart();
      }

      result.push(line);
    }

    setNote(result.join("\n"));
  };

  // Active line calculation
  const updateActiveLine = () => {
    if (!textareaRef.current) return;

    const cursorPosition = textareaRef.current.selectionStart;
    const textBeforeCursor = note.slice(0, cursorPosition);
    setActiveLine(textBeforeCursor.split("\n").length);
  };

  // Scroll sync
  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const totalLines = note.split("\n").length || 1;

  return (
    <main className="flex min-h-screen flex-col bg-black text-white">
      <Navbar note={note} />

      <div className="flex-1 flex justify-center p-4">
        <div className="w-full max-w-5xl h-[84vh] flex rounded-lg overflow-hidden bg-black">

          {/* Line Numbers */}
          <div
            ref={lineNumbersRef}
            className="w-[60px] overflow-y-scroll scrollbar-none select-none font-mono text-sm"
          >
            <div className="py-4 px-3">
              {Array.from({ length: totalLines }, (_, i) => i + 1).map(
                (lineNum) => (
                  <div
                    key={lineNum}
                    className={`flex items-center justify-end pr-1 ${
                      lineNum === activeLine
                        ? "text-white"
                        : "text-gray-500"
                    }`}
                    style={{ height: LINE_HEIGHT }}
                  >
                    {lineNum}
                  </div>
                )
              )}
            </div>
          </div>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={note}
            onChange={handleChange}
            onKeyUp={updateActiveLine}
            onClick={updateActiveLine}
            onScroll={handleScroll}
            placeholder="Start typing..."
            className="
              flex-1
              font-mono text-sm
              bg-black text-white
              resize-none
              focus:outline-none
              overflow-y-scroll
              scrollbar-none
              whitespace-pre-wrap
              py-4 px-4
            "
            style={{
              lineHeight: LINE_HEIGHT,
            }}
          />
        </div>
      </div>
    </main>
  );
}

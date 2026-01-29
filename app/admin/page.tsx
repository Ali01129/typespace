"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, X } from "lucide-react";
import { zustandStore } from "@/zustand/store";
import { loadUserFromStorage } from "@/components/UserHydration";
import Navbar from "@/components/Navbar";

const LINE_HEIGHT = "24px";
const MAX_CHARS_PER_LINE = 80;

type NoteItem = {
  id: string;
  content: string;
  code: string;
  active: boolean;
  createdAt: string;
  expiresAt: string;
};

export default function AdminPage() {
  const router = useRouter();
  const user = zustandStore((s) => s.user);
  const setUser = zustandStore((s) => s.setUser);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [selectedNote, setSelectedNote] = useState<NoteItem | null>(null);
  const [editorContent, setEditorContent] = useState("");
  const [activeLine, setActiveLine] = useState(1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let u = user;
    if (!u) {
      u = loadUserFromStorage();
      if (u) setUser(u);
    }
    if (!u || u.role !== "admin") {
      router.replace("/");
      return;
    }
    setAuthChecked(true);
  }, [user, setUser, router]);

  useEffect(() => {
    if (!authChecked) return;

    let cancelled = false;
    fetch("/api/admin/notes")
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.notes) setNotes(data.notes);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [authChecked]);

  const handleNoteClick = (note: NoteItem) => {
    setSelectedNote(note);
    setEditorContent(note.content || "");
    setActiveLine(1);
  };

  const handleCloseTab = () => {
    setSelectedNote(null);
    setEditorContent("");
  };

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

    const newContent = result.join("\n");
    setEditorContent(newContent);
    
    // Update the note in the notes array
    if (selectedNote) {
      setNotes((prev) =>
        prev.map((n) =>
          n.id === selectedNote.id ? { ...n, content: newContent } : n
        )
      );
    }
  };

  const updateActiveLine = () => {
    if (!textareaRef.current) return;

    const cursorPosition = textareaRef.current.selectionStart;
    const textBeforeCursor = editorContent.slice(0, cursorPosition);
    setActiveLine(textBeforeCursor.split("\n").length);
  };

  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  if (!authChecked) {
    return (
      <main className="flex min-h-screen flex-col bg-black text-white">
        <Navbar note="" admin />
        <div className="flex-1 flex justify-center p-4">
          <div className="w-full max-w-5xl h-[84vh] flex rounded-lg overflow-hidden bg-black items-center justify-center">
            <span className="text-gray-400 font-mono text-sm">
              Checking access...
            </span>
          </div>
        </div>
      </main>
    );
  }

  const totalLines = editorContent.split("\n").length || 1;

  return (
    <main className="flex h-screen flex-col bg-[#0d1117] text-white overflow-hidden">
      <Navbar note="" admin />

      <div className="flex-1 flex overflow-hidden p-2 gap-2 min-h-0">
        {/* Left Sidebar - Modern VS Code style */}
        <div className="w-72 bg-[#1e1e1e] border border-[#2d2d30] rounded-lg flex flex-col shadow-lg overflow-hidden h-full">
          {/* Title */}
          <div className="px-5 py-4 border-b border-[#2d2d30] bg-[#252526] rounded-t-lg flex-shrink-0">
            <h2 className="text-white font-semibold text-sm tracking-wide">
              TYPESPACE
            </h2>
            <p className="text-[#858585] text-xs mt-1 font-normal">
              {notes.length} {notes.length === 1 ? "note" : "notes"}
            </p>
          </div>

          {/* File List */}
          <div className="flex-1 overflow-y-auto scrollbar-none min-h-0">
            {loading ? (
              <div className="px-5 py-8 flex flex-col items-center justify-center">
                <div className="w-6 h-6 border-2 border-[#e2b714] border-t-transparent rounded-full animate-spin mb-3"></div>
                <p className="text-[#858585] text-xs">Loading notes...</p>
              </div>
            ) : notes.length === 0 ? (
              <div className="px-5 py-8 flex flex-col items-center justify-center text-center">
                <FileText size={32} className="text-[#3e3e42] mb-3" />
                <p className="text-[#858585] text-sm font-medium">No notes yet</p>
                <p className="text-[#5a5a5a] text-xs mt-1">
                  Notes will appear here
                </p>
              </div>
            ) : (
              <div className="py-2 px-2">
                {notes.map((note) => (
                  <button
                    key={note.id}
                    onClick={() => handleNoteClick(note)}
                    className={`w-full px-4 py-2.5 text-left flex items-center gap-3 group transition-all duration-150 rounded-md ${
                      selectedNote?.id === note.id
                        ? "bg-[#2a2d2e] border-l-2 border-[#e2b714] shadow-sm"
                        : "hover:bg-[#252526] border-l-2 border-transparent"
                    }`}
                  >
                    <FileText
                      size={18}
                      className={`transition-colors duration-150 ${
                        selectedNote?.id === note.id
                          ? "text-[#e2b714]"
                          : "text-[#858585] group-hover:text-[#a0a0a0]"
                      }`}
                    />
                    <span
                      className={`text-sm font-mono truncate flex-1 transition-colors duration-150 ${
                        selectedNote?.id === note.id
                          ? "text-white font-medium"
                          : "text-[#cccccc] group-hover:text-white"
                      }`}
                    >
                      {note.code}
                    </span>
                    {selectedNote?.id === note.id && (
                      <div className="w-1.5 h-1.5 rounded-full bg-[#e2b714]"></div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Editor Area */}
        <div className="flex-1 flex flex-col bg-[#0d1117] border border-[#2d2d30] rounded-lg overflow-hidden h-full min-h-0">
          {selectedNote ? (
            <>
              {/* Tab Bar */}
              <div className="bg-[#1e1e1e] border-b border-[#2d2d30] flex items-center min-h-[35px] rounded-t-lg flex-shrink-0">
                <div className="flex items-center gap-2.5 px-4 py-2 bg-[#0d1117] border-r border-[#2d2d30] group rounded-tl-lg">
                  <FileText size={14} className="text-[#858585] group-hover:text-[#e2b714] transition-colors" />
                  <span className="text-sm text-[#cccccc] font-mono">
                    {selectedNote.code}
                  </span>
                  <button
                    onClick={handleCloseTab}
                    className="ml-1.5 hover:bg-[#2d2d30] rounded-md p-1 transition-all duration-150"
                    title="Close"
                  >
                    <X size={12} className="text-[#858585] hover:text-white transition-colors" />
                  </button>
                </div>
              </div>

              {/* Editor */}
              <div className="flex-1 flex overflow-hidden rounded-b-lg min-h-0">
                {/* Line Numbers */}
                <div
                  ref={lineNumbersRef}
                  className="w-[60px] overflow-y-scroll scrollbar-none select-none font-mono text-sm bg-[#0d1117] border-r border-[#2d2d30] rounded-bl-lg"
                >
                  <div className="py-4 px-3">
                    {Array.from({ length: totalLines }, (_, i) => i + 1).map(
                      (lineNum) => (
                        <div
                          key={lineNum}
                          className={`flex items-center justify-end pr-2 transition-colors ${
                            lineNum === activeLine
                              ? "text-[#e2b714] font-medium"
                              : "text-[#6e7681]"
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
                  value={editorContent}
                  onChange={handleChange}
                  onKeyUp={updateActiveLine}
                  onClick={updateActiveLine}
                  onScroll={handleScroll}
                  placeholder="Start typing..."
                  className="
                    flex-1
                    font-mono text-sm
                    bg-[#0d1117] text-[#c9d1d9]
                    resize-none
                    focus:outline-none
                    overflow-y-scroll
                    scrollbar-none
                    whitespace-pre-wrap
                    py-4 px-6
                    caret-[#e2b714]
                    selection:bg-[#264f78]
                  "
                  style={{
                    lineHeight: LINE_HEIGHT,
                  }}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
              <div className="mb-4 p-6 rounded-xl bg-[#1e1e1e] border border-[#2d2d30] shadow-sm">
                <FileText size={48} className="text-[#3e3e42] mx-auto" />
              </div>
              <p className="text-[#858585] font-mono text-sm font-medium mb-1">
                No file selected
              </p>
              <p className="text-[#5a5a5a] text-xs max-w-sm">
                Select a note from the sidebar to view and edit its contents
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

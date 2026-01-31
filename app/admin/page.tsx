"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FilePlus, FileText, Save, Trash2, User, X } from "lucide-react";
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
  createdBy?: string;
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
  const creatorBoxRef = useRef<HTMLDivElement>(null);
  const [showCreatorBox, setShowCreatorBox] = useState(false);
  const [creatorUser, setCreatorUser] = useState<{
    id: string;
    email: string;
    role: string;
  } | null>(null);
  const [creatorLoading, setCreatorLoading] = useState(false);

  useEffect(() => {
    let u = user;
    if (!u) {
      u = loadUserFromStorage();
      if (u) setUser(u);
    }
    if (!u) {
      router.replace("/");
      return;
    }
    setAuthChecked(true);
  }, [user, setUser, router]);

  useEffect(() => {
    if (!authChecked || !user) return;

    let cancelled = false;
    const url =
      user.role === "admin"
        ? "/api/admin/notes"
        : `/api/admin/notes?userId=${user.id}`;
    fetch(url)
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
  }, [authChecked, user]);

  // Close creator box when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        creatorBoxRef.current &&
        !creatorBoxRef.current.contains(event.target as Node)
      ) {
        setShowCreatorBox(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch creator user when opening the box
  useEffect(() => {
    if (!showCreatorBox || !selectedNote?.createdBy) {
      setCreatorUser(null);
      return;
    }
    let cancelled = false;
    setCreatorLoading(true);
    setCreatorUser(null);
    fetch(`/api/admin/users/${selectedNote.createdBy}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.id) setCreatorUser({ id: data.id, email: data.email, role: data.role });
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setCreatorLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [showCreatorBox, selectedNote?.createdBy]);

  const handleNoteClick = (note: NoteItem) => {
    setSelectedNote(note);
    setEditorContent(note.content || "");
    setActiveLine(1);
    setShowCreatorBox(false);
  };

  const handleCloseTab = () => {
    setSelectedNote(null);
    setEditorContent("");
    setShowCreatorBox(false);
  };

  const handleCreateNote = async () => {
    try {
      const res = await fetch("/api/admin/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user ? { userId: user.id } : {}),
      });
      const data = await res.json();
      if (!res.ok || !data.note) throw new Error(data.error || "Failed to create");
      const newNote: NoteItem = {
        id: data.note.id,
        content: data.note.content ?? "",
        code: data.note.code,
        active: data.note.active ?? true,
        createdAt: data.note.createdAt,
        expiresAt: data.note.expiresAt,
        ...(data.note.createdBy && { createdBy: data.note.createdBy }),
      };
      setNotes((prev) => [newNote, ...prev]);
      setSelectedNote(newNote);
      setEditorContent("");
      setActiveLine(1);
    } catch {
      alert("Failed to create note.");
    }
  };

  const isDirty =
    selectedNote !== null &&
    editorContent !== (selectedNote.content ?? "");

  const handleSave = async () => {
    if (!selectedNote || !isDirty) return;
    try {
      const res = await fetch(`/api/admin/notes/${selectedNote.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editorContent }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setSelectedNote((prev) =>
        prev ? { ...prev, content: editorContent } : null
      );
      setNotes((prev) =>
        prev.map((n) =>
          n.id === selectedNote.id ? { ...n, content: editorContent } : n
        )
      );
    } catch {
      alert("Failed to save note.");
    }
  };

  const handleDeleteNote = async (e: React.MouseEvent, note: NoteItem) => {
    e.stopPropagation();
    if (!confirm(`Delete note "${note.code}"?`)) return;
    try {
      const res = await fetch(`/api/admin/notes/${note.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setNotes((prev) => prev.filter((n) => n.id !== note.id));
      if (selectedNote?.id === note.id) handleCloseTab();
    } catch {
      alert("Failed to delete note.");
    }
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
          <div className="px-4 py-2.5 border-b border-[#2d2d30] bg-[#252526] rounded-t-lg flex-shrink-0 flex items-center justify-between">
            <p className="text-[#858585] text-xs font-normal">
              {notes.length} {notes.length === 1 ? "note" : "notes"}
            </p>
            <button
              onClick={handleCreateNote}
              className="p-1.5 rounded-md text-[#858585] hover:text-[#c9a00d] hover:bg-[#2d2d30] transition-colors cursor-pointer"
              title="Create note"
            >
              <FilePlus size={15} />
            </button>
          </div>

          {/* File List */}
          <div className="flex-1 overflow-y-auto scrollbar-none min-h-0">
            {loading ? (
              <div className="px-5 py-8 flex flex-col items-center justify-center">
                <div className="w-6 h-6 border-2 border-[#c9a00d] border-t-transparent rounded-full animate-spin mb-3"></div>
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
                  <div
                    key={note.id}
                    className={`flex items-center gap-1 rounded-md group/row ${
                      selectedNote?.id === note.id
                        ? "bg-[#2a2d2e] border-l-2 border-[#c9a00d] shadow-sm"
                        : "hover:bg-[#252526] border-l-2 border-transparent"
                    }`}
                  >
                    <button
                      onClick={() => handleNoteClick(note)}
                      className={`flex-1 min-w-0 px-4 py-2.5 text-left flex items-center gap-3 transition-all duration-150 rounded-md ${
                        selectedNote?.id === note.id
                          ? ""
                          : "hover:bg-[#252526]"
                      }`}
                    >
                      <FileText
                        size={18}
                        className={`flex-shrink-0 transition-colors duration-150 ${
                          selectedNote?.id === note.id
                            ? "text-[#c9a00d]"
                            : "text-[#858585] group-hover/row:text-[#a0a0a0]"
                        }`}
                      />
                      <span
                        className={`text-sm font-mono truncate flex-1 transition-colors duration-150 ${
                          selectedNote?.id === note.id
                            ? "text-white font-medium"
                            : "text-[#cccccc] group-hover/row:text-white"
                        }`}
                      >
                        {note.code}
                      </span>
                    </button>
                    <button
                      onClick={(e) => handleDeleteNote(e, note)}
                      className="flex-shrink-0 p-2 rounded-md text-[#6e7681] hover:text-red-400 hover:bg-[#2d2d30] transition-colors mr-2 cursor-pointer"
                      title="Delete note"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
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
              <div className="bg-[#1e1e1e] border-b border-[#2d2d30] flex items-center justify-between min-h-[35px] rounded-t-lg flex-shrink-0">
                <div className="flex items-center gap-2.5 px-4 py-2 min-w-[280px] max-w-[280px] bg-[#0d1117] border-r border-[#2d2d30] group rounded-tl-lg">
                  <FileText size={14} className="text-[#858585] group-hover:text-[#c9a00d] transition-colors flex-shrink-0" />
                  <span className="text-sm text-[#cccccc] font-mono truncate flex-1 min-w-0">
                    {selectedNote.code}
                  </span>
                  {isDirty && (
                    <span className="text-[#c9a00d] text-2xl font-mono flex-shrink-0" title="Unsaved changes">
                      •
                    </span>
                  )}
                  <button
                    onClick={handleCloseTab}
                    className="flex-shrink-0 hover:bg-[#2d2d30] rounded-md p-1 transition-all duration-150 cursor-pointer"
                    title="Close"
                  >
                    <X size={12} className="text-[#858585] hover:text-white transition-colors" />
                  </button>
                </div>
                <div className="flex items-center gap-2 mr-2">
                  {selectedNote.createdBy && (
                    <div className="relative" ref={creatorBoxRef}>
                      <button
                        type="button"
                        onClick={() => setShowCreatorBox((prev) => !prev)}
                        className="flex items-center p-2 text-[#858585] hover:text-[#c9a00d] hover:bg-[#2d2d30] rounded-md transition-colors cursor-pointer"
                        title="Created by user"
                      >
                        <User size={20} />
                      </button>
                      {showCreatorBox && (
                        <div className="absolute right-0 top-full mt-1 w-60 px-3 py-3 bg-[#1e1e1e] border border-[#2d2d30] rounded-md shadow-lg z-50">
                          <p className="text-[#858585] text-xs font-mono mb-1">
                            Created by
                          </p>
                          {creatorLoading ? (
                            <p className="text-[#cccccc] text-sm">Loading...</p>
                          ) : creatorUser ? (
                            <div className="space-y-1">
                              <p className="text-white text-sm font-mono truncate">
                                {creatorUser.email}
                              </p>
                              <p className="text-[#858585] text-xs font-mono">
                                Role: {creatorUser.role}
                              </p>
                            </div>
                          ) : (
                            <p className="text-[#6e7681] text-sm">User not found</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  <button
                    onClick={handleSave}
                    disabled={!isDirty}
                    className={`p-2 rounded-md transition-colors duration-150 cursor-pointer ${
                      isDirty
                        ? "text-[#c9a00d] hover:bg-[#2d2d30]"
                        : "text-[#6e7681] cursor-not-allowed"
                    }`}
                    title="Save"
                  >
                    <Save size={20} />
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
                              ? "text-[#c9a00d] font-medium"
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
                    caret-[#c9a00d]
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

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { zustandStore } from "@/zustand/store";
import { loadUserFromStorage } from "@/components/UserHydration";
import Navbar from "@/components/Navbar";

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
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/notes/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to delete");
      }
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch {
      // Could show a toast; for now we just stop loading
    } finally {
      setDeletingId(null);
    }
  };

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

  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleString();
    } catch {
      return d;
    }
  };

  return (
    <main className="flex min-h-screen flex-col bg-black text-white">
      <Navbar note="" admin />

      <div className="flex-1 flex justify-center p-4">
        <div className="w-full max-w-5xl h-[84vh] flex rounded-lg overflow-hidden bg-black">
          <div className="flex-1 overflow-y-auto scrollbar-none font-mono text-sm py-4 px-4">
            {loading ? (
              <p className="text-gray-400">Loading...</p>
            ) : notes.length === 0 ? (
              <p className="text-gray-400">No notes yet.</p>
            ) : (
              <ul className="space-y-4">
                {notes.map((n) => (
                  <li
                    key={n.id}
                    className="border border-white rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex flex-wrap items-center gap-2 min-w-0">
                        <span className="text-amber-500 font-mono">
                          {n.code}
                        </span>
                        <span
                          className={`font-mono text-xs px-2 py-0.5 rounded ${
                            n.active
                              ? "bg-green-900/30 text-green-400 border border-green-600"
                              : "bg-red-900/20 text-red-400 border border-red-500"
                          }`}
                        >
                          {n.active ? "active" : "inactive"}
                        </span>
                        <span className="text-gray-500 text-xs">
                          {formatDate(n.createdAt)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDelete(n.id)}
                        disabled={deletingId === n.id}
                        className="shrink-0 p-2 rounded-md transition-colors hover:bg-[#262626] text-gray-400 hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete note"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <p className="text-gray-300 whitespace-pre-wrap break-words">
                      {n.content || "(empty)"}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

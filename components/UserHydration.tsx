"use client";

import { useEffect } from "react";
import { zustandStore, type User } from "@/zustand/store";

const STORAGE_KEY = "typespace_user";

export function saveUserToStorage(user: User) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function loadUserFromStorage(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const u = JSON.parse(raw) as unknown;
    if (
      u &&
      typeof u === "object" &&
      "id" in u &&
      "email" in u &&
      "role" in u &&
      (u.role === "user" || u.role === "admin")
    ) {
      return { id: String(u.id), email: String(u.email), role: u.role };
    }
    return null;
  } catch {
    return null;
  }
}

export function clearUserFromStorage() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export default function UserHydration() {
  const setUser = zustandStore((s) => s.setUser);

  useEffect(() => {
    const stored = loadUserFromStorage();
    if (stored) setUser(stored);
  }, [setUser]);

  return null;
}

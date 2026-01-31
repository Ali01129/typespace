import { create } from 'zustand';

export type User = {
  id: string;
  email: string;
  role: 'user' | 'admin';
};

export type Theme = "light" | "dark";

type store = {
  note: string
  setNote: (note: string) => void;

  token: number
  setToken: (token:number) => void;
  addToken: () => void;
  subToken: () => void;

  user: User | null;
  setUser: (user: User | null) => void;

  theme: Theme;
  setTheme: (theme: Theme) => void;
};

export const zustandStore = create<store>((set) => ({
  note: "",
  setNote: (note: string) => set({ note }),

  token: 0,
  setToken: (token: number) => set({token}),
  addToken: () => set((state) => ({ token: state.token + 1 })),
  subToken: () => set((state) => ({ token: state.token - 1 })),

  user: null,
  setUser: (user: User | null) => set({ user }),

  theme: "dark",
  setTheme: (theme: Theme) => set({ theme }),
}));

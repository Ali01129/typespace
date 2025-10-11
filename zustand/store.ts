import { create } from 'zustand';

type store = {
  note: string
  setNote: (note: string) => void;

  token: number
  setToken: (token:number) => void;
  addToken: () => void;
  subToken: () => void;
};

export const zustandStore = create<store>((set) => ({
  note: "",
  setNote: (note: string) => set({ note }),

  token: 0,
  setToken: (token: number) => set({token}),
  addToken: () => set((state) => ({ token: state.token + 1 })),
  subToken: () => set((state) => ({ token: state.token - 1 })),
}));

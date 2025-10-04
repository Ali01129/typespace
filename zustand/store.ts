import { create } from 'zustand';

type store = {
  note: string
  setNote: (note: string) => void;
};

export const zustandStore = create<store>((set) => ({
  note: "",
  setNote: (note: string) => set({ note }),
}));

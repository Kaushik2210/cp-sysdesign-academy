"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ProgressState {
  /** lesson ids marked complete -> ISO date completed */
  completed: Record<string, string>;
  lastVisited?: string;
  bookmarks: string[];
  notes: Record<string, string>;
  visit: (id: string) => void;
  toggleComplete: (id: string) => void;
  toggleBookmark: (id: string) => void;
  setNote: (id: string, note: string) => void;
  exportJson: () => string;
  importJson: (json: string) => void;
}

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      completed: {},
      bookmarks: [],
      notes: {},
      visit: (id) => set({ lastVisited: id }),
      toggleComplete: (id) =>
        set((s) => {
          const completed = { ...s.completed };
          if (completed[id]) delete completed[id];
          else completed[id] = new Date().toISOString();
          return { completed };
        }),
      toggleBookmark: (id) =>
        set((s) => ({
          bookmarks: s.bookmarks.includes(id)
            ? s.bookmarks.filter((b) => b !== id)
            : [...s.bookmarks, id],
        })),
      setNote: (id, note) => set((s) => ({ notes: { ...s.notes, [id]: note } })),
      exportJson: () => {
        const { completed, lastVisited, bookmarks, notes } = get();
        return JSON.stringify({ version: 1, completed, lastVisited, bookmarks, notes }, null, 2);
      },
      importJson: (json) => {
        const data = JSON.parse(json) as Partial<ProgressState>;
        set({
          completed: data.completed ?? {},
          lastVisited: data.lastVisited,
          bookmarks: data.bookmarks ?? [],
          notes: data.notes ?? {},
        });
      },
    }),
    { name: "academy-progress-v1" },
  ),
);

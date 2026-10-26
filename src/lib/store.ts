"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { newCard, review, toDay, type Card, type Grade } from "./srs/sm2";

export type Verdict = "AC" | "WA" | "TLE" | "RE";

export interface ProblemResult {
  attempts: number;
  solved: boolean;
  last: Verdict;
  tags: string[];
}

export interface QuizResult {
  correct: number;
  total: number;
  tags: string[];
}

interface ProgressState {
  /** lesson ids marked complete -> ISO date completed */
  completed: Record<string, string>;
  lastVisited?: string;
  bookmarks: string[];
  notes: Record<string, string>;
  problems: Record<string, ProblemResult>;
  quizzes: Record<string, QuizResult>;
  cards: Record<string, Card>;
  /** yyyy-mm-dd -> number of activity events (streak calendar) */
  activity: Record<string, number>;
  /** roadmap step key -> ISO date ticked (see stepKey in lib/content/roadmap) */
  roadmap: Record<string, string>;
  visit: (id: string) => void;
  toggleComplete: (id: string, title?: string) => void;
  toggleBookmark: (id: string) => void;
  toggleRoadmap: (key: string) => void;
  setNote: (id: string, note: string) => void;
  recordProblem: (id: string, verdict: Verdict, tags: string[]) => void;
  recordQuiz: (id: string, result: QuizResult) => void;
  addCard: (card: Parameters<typeof newCard>[0]) => void;
  gradeCard: (id: string, grade: Grade) => void;
  exportJson: () => string;
  importJson: (json: string) => void;
}

const bump = (activity: Record<string, number>) => {
  const day = toDay(new Date());
  return { ...activity, [day]: (activity[day] ?? 0) + 1 };
};

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      completed: {},
      bookmarks: [],
      notes: {},
      problems: {},
      quizzes: {},
      cards: {},
      activity: {},
      roadmap: {},
      visit: (id) => set({ lastVisited: id }),
      toggleComplete: (id, title) =>
        set((s) => {
          const completed = { ...s.completed };
          if (completed[id]) {
            delete completed[id];
            return { completed };
          }
          completed[id] = new Date().toISOString();
          const cardId = `lesson:${id}`;
          const cards = s.cards[cardId]
            ? s.cards
            : {
                ...s.cards,
                [cardId]: newCard({
                  id: cardId,
                  prompt: `Explain the key idea of "${title ?? id}" in your own words.`,
                  answer: "Re-open the lesson and compare your summary with its intuition section.",
                  href: `/${id}/`,
                }),
              };
          return { completed, cards, activity: bump(s.activity) };
        }),
      toggleBookmark: (id) =>
        set((s) => ({
          bookmarks: s.bookmarks.includes(id)
            ? s.bookmarks.filter((b) => b !== id)
            : [...s.bookmarks, id],
        })),
      toggleRoadmap: (key) =>
        set((s) => {
          const roadmap = { ...s.roadmap };
          if (roadmap[key]) delete roadmap[key];
          else roadmap[key] = new Date().toISOString();
          return { roadmap, activity: roadmap[key] ? bump(s.activity) : s.activity };
        }),
      setNote: (id, note) => set((s) => ({ notes: { ...s.notes, [id]: note } })),
      recordProblem: (id, verdict, tags) =>
        set((s) => {
          const prev = s.problems[id];
          return {
            problems: {
              ...s.problems,
              [id]: {
                attempts: (prev?.attempts ?? 0) + 1,
                solved: prev?.solved || verdict === "AC",
                last: verdict,
                tags,
              },
            },
            activity: bump(s.activity),
          };
        }),
      recordQuiz: (id, result) =>
        set((s) => ({ quizzes: { ...s.quizzes, [id]: result }, activity: bump(s.activity) })),
      addCard: (card) =>
        set((s) => (s.cards[card.id] ? s : { cards: { ...s.cards, [card.id]: newCard(card) } })),
      gradeCard: (id, grade) =>
        set((s) =>
          s.cards[id]
            ? { cards: { ...s.cards, [id]: review(s.cards[id], grade) }, activity: bump(s.activity) }
            : s,
        ),
      exportJson: () => {
        const { completed, lastVisited, bookmarks, notes, problems, quizzes, cards, activity, roadmap } =
          get();
        return JSON.stringify(
          { version: 2, completed, lastVisited, bookmarks, notes, problems, quizzes, cards, activity, roadmap },
          null,
          2,
        );
      },
      importJson: (json) => {
        const d = JSON.parse(json) as Partial<ProgressState>;
        set({
          completed: d.completed ?? {},
          lastVisited: d.lastVisited,
          bookmarks: d.bookmarks ?? [],
          notes: d.notes ?? {},
          problems: d.problems ?? {},
          quizzes: d.quizzes ?? {},
          cards: d.cards ?? {},
          activity: d.activity ?? {},
          roadmap: d.roadmap ?? {},
        });
      },
    }),
    { name: "academy-progress-v1", version: 2 },
  ),
);

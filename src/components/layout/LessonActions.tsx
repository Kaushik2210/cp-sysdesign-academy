"use client";

import { useEffect } from "react";
import { Bookmark, CheckCircle2 } from "lucide-react";
import { useProgress } from "@/lib/store";
import { fireConfetti } from "@/components/fx/confetti";
import { cn } from "@/lib/utils";

export function LessonActions({ id, title }: { id: string; title: string }) {
  const { visit, toggleComplete, toggleBookmark, completed, bookmarks } = useProgress();
  useEffect(() => visit(id), [id, visit]);
  const done = !!completed[id];
  const marked = bookmarks.includes(id);
  return (
    <div className="no-print flex gap-2">
      <button
        type="button"
        aria-pressed={done}
        onClick={(e) => {
          if (!done) {
            const r = e.currentTarget.getBoundingClientRect();
            fireConfetti({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
          }
          toggleComplete(id, title);
        }}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted",
          done && "border-accent text-accent",
        )}
      >
        <CheckCircle2 size={16} aria-hidden /> {done ? "Completed" : "Mark complete"}
      </button>
      <button
        type="button"
        aria-pressed={marked}
        aria-label={marked ? "Remove bookmark" : "Bookmark lesson"}
        onClick={() => toggleBookmark(id)}
        className={cn("rounded-md border border-border p-2 hover:bg-muted", marked && "border-accent text-accent")}
      >
        <Bookmark size={16} aria-hidden />
      </button>
    </div>
  );
}

export function LessonNotes({ id }: { id: string }) {
  const note = useProgress((s) => s.notes[id] ?? "");
  const setNote = useProgress((s) => s.setNote);
  return (
    <section className="no-print mt-10">
      <label htmlFor="lesson-notes" className="mb-1 block text-sm font-semibold">
        My notes (saved in this browser)
      </label>
      <textarea
        id="lesson-notes"
        value={note}
        onChange={(e) => setNote(id, e.target.value)}
        rows={4}
        className="w-full rounded-md border border-border bg-bg p-2 text-sm"
      />
    </section>
  );
}

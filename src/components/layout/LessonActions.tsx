"use client";

import { useEffect } from "react";
import { Bookmark, CheckCircle2 } from "lucide-react";
import { useProgress } from "@/lib/store";
import { cn } from "@/lib/utils";

export function LessonActions({ id }: { id: string }) {
  const { visit, toggleComplete, toggleBookmark, completed, bookmarks } = useProgress();
  useEffect(() => visit(id), [id, visit]);
  const done = !!completed[id];
  const marked = bookmarks.includes(id);
  return (
    <div className="no-print flex gap-2">
      <button
        type="button"
        aria-pressed={done}
        onClick={() => toggleComplete(id)}
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
        className={cn(
          "rounded-md border border-border p-2 hover:bg-muted",
          marked && "border-accent text-accent",
        )}
      >
        <Bookmark size={16} aria-hidden />
      </button>
    </div>
  );
}

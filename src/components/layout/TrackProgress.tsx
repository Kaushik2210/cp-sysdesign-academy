"use client";

import { useEffect, useState } from "react";
import { useProgress } from "@/lib/store";

/** A small progress ring plus "done / total" for one track, read from the local progress store. */
export function TrackProgress({ lessonIds, label }: { lessonIds: string[]; label: string }) {
  const completed = useProgress((s) => s.completed);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const done = mounted ? lessonIds.filter((id) => completed[id]).length : 0;
  const total = lessonIds.length;
  const frac = total ? done / total : 0;
  const r = 20;
  const c = 2 * Math.PI * r;
  return (
    <div className="flex items-center gap-3" role="group" aria-label={`${label} progress`}>
      <svg width="52" height="52" viewBox="0 0 52 52" aria-hidden="true" className="shrink-0 -rotate-90">
        <circle cx="26" cy="26" r={r} fill="none" stroke="hsl(var(--border))" strokeWidth="5" />
        <circle
          cx="26"
          cy="26"
          r={r}
          fill="none"
          stroke="hsl(var(--tint, var(--accent)))"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - frac)}
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      <div className="text-sm">
        <div className="font-semibold">
          {done} / {total} lessons
        </div>
        <div className="text-xs text-muted-fg">{done === 0 ? "Not started" : done === total ? "Track complete" : `${Math.round(frac * 100)}% done`}</div>
      </div>
    </div>
  );
}

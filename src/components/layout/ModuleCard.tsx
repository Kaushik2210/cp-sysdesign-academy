"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { Spotlight, type Tint } from "@/components/fx/Spotlight";
import { useProgress } from "@/lib/store";
import { cn } from "@/lib/utils";

export interface ModuleCardData {
  order: number;
  title: string;
  summary: string;
  lessons: { id: string; title: string; href: string; estMinutes: number }[];
}

/** A module on a track page: gradient number badge, progress bar from saved progress, and its lessons with check marks. */
export function ModuleCard({ module: m, tint }: { module: ModuleCardData; tint: Tint }) {
  const completed = useProgress((s) => s.completed);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const done = mounted ? m.lessons.filter((l) => completed[l.id]).length : 0;
  const pct = m.lessons.length ? Math.round((done / m.lessons.length) * 100) : 0;
  const minutes = m.lessons.reduce((n, l) => n + l.estMinutes, 0);

  return (
    <Spotlight tint={tint} tilt={2} className="h-full p-5">
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-sm font-black text-white shadow-md"
          style={{ background: `linear-gradient(135deg, hsl(var(--${tint})), hsl(var(--accent)))` }}
        >
          {m.order}
        </span>
        <div className="min-w-0">
          <h3 className="font-bold leading-snug">{m.title}</h3>
          <p className="mt-0.5 text-xs text-muted-fg">
            {m.lessons.length} lessons · about {minutes} min
          </p>
        </div>
      </div>
      <p className="mt-3 text-sm text-muted-fg">{m.summary}</p>
      <div
        role="progressbar"
        aria-label={`${m.title} progress`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted"
      >
        <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${pct}%`, background: `hsl(var(--${tint}))` }} />
      </div>
      <ul className="mt-3 space-y-0.5 text-sm">
        {m.lessons.map((l) => {
          const isDone = mounted && !!completed[l.id];
          return (
            <li key={l.id} className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className={cn("inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-border", isDone && "border-transparent text-white")}
                style={isDone ? { background: `hsl(var(--${tint}))` } : undefined}
              >
                {isDone && <Check size={10} />}
              </span>
              <span className="min-w-0">
                <Link href={l.href} className="inline-flex min-h-8 items-center font-medium hover:underline" style={{ color: `hsl(var(--${tint}))` }}>
                  {l.title}
                </Link>{" "}
                <span className="text-xs text-muted-fg">· {l.estMinutes} min</span>
                {isDone && <span className="sr-only"> (completed)</span>}
              </span>
            </li>
          );
        })}
      </ul>
    </Spotlight>
  );
}

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

/** A module on a track page: tracked label, hairline progress from saved progress, and its lessons with check marks. */
export function ModuleCard({ module: m, tint }: { module: ModuleCardData; tint: Tint }) {
  const completed = useProgress((s) => s.completed);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const done = mounted ? m.lessons.filter((l) => completed[l.id]).length : 0;
  const pct = m.lessons.length ? Math.round((done / m.lessons.length) * 100) : 0;
  const minutes = m.lessons.reduce((n, l) => n + l.estMinutes, 0);

  return (
    <Spotlight tint={tint} className="h-full p-6">
      <div className="flex items-baseline justify-between gap-3">
        <span className="label">Module {String(m.order).padStart(2, "0")}</span>
        <span className="label">
          {m.lessons.length} lessons · {minutes} min
        </span>
      </div>
      <h3 className="mt-4 text-2xl font-medium leading-tight tracking-tight">{m.title}</h3>
      <p className="mt-2 text-sm text-muted-fg">{m.summary}</p>
      <div
        role="progressbar"
        aria-label={`${m.title} progress`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        className="mt-5 h-px bg-border"
      >
        <div className="h-[3px] -translate-y-px bg-accent transition-[width] duration-700" style={{ width: `${pct}%` }} />
      </div>
      <ul className="mt-4 space-y-0.5 text-sm">
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
                <Link href={l.href} className="inline-flex min-h-8 items-center font-medium underline-offset-4 hover:text-accent hover:underline">
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

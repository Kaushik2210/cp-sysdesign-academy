"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useProgress } from "@/lib/store";

interface Day {
  day: number;
  lessons: { id: string; title: string; href: string; estMinutes: number }[];
}

export function PathChecklist({ days }: { days: Day[] }) {
  const completed = useProgress((s) => s.completed);
  const toggle = useProgress((s) => s.toggleComplete);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const all = days.flatMap((d) => d.lessons);
  const done = mounted ? all.filter((l) => completed[l.id]).length : 0;
  const firstOpen = mounted ? days.find((d) => d.lessons.some((l) => !completed[l.id]))?.day : undefined;

  return (
    <div className="mt-6">
      <div className="rounded-2xl border border-border bg-card/80 p-4 backdrop-blur-sm">
        <p className="text-sm font-medium" role="status">
          {done}/{all.length} lessons complete{firstOpen ? ` · next up: day ${firstOpen}` : ""}
        </p>
        <div aria-hidden="true" className="mt-2 h-2.5 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-gradient-to-r from-accent via-hot to-sun transition-[width] duration-700" style={{ width: `${all.length ? (done / all.length) * 100 : 0}%` }} />
        </div>
      </div>
      <ol className="mt-4 space-y-3">
        {days.map((d) => (
          <li key={d.day} className="rounded-2xl border border-border bg-card/80 p-4 backdrop-blur-sm transition hover:border-accent/60">
            <h2 className="text-base font-extrabold tracking-tight">Day {d.day}</h2>
            <ul className="mt-1 space-y-1">
              {d.lessons.map((l) => (
                <li key={l.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    id={`chk-${l.id}`}
                    className="h-5 w-5 accent-[hsl(var(--hot))]"
                    checked={mounted && !!completed[l.id]}
                    onChange={() => toggle(l.id, l.title)}
                  />
                  <label htmlFor={`chk-${l.id}`} className="sr-only">
                    Mark {l.title} complete
                  </label>
                  <Link href={l.href} className="inline-flex min-h-8 items-center font-medium text-accent hover:underline">
                    {l.title}
                  </Link>
                  <span className="text-xs text-muted-fg">{l.estMinutes} min</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  );
}

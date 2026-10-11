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
      <p className="text-sm" role="status">
        {done}/{all.length} lessons complete{firstOpen ? ` · next up: day ${firstOpen}` : ""}
      </p>
      <ol className="mt-4 space-y-3">
        {days.map((d) => (
          <li key={d.day} className="rounded-lg border border-border p-3">
            <h2 className="text-sm font-semibold">Day {d.day}</h2>
            <ul className="mt-1 space-y-1">
              {d.lessons.map((l) => (
                <li key={l.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    id={`chk-${l.id}`}
                    checked={mounted && !!completed[l.id]}
                    onChange={() => toggle(l.id, l.title)}
                  />
                  <label htmlFor={`chk-${l.id}`} className="sr-only">
                    Mark {l.title} complete
                  </label>
                  <Link href={l.href} className="text-accent hover:underline">
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

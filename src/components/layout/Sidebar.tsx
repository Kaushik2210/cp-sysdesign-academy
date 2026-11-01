"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { useProgress } from "@/lib/store";
import { cn } from "@/lib/utils";

export interface SidebarModule {
  slug: string;
  title: string;
  level: string;
  lessons: { id: string; title: string; href: string }[];
}

export function Sidebar({ modules, currentId }: { modules: SidebarModule[]; currentId?: string }) {
  const completed = useProgress((s) => s.completed);
  const total = modules.reduce((n, m) => n + m.lessons.length, 0);
  const done = modules.reduce((n, m) => n + m.lessons.filter((l) => completed[l.id]).length, 0);
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <aside aria-label="Course outline" className="text-sm">
      <div className="mb-4">
        <div className="mb-1 flex justify-between text-xs text-muted-fg">
          <span>Track progress</span>
          <span>
            {done}/{total}
          </span>
        </div>
        <div
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Track progress"
          className="h-px overflow-visible bg-border"
        >
          <div className="h-[3px] -translate-y-px bg-accent transition-[width] duration-700" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <ul className="space-y-1">
        {modules.map((m) => {
          const open = m.lessons.some((l) => l.id === currentId);
          return (
            <li key={m.slug}>
              <details open={open || undefined} className="group">
                <summary className="cursor-pointer select-none rounded px-2 py-1.5 font-medium hover:text-accent">
                  <span className="label mr-1.5">{m.level.split(":")[0]}</span>
                  {m.title}
                </summary>
                <ul className="ml-2 border-l border-border pl-2">
                  {m.lessons.map((l) => (
                    <li key={l.id}>
                      <Link
                        href={l.href}
                        aria-current={l.id === currentId ? "page" : undefined}
                        className={cn(
                          "flex items-center gap-2 rounded px-2 py-1 hover:bg-muted",
                          l.id === currentId && "bg-muted font-semibold text-fg shadow-[inset_2px_0_0_hsl(var(--accent))]",
                        )}
                      >
                        <span
                          className={cn(
                            "inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-border",
                            completed[l.id] && "border-accent bg-accent text-accent-fg",
                          )}
                        >
                          {completed[l.id] && <Check size={10} aria-label="completed" />}
                        </span>
                        {l.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

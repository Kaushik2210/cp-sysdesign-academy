"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

export interface PatternView {
  id: string;
  signal: string;
  technique: string;
  why: string;
  complexity: string;
  tags: string[];
  constraints?: string;
  /** Resolved lessons; empty means the lesson is planned. */
  lessons: { title: string; href: string }[];
}

/** Searchable, tag-filterable cheat sheet: problem signal -> technique. */
export function PatternExplorer({ patterns }: { patterns: PatternView[] }) {
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState<string | null>(null);

  const tags = useMemo(() => [...new Set(patterns.flatMap((p) => p.tags))].sort(), [patterns]);
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return patterns.filter(
      (p) =>
        (!tag || p.tags.includes(tag)) &&
        (!q || `${p.signal} ${p.technique} ${p.why} ${p.tags.join(" ")}`.toLowerCase().includes(q)),
    );
  }, [patterns, query, tag]);

  const chip =
    "min-h-11 rounded-full border border-border px-3 text-sm hover:bg-muted";

  return (
    <div className="mt-6">
      <label htmlFor="pattern-search" className="block text-sm font-medium">
        Describe what you see in the problem
      </label>
      <input
        id="pattern-search"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="e.g. range sum queries, shortest path, subsets"
        className="mt-1 min-h-11 w-full rounded-lg border border-border bg-bg px-3"
      />

      <div role="group" aria-label="Filter by topic" className="mt-3 flex flex-wrap gap-2">
        <button type="button" aria-pressed={tag === null} onClick={() => setTag(null)} className={cn(chip, tag === null && "border-accent text-accent")}>
          All
        </button>
        {tags.map((t) => (
          <button key={t} type="button" aria-pressed={tag === t} onClick={() => setTag(tag === t ? null : t)} className={cn(chip, tag === t && "border-accent text-accent")}>
            {t}
          </button>
        ))}
      </div>

      <p role="status" className="mt-4 text-sm text-muted-fg">
        {shown.length} of {patterns.length} patterns
      </p>

      <ul className="mt-2 space-y-3">
        {shown.map((p) => (
          <li key={p.id}>
            <article className="rounded-xl border border-border bg-card p-4">
              <p className="text-sm text-muted-fg">When you see</p>
              <p className="font-medium">{p.signal}</p>
              <h2 className="mt-3 text-lg font-semibold">
                <span aria-hidden>→ </span>
                {p.technique}
                <span className="ml-2 rounded bg-muted px-1.5 py-0.5 font-mono text-xs font-normal">{p.complexity}</span>
              </h2>
              <p className="mt-1 text-sm">{p.why}</p>
              {p.constraints && <p className="mt-1 text-sm text-muted-fg">Typical limits: {p.constraints}</p>}
              <p className="mt-3 text-sm">
                {p.lessons.length > 0 ? (
                  <>
                    Learn it:{" "}
                    {p.lessons.map((l, i) => (
                      <span key={l.href}>
                        {i > 0 && ", "}
                        <Link href={l.href} className="text-accent underline">
                          {l.title}
                        </Link>
                      </span>
                    ))}
                  </>
                ) : (
                  <span className="text-muted-fg">Lesson planned</span>
                )}
              </p>
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
}

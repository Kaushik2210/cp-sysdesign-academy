"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Heading {
  id: string;
  text: string;
  depth: 2 | 3;
}

/**
 * "On this page" as a step rail: every section is a station on a vertical track, a playhead marks the one being read,
 * visited stations are filled, and Back / Next (or the [ and ] keys) jump between sections.
 */
export function StepRail({ headings }: { headings: Heading[] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const els = headings.map((h) => document.getElementById(h.id));
    const found = els.filter((e): e is HTMLElement => !!e);
    if (!found.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(els.indexOf(visible[0].target as HTMLElement));
      },
      { rootMargin: "-80px 0px -65% 0px", threshold: 0 },
    );
    found.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [headings]);

  const go = useCallback(
    (to: number) => {
      const h = headings[Math.max(0, Math.min(headings.length - 1, to))];
      if (!h) return;
      document.getElementById(h.id)?.scrollIntoView({ block: "start" });
      setActive(headings.indexOf(h));
    },
    [headings],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable)) return;
      if (e.key === "]") go(active + 1);
      if (e.key === "[") go(active - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, go]);

  if (!headings.length) return null;
  const current = headings[active] ?? headings[0];

  return (
    <div className="no-print hidden text-sm xl:sticky xl:top-28 xl:block xl:self-start">
      <div className="sheet mb-4 p-3">
        <p className="label">
          Step {active + 1} / {headings.length}
        </p>
        <p className="mt-1 line-clamp-2 font-medium leading-snug" aria-live="polite">
          {current.text}
        </p>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => go(active - 1)}
            disabled={active === 0}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-1 border border-border bg-bg px-2 font-mono text-xs uppercase tracking-wider transition hover:border-accent hover:text-accent disabled:opacity-40"
          >
            <ArrowLeft size={14} aria-hidden /> Back
          </button>
          <button
            type="button"
            onClick={() => go(active + 1)}
            disabled={active === headings.length - 1}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-1 bg-accent px-2 font-mono text-xs uppercase tracking-wider text-accent-fg transition hover:opacity-90 disabled:opacity-40"
          >
            Next <ArrowRight size={14} aria-hidden />
          </button>
        </div>
        <p className="mt-2 font-mono text-[0.6875rem] text-muted-fg">
          Keys: <kbd className="border border-border px-1">[</kbd> <kbd className="border border-border px-1">]</kbd>
        </p>
      </div>

      <nav aria-label="On this page">
        <ul className="ml-1.5 border-l border-border">
          {headings.map((h, i) => {
            const on = i === active;
            return (
              <li key={h.id} className={cn("relative", h.depth === 3 ? "pl-7" : "pl-5")}>
                <span aria-hidden className="rail-node" data-visited={i < active} data-active={on} />
                <a
                  href={`#${h.id}`}
                  aria-current={on ? "location" : undefined}
                  className={cn("block py-1 leading-snug transition-colors", on ? "font-semibold text-fg" : "text-muted-fg hover:text-fg", h.depth === 3 && "text-[0.8125rem]")}
                >
                  {h.text}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

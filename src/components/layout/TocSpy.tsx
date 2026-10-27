"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/** "On this page" list that highlights the section currently being read (scroll-spy) and smooth-jumps on click. */
export function TocSpy({ headings }: { headings: { id: string; text: string; depth: 2 | 3 }[] }) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const els = headings.map((h) => document.getElementById(h.id)).filter((e): e is HTMLElement => !!e);
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        // Prefer the topmost heading that is inside the upper band of the viewport.
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-80px 0px -65% 0px", threshold: 0 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [headings]);

  return (
    <nav aria-label="On this page" className="no-print hidden text-sm xl:sticky xl:top-24 xl:block xl:self-start">
      <p className="mb-2 font-semibold">On this page</p>
      <ul className="space-y-0.5 border-l border-border">
        {headings.map((h) => {
          const on = active === h.id;
          return (
            <li key={h.id} className={cn(h.depth === 3 ? "pl-6" : "pl-3", "-ml-px border-l-2 transition-colors", on ? "border-hot" : "border-transparent")}>
              <a
                href={`#${h.id}`}
                aria-current={on ? "location" : undefined}
                className={cn("block py-0.5 transition-colors", on ? "font-semibold text-fg" : "text-muted-fg hover:text-fg")}
              >
                {h.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

"use client";

import { Children, isValidElement, useId, useState } from "react";
import { cn } from "@/lib/utils";

export function Tab({ children }: { label: string; children: React.ReactNode }) {
  return <>{children}</>;
}

/** Accessible tabs (arrow keys) for multi-language solutions: <Tabs><Tab label="C++">…</Tab></Tabs> */
export function Tabs({ children }: { children: React.ReactNode }) {
  const tabs = Children.toArray(children).filter(isValidElement) as React.ReactElement<{
    label: string;
    children: React.ReactNode;
  }>[];
  const [active, setActive] = useState(0);
  const uid = useId();

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") setActive((a) => (a + 1) % tabs.length);
    if (e.key === "ArrowLeft") setActive((a) => (a - 1 + tabs.length) % tabs.length);
  };

  return (
    <div className="not-prose my-6">
      <div role="tablist" onKeyDown={onKey} className="flex gap-1 border-b border-border">
        {tabs.map((t, i) => (
          <button
            key={t.props.label}
            role="tab"
            id={`${uid}-t${i}`}
            aria-selected={i === active}
            aria-controls={`${uid}-p${i}`}
            tabIndex={i === active ? 0 : -1}
            onClick={() => setActive(i)}
            className={cn(
              "-mb-px border-b-2 px-3 py-1.5 text-sm",
              i === active ? "border-accent font-medium text-accent" : "border-transparent text-muted-fg hover:text-fg",
            )}
          >
            {t.props.label}
          </button>
        ))}
      </div>
      {tabs.map((t, i) => (
        <div
          key={t.props.label}
          role="tabpanel"
          id={`${uid}-p${i}`}
          aria-labelledby={`${uid}-t${i}`}
          hidden={i !== active}
          className="prose prose-sm max-w-none pt-2 dark:prose-invert"
        >
          {t.props.children}
        </div>
      ))}
    </div>
  );
}

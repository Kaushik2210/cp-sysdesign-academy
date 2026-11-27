"use client";

import { useEffect, useId, useState } from "react";
import { cn } from "@/lib/utils";
import type { Walkthrough } from "./ConceptWalkthrough";

const button = "min-h-11 rounded-full border border-border px-3 text-sm font-medium hover:bg-muted disabled:opacity-45";

export function ConceptWalkthroughPlayer({ title, nodes, edges, frames }: Walkthrough) {
  const titleId = useId();
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const frame = frames[index];
  const last = frames.length - 1;
  const active = new Set(frame.active);
  const positions = new Map(nodes.map((node) => [node.id, node]));

  useEffect(() => {
    if (!playing || index === last) return;
    const timer = window.setTimeout(() => {
      setIndex(index + 1);
      if (index + 1 === last) setPlaying(false);
    }, 3500);
    return () => window.clearTimeout(timer);
  }, [index, last, playing]);

  function goTo(step: number) {
    setPlaying(false);
    setIndex(step);
  }

  return (
    <section aria-labelledby={titleId} className="not-prose my-6 scroll-mt-28 overflow-hidden rounded-lg border border-border bg-card">
      <div className="border-b border-border px-4 py-3 sm:px-5">
        <h3 id={titleId} className="text-lg font-semibold tracking-tight">{title}</h3>
      </div>
      <div aria-hidden="true" className="relative h-44 border-b border-border bg-muted sm:h-52">
        <svg className="pointer-events-none absolute inset-0 h-full w-full" focusable="false">
          {(frame.edges ?? edges).map(({ from, to }) => {
            const a = positions.get(from)!;
            const b = positions.get(to)!;
            return (
              <line key={`${from}-${to}`} x1={`${a.x}%`} y1={`${a.y}%`} x2={`${b.x}%`} y2={`${b.y}%`}
                stroke="currentColor" strokeWidth={2}
                className={cn("motion-safe:transition motion-safe:duration-200", active.has(from) && active.has(to) ? "text-hot" : "text-muted-fg opacity-50")} />
            );
          })}
        </svg>
        {nodes.map((node) => (
          <div key={node.id} style={{ left: `${node.x}%`, top: `${node.y}%` }} className="absolute -translate-x-1/2 -translate-y-1/2">
            <span className={cn(
              "flex min-h-8 min-w-8 items-center justify-center whitespace-nowrap rounded-md border-2 px-1.5 font-mono text-xs font-semibold motion-safe:transition motion-safe:duration-200",
              active.has(node.id) ? "border-hot bg-accent text-accent-fg motion-safe:scale-110" : "border-border bg-card text-fg",
            )}>
              {node.label}
            </span>
            {frame.values && Object.hasOwn(frame.values, node.id) && (
              <span className="absolute left-1/2 mt-1 -translate-x-1/2 whitespace-nowrap rounded bg-card px-1 font-mono text-xs text-fg">
                {frame.values[node.id]}
              </span>
            )}
          </div>
        ))}
      </div>
      <div className="space-y-3 px-4 py-3 sm:px-5">
        <div role="status" aria-live={playing ? "off" : "polite"} className="space-y-1">
          <p className="text-xs font-semibold tabular-nums text-hot">Step {index + 1} of {frames.length}</p>
          <p className="font-semibold">{frame.title}</p>
          <p className="text-sm leading-relaxed text-muted-fg">{frame.note}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className={button} disabled={index === 0} onClick={() => goTo(index - 1)}>Previous step</button>
          <button type="button" className={cn(button, "border-accent bg-accent text-accent-fg hover:bg-accent hover:brightness-110")} disabled={index === last} onClick={() => goTo(index + 1)}>Next step</button>
          <button type="button" className={button} onClick={() => {
            if (index === last) setIndex(0);
            setPlaying(!playing);
          }}>{playing ? "Pause" : index === last ? "Replay" : "Play"}</button>
          <button type="button" className={button} onClick={() => goTo(0)}>Restart</button>
        </div>
        <details className="border-t border-border text-sm">
          <summary className="min-h-11 cursor-pointer py-3 font-medium">Read all steps</summary>
          <ol className="mb-2 list-decimal space-y-2 pl-5 text-muted-fg">
            {frames.map((item, step) => (
              <li key={step}><strong className="text-fg">{item.title}</strong> {item.note}</li>
            ))}
          </ol>
        </details>
      </div>
    </section>
  );
}

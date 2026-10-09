"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface CellMark {
  label?: string;
  tone?: "accent" | "good" | "bad" | "muted";
}

const TONE = {
  accent: "border-accent bg-accent/15",
  good: "border-emerald-500 bg-emerald-500/15",
  bad: "border-red-500 bg-red-500/15",
  muted: "border-border opacity-40",
} as const;

/** Row of cells with optional per-index labels (pointers) and tones. */
export function ArrayView({ values, marks = {} }: { values: number[]; marks?: Record<number, CellMark> }) {
  const reduce = useReducedMotion();
  return (
    <ol className="flex flex-wrap gap-2 pb-6" aria-label="Array state">
      {values.map((v, i) => {
        const m = marks[i];
        return (
          <li key={i} className="relative flex flex-col items-center">
            <motion.div
              layout={!reduce}
              className={cn(
                "flex h-10 min-w-10 items-center justify-center rounded border px-2 font-mono text-sm",
                m?.tone ? TONE[m.tone] : "border-border bg-card",
              )}
            >
              {v}
            </motion.div>
            <span className="text-[10px] text-muted-fg">{i}</span>
            {m?.label && <span className="absolute -bottom-5 text-xs font-semibold text-accent">{m.label}</span>}
          </li>
        );
      })}
    </ol>
  );
}

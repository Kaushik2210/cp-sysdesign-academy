"use client";

import { useMemo, useState } from "react";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export interface InsightView {
  id: string;
  finding: string;
  figure?: string;
  implication: string;
  source: { name: string; url: string; kind: "primary" | "secondary" };
  confidence: "high" | "medium" | "low";
  retrieved: string;
}

const CONFIDENCE_LABEL = { high: "High confidence", medium: "Medium confidence", low: "Low confidence" } as const;
const CONFIDENCE_STYLE = {
  high: "border-emerald-500/60 text-emerald-600 dark:text-emerald-400",
  medium: "border-amber-500/60 text-amber-600 dark:text-amber-400",
  low: "border-border text-muted-fg",
} as const;

/** Findings grouped by theme. Confidence is shown as text, never colour alone. */
export function MarketView({ topics }: { topics: { id: string; title: string; insights: InsightView[] }[] }) {
  const [strongOnly, setStrongOnly] = useState(false);

  const shown = useMemo(
    () =>
      topics
        .map((t) => ({ ...t, insights: t.insights.filter((i) => !strongOnly || i.confidence === "high") }))
        .filter((t) => t.insights.length > 0),
    [topics, strongOnly],
  );
  const count = shown.reduce((n, t) => n + t.insights.length, 0);

  return (
    <div className="mt-6">
      <label className="flex min-h-11 items-center gap-2 text-sm">
        <input type="checkbox" checked={strongOnly} onChange={(e) => setStrongOnly(e.target.checked)} className="h-5 w-5 accent-[hsl(var(--hot))]" />
        Show only high-confidence findings (primary data)
      </label>
      <p role="status" className="mt-1 text-sm text-muted-fg">
        {count} findings
      </p>

      <nav aria-label="Jump to topic" className="mt-3 flex flex-wrap gap-2">
        {shown.map((t) => (
          <a key={t.id} href={`#${t.id}`} className="inline-flex min-h-11 items-center rounded-full border border-border bg-card/70 px-4 text-sm font-medium transition hover:-translate-y-0.5 hover:border-transparent hover:bg-gradient-brand hover:text-white">
            {t.title}
          </a>
        ))}
      </nav>

      {shown.map((t) => (
        <section key={t.id} id={t.id} aria-labelledby={`${t.id}-h`} className="mt-10 scroll-mt-20">
          <h2 id={`${t.id}-h`} className="flex items-center gap-3 text-2xl font-extrabold tracking-tight before:h-6 before:w-1.5 before:rounded-full before:bg-gradient-to-b before:from-accent before:to-hot before:content-['']">
            {t.title}
          </h2>
          <ul className="mt-3 space-y-4">
            {t.insights.map((i) => (
              <li key={i.id}>
                <article className="rounded-2xl border border-border bg-card/80 p-5 backdrop-blur-sm transition duration-200 hover:-translate-y-0.5 hover:border-cool/70 hover:shadow-[0_12px_32px_-14px_hsl(var(--cool))]">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className={cn("rounded-full border px-2 py-0.5", CONFIDENCE_STYLE[i.confidence])}>{CONFIDENCE_LABEL[i.confidence]}</span>
                    <span className="rounded-full border border-border px-2 py-0.5 text-muted-fg">{i.source.kind === "primary" ? "Primary data" : "Reported by a third party"}</span>
                    {i.figure && <span className="font-mono text-muted-fg">{i.figure}</span>}
                  </div>
                  <p className="mt-2">{i.finding}</p>
                  <p className="mt-2 rounded-md bg-muted p-2 text-sm">
                    <b>What it means for you:</b> {i.implication}
                  </p>
                  <p className="mt-2 text-xs text-muted-fg">
                    Source:{" "}
                    <a href={i.source.url} rel="noopener noreferrer" target="_blank" className="inline-flex items-center gap-1 text-accent underline">
                      {i.source.name} <ExternalLink size={12} aria-hidden />
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>{" "}
                    · checked {i.retrieved}
                  </p>
                </article>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
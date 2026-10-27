"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import { useProgress } from "@/lib/store";
import { cn } from "@/lib/utils";

export type StepView =
  | { key: string; kind: "lesson"; title: string; href: string; lessonId: string }
  | { key: string; kind: "page"; title: string; href: string; note?: string }
  | { key: string; kind: "external"; title: string; url: string; type: string; note?: string }
  | { key: string; kind: "project"; title: string; brief: string; deliverable: string }
  | { key: string; kind: "planned"; title: string; note: string };

export interface PhaseView {
  id: string;
  order: number;
  title: string;
  goal: string;
  when: string;
  hoursPerWeek: number;
  why: { id: string; label: string; href: string }[];
  steps: StepView[];
  exit: { key: string; text: string }[];
}

const PHASE_TINT = ["leaf", "cool", "accent", "hot", "sun"];

const KIND_LABEL: Record<string, string> = {
  lesson: "Lesson",
  page: "Tool",
  external: "Resource",
  project: "Project",
};

/** The roadmap as a checklist. Lessons tick from lesson completion; everything else is self-reported. */
export function RoadmapView({ phases }: { phases: PhaseView[] }) {
  const completed = useProgress((s) => s.completed);
  const ticked = useProgress((s) => s.roadmap);
  const toggleRoadmap = useProgress((s) => s.toggleRoadmap);
  const toggleComplete = useProgress((s) => s.toggleComplete);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDone = (s: StepView) => (s.kind === "lesson" ? !!completed[s.lessonId] : !!ticked[s.key]);
  const trackable = (s: StepView) => s.kind !== "planned";

  const all = phases.flatMap((p) => p.steps.filter(trackable));
  const doneAll = mounted ? all.filter(isDone).length : 0;
  const pct = all.length ? Math.round((doneAll / all.length) * 100) : 0;

  return (
    <div className="mt-6">
      <div className="rounded-2xl border border-border bg-card/80 p-5 shadow-lg backdrop-blur-sm">
        <div className="flex justify-between text-sm">
          <span className="font-medium">Overall progress</span>
          <span className="text-muted-fg">
            {doneAll}/{all.length} steps · {pct}%
          </span>
        </div>
        <div role="progressbar" aria-label="Overall roadmap progress" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} className="mt-2 h-3 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-gradient-to-r from-accent via-hot to-sun transition-[width] duration-700" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <ol className="mt-6 space-y-4">
        {phases.map((p) => {
          const steps = p.steps.filter(trackable);
          const done = mounted ? steps.filter(isDone).length : 0;
          return (
            <li key={p.id}>
              <details id={p.id} className="group rounded-2xl border border-border bg-card/80 transition-shadow open:shadow-lg hover:border-accent/60" open={p.order === 1}>
                <summary className="flex min-h-11 cursor-pointer list-none flex-wrap items-center gap-x-3 gap-y-1 p-4">
                  <span aria-hidden="true" className="grid h-8 w-8 place-items-center rounded-xl text-sm font-black text-white shadow-md" style={{ background: `linear-gradient(135deg, hsl(var(--${PHASE_TINT[(p.order - 1) % PHASE_TINT.length]})), hsl(var(--accent)))` }}>{p.order}</span>
                  <span className="sr-only">Phase {p.order}:</span>
                  <span className="font-semibold">{p.title}</span>
                  <span className="ml-auto text-sm text-muted-fg">
                    {p.when} · ~{p.hoursPerWeek} h/week · {done}/{steps.length}
                  </span>
                  <span aria-hidden="true" className="basis-full overflow-hidden rounded-full bg-muted sm:ml-11">
                    <span className="block h-1 rounded-full bg-gradient-to-r from-accent to-hot transition-[width] duration-700" style={{ width: `${steps.length ? (done / steps.length) * 100 : 0}%` }} />
                  </span>
                </summary>

                <div className="space-y-5 border-t border-border p-4">
                  <p>{p.goal}</p>

                  {p.why.length > 0 && (
                    <p className="text-sm text-muted-fg">
                      Why now:{" "}
                      {p.why.map((w, i) => (
                        <span key={w.id}>
                          {i > 0 && ", "}
                          <Link href={w.href} className="text-accent underline">
                            {w.label}
                          </Link>
                        </span>
                      ))}
                    </p>
                  )}

                  <ul className="space-y-2">
                    {p.steps.map((s) => (
                      <li key={s.key} className="flex gap-3">
                        {trackable(s) ? (
                          <input
                            type="checkbox"
                            id={`step-${s.key}`}
                            className="mt-1.5 h-5 w-5 shrink-0 accent-[hsl(var(--hot))]"
                            checked={mounted && isDone(s)}
                            onChange={() => (s.kind === "lesson" ? toggleComplete(s.lessonId, s.title) : toggleRoadmap(s.key))}
                          />
                        ) : (
                          <span aria-hidden className="mt-1.5 h-5 w-5 shrink-0 text-center text-xs text-muted-fg">
                            •
                          </span>
                        )}
                        <div className="min-w-0 text-sm">
                          <label htmlFor={`step-${s.key}`} className={cn("flex flex-wrap items-baseline gap-x-2", !trackable(s) && "cursor-default")}>
                            <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-fg">
                              {s.kind === "planned" ? "Not on this site yet" : s.kind === "external" ? s.type : KIND_LABEL[s.kind]}
                            </span>
                            {s.kind === "lesson" || s.kind === "page" ? (
                              <Link href={s.href} className="font-medium text-accent underline">
                                {s.title}
                              </Link>
                            ) : s.kind === "external" ? (
                              <a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium text-accent underline">
                                {s.title} <ExternalLink size={12} aria-hidden />
                                <span className="sr-only">(opens in a new tab)</span>
                              </a>
                            ) : (
                              <span className="font-medium">{s.title}</span>
                            )}
                          </label>
                          {s.kind === "project" ? (
                            <>
                              <p className="mt-1">{s.brief}</p>
                              <p className="mt-1 text-muted-fg">
                                <b>Deliverable:</b> {s.deliverable}
                              </p>
                            </>
                          ) : "note" in s && s.note ? (
                            <p className="mt-0.5 text-muted-fg">{s.note}</p>
                          ) : null}
                        </div>
                      </li>
                    ))}
                  </ul>

                  <fieldset className="rounded-lg border border-border p-3">
                    <legend className="px-1 text-sm font-semibold">You are done with this phase when</legend>
                    <ul className="space-y-1">
                      {p.exit.map((e) => (
                        <li key={e.key} className="flex gap-3 text-sm">
                          <input type="checkbox" id={`exit-${e.key}`} className="mt-1 h-5 w-5 shrink-0 accent-[hsl(var(--hot))]" checked={mounted && !!ticked[e.key]} onChange={() => toggleRoadmap(e.key)} />
                          <label htmlFor={`exit-${e.key}`}>{e.text}</label>
                        </li>
                      ))}
                    </ul>
                  </fieldset>
                </div>
              </details>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
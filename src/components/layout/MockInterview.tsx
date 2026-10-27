"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play, Square, Trash2 } from "lucide-react";
import type { QuestionKind } from "@/lib/content/questions";
import { PHASES, currentPhase, dimensionStats, formatClock, overallPercent, type MockAttempt } from "@/lib/mock";
import { useProgress } from "@/lib/store";
import { cn } from "@/lib/utils";

export interface QuestionView {
  id: string;
  kind: QuestionKind;
  level: "junior" | "mid" | "senior";
  title: string;
  prompt: string;
  clarify: string[];
  strongAnswer: string[];
  pitfalls: string[];
  minutes: number;
  related: { title: string; href: string }[];
}

export interface RubricView {
  anchors: Record<"1" | "2" | "3" | "4", string>;
  dimensions: Record<QuestionKind, { id: string; label: string; good: string }[]>;
}

type Stage = "setup" | "running" | "review" | "saved";

const btn = "inline-flex min-h-11 items-center gap-1.5 rounded-full border border-border bg-card/70 px-4 text-sm font-medium transition hover:-translate-y-0.5 hover:bg-muted disabled:opacity-50 disabled:hover:translate-y-0";
const primary = "inline-flex min-h-11 items-center gap-1.5 rounded-full bg-gradient-brand px-5 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-50 disabled:hover:translate-y-0";

/** Timed mock interview with phase prompts, rubric self-scoring and a history of attempts. */
export function MockInterview({
  questions,
  rubric,
  kindTitles,
}: {
  questions: QuestionView[];
  rubric: RubricView;
  kindTitles: Record<QuestionKind, string>;
}) {
  const mocks = useProgress((s) => s.mocks);
  const addMock = useProgress((s) => s.addMock);
  const deleteMock = useProgress((s) => s.deleteMock);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [stage, setStage] = useState<Stage>("setup");
  const [kind, setKind] = useState<QuestionKind>("system-design");
  const [level, setLevel] = useState<"all" | "junior" | "mid" | "senior">("all");
  const [question, setQuestion] = useState<QuestionView>();
  const [showHints, setShowHints] = useState(false);

  // Timer: derived from timestamps so it stays correct if the tab is throttled.
  const startedAt = useRef(0);
  const pausedAt = useRef<number | null>(null);
  const pausedTotal = useRef(0);
  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);

  const [covered, setCovered] = useState<boolean[]>([]);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState("");
  const [finalSeconds, setFinalSeconds] = useState(0);

  const pool = useMemo(() => questions.filter((q) => q.kind === kind && (level === "all" || q.level === level)), [questions, kind, level]);

  useEffect(() => {
    if (stage !== "running") return;
    const id = setInterval(() => {
      if (pausedAt.current === null) setElapsed((Date.now() - startedAt.current - pausedTotal.current) / 1000);
    }, 500);
    return () => clearInterval(id);
  }, [stage]);

  const start = () => {
    if (!pool.length) return;
    const q = pool[Math.floor(Math.random() * pool.length)];
    setQuestion(q);
    setCovered(q.strongAnswer.map(() => false));
    setScores({});
    setNotes("");
    setShowHints(false);
    setElapsed(0);
    setPaused(false);
    pausedAt.current = null;
    pausedTotal.current = 0;
    startedAt.current = Date.now();
    setStage("running");
  };

  const togglePause = () => {
    if (pausedAt.current === null) {
      pausedAt.current = Date.now();
      setPaused(true);
    } else {
      pausedTotal.current += Date.now() - pausedAt.current;
      pausedAt.current = null;
      setPaused(false);
    }
  };

  const finish = () => {
    setFinalSeconds(Math.round(pausedAt.current === null ? (Date.now() - startedAt.current - pausedTotal.current) / 1000 : elapsed));
    setStage("review");
  };

  const dims = rubric.dimensions[kind];
  const allScored = dims.every((d) => scores[d.id]);
  const save = () => {
    if (!question || !allScored) return;
    const attempt: MockAttempt = {
      id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      questionId: question.id,
      kind: question.kind,
      date: new Date().toISOString(),
      secondsUsed: finalSeconds,
      scores,
      coverage: covered.length ? covered.filter(Boolean).length / covered.length : 0,
      notes,
    };
    addMock(attempt);
    setStage("saved");
  };

  const total = (question?.minutes ?? 45) * 60;
  const phase = question ? currentPhase(question.kind, elapsed, total) : undefined;
  const stats = dimensionStats(mocks, kind);
  const labelOf = (id: string) => dims.find((d) => d.id === id)?.label ?? id;
  const titleOf = (qid: string) => questions.find((q) => q.id === qid)?.title ?? qid;

  return (
    <div className="mt-6">
      {stage === "setup" && (
        <section aria-labelledby="setup-h" className="rounded-2xl border border-border bg-card/80 p-5 shadow-lg backdrop-blur-sm">
          <h2 id="setup-h" className="text-lg font-semibold">
            Start a mock interview
          </h2>
          <fieldset className="mt-3">
            <legend className="text-sm font-medium">Type</legend>
            <div className="mt-1 flex flex-wrap gap-2">
              {(Object.keys(kindTitles) as QuestionKind[]).map((k) => (
                <label key={k} className={cn(btn, kind === k && "border-accent text-accent")}>
                  <input type="radio" name="kind" className="sr-only" checked={kind === k} onChange={() => setKind(k)} />
                  {kindTitles[k]}
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset className="mt-3">
            <legend className="text-sm font-medium">Level</legend>
            <div className="mt-1 flex flex-wrap gap-2">
              {(["all", "junior", "mid", "senior"] as const).map((l) => (
                <label key={l} className={cn(btn, level === l && "border-accent text-accent")}>
                  <input type="radio" name="level" className="sr-only" checked={level === l} onChange={() => setLevel(l)} />
                  {l === "all" ? "Any level" : l}
                </label>
              ))}
            </div>
          </fieldset>
          <p role="status" className="mt-3 text-sm text-muted-fg">
            {pool.length} {pool.length === 1 ? "question" : "questions"} match. You get a random one, a countdown with prompts for each phase, then you score yourself.
          </p>
          <button type="button" className={cn(primary, "mt-3")} onClick={start} disabled={!pool.length}>
            <Play size={14} aria-hidden /> Draw a question and start
          </button>
        </section>
      )}

      {stage === "running" && question && phase && (
        <section aria-labelledby="run-h" className="rounded-2xl border border-border bg-card/80 p-5 shadow-lg backdrop-blur-sm">
          <p className="text-xs uppercase tracking-wide text-muted-fg">
            {kindTitles[question.kind]} · {question.level} · {question.minutes} min
          </p>
          <h2 id="run-h" className="mt-1 text-xl font-bold">
            {question.title}
          </h2>
          <p className="mt-2">{question.prompt}</p>

          <div className="mt-4 flex flex-wrap items-center gap-4">
            <div role="timer" aria-label="Time elapsed" className={cn("font-mono text-5xl font-black tabular-nums", phase === "overtime" ? "animate-pulse text-red-500" : "text-gradient")}>
              {formatClock(elapsed)}
              <span className="ml-2 text-sm font-normal text-muted-fg">/ {formatClock(total)}</span>
            </div>
            <div className="min-w-0 flex-1">
              <div role="progressbar" aria-label="Interview time used" aria-valuenow={Math.min(100, Math.round((elapsed / total) * 100))} aria-valuemin={0} aria-valuemax={100} className="h-3 overflow-hidden rounded-full bg-muted">
                <div className={cn("h-full rounded-full transition-[width] duration-1000 ease-linear", phase === "overtime" ? "bg-red-500" : "bg-gradient-to-r from-accent via-hot to-sun")} style={{ width: `${Math.min(100, (elapsed / total) * 100)}%` }} />
              </div>
            </div>
          </div>

          <div aria-live="polite" className="mt-3 rounded-md bg-muted p-3 text-sm">
            {phase === "overtime" ? (
              <p>
                <b>Overtime (+{formatClock(elapsed - total)}).</b> In a real interview you would be wrapping up. Summarise your design and its main trade-off.
              </p>
            ) : (
              <p>
                <b>Now: {phase.label}.</b> {phase.tip}
              </p>
            )}
          </div>

          <ol className="mt-3 flex flex-wrap gap-1 text-xs" aria-label="Phases">
            {PHASES[question.kind].map((p) => (
              <li key={p.id} className={cn("rounded-full border border-border px-3 py-1 transition", phase !== "overtime" && phase.id === p.id && "border-transparent bg-gradient-brand font-semibold text-white shadow-md")} aria-current={phase !== "overtime" && phase.id === p.id ? "step" : undefined}>
                {p.label}
              </li>
            ))}
          </ol>

          <label className="mt-3 flex min-h-11 items-center gap-2 text-sm">
            <input type="checkbox" checked={showHints} onChange={(e) => setShowHints(e.target.checked)} className="h-4 w-4" />
            Show questions a strong candidate would ask (a hint)
          </label>
          {showHints && (
            <ul className="list-disc pl-6 text-sm">
              {question.clarify.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" className={btn} onClick={togglePause}>
              {paused ? <Play size={14} aria-hidden /> : <Pause size={14} aria-hidden />} {paused ? "Resume" : "Pause"}
            </button>
            <button type="button" className={primary} onClick={finish}>
              <Square size={14} aria-hidden /> Finish and review
            </button>
          </div>
          <p className="mt-2 text-xs text-muted-fg">Talk out loud and use paper or a whiteboard. This tool only keeps time and prompts you.</p>
        </section>
      )}

      {stage === "review" && question && (
        <section aria-labelledby="rev-h" className="space-y-5 rounded-2xl border border-border bg-card/80 p-5 shadow-lg backdrop-blur-sm">
          <div>
            <h2 id="rev-h" className="text-xl font-bold">
              Review: {question.title}
            </h2>
            <p className="text-sm text-muted-fg">You used {formatClock(finalSeconds)} of {formatClock(total)}.</p>
          </div>

          <fieldset>
            <legend className="font-semibold">What a strong answer covers. Tick what you covered.</legend>
            <ul className="mt-2 space-y-2">
              {question.strongAnswer.map((s, i) => (
                <li key={s} className="flex gap-3 text-sm">
                  <input type="checkbox" id={`cov-${i}`} className="mt-1 h-5 w-5 shrink-0" checked={!!covered[i]} onChange={() => setCovered((c) => c.map((v, j) => (j === i ? !v : v)))} />
                  <label htmlFor={`cov-${i}`}>{s}</label>
                </li>
              ))}
            </ul>
          </fieldset>

          <div>
            <p className="font-semibold">Common pitfalls</p>
            <ul className="mt-1 list-disc pl-6 text-sm">
              {question.pitfalls.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-semibold">Score yourself honestly</p>
            <dl className="mt-1 grid gap-x-4 text-xs text-muted-fg sm:grid-cols-2">
              {(["1", "2", "3", "4"] as const).map((n) => (
                <div key={n} className="flex gap-1">
                  <dt className="font-semibold">{n}:</dt>
                  <dd>{rubric.anchors[n]}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-3 space-y-3">
              {dims.map((d) => (
                <fieldset key={d.id} className="rounded-lg border border-border p-3">
                  <legend className="px-1 text-sm font-semibold">{d.label}</legend>
                  <p className="text-xs text-muted-fg">{d.good}</p>
                  <div className="mt-2 flex gap-2" role="radiogroup" aria-label={`${d.label} score`}>
                    {[1, 2, 3, 4].map((n) => (
                      <label key={n} className={cn("inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-md border border-border text-sm hover:bg-muted", scores[d.id] === n && "border-accent bg-accent text-accent-fg")}>
                        <input type="radio" className="sr-only" name={`score-${d.id}`} checked={scores[d.id] === n} onChange={() => setScores((s) => ({ ...s, [d.id]: n }))} />
                        {n}
                      </label>
                    ))}
                  </div>
                </fieldset>
              ))}
            </div>
          </div>

          <label className="block text-sm font-medium">
            Notes: what to practise next
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="mt-1 w-full rounded-md border border-border bg-bg p-2 font-normal" />
          </label>

          {question.related.length > 0 && (
            <p className="text-sm">
              Study:{" "}
              {question.related.map((r, i) => (
                <span key={r.href}>
                  {i > 0 && ", "}
                  <Link href={r.href} className="text-accent underline">
                    {r.title}
                  </Link>
                </span>
              ))}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button type="button" className={primary} onClick={save} disabled={!allScored}>
              Save attempt
            </button>
            {!allScored && <span className="text-sm text-muted-fg">Score every dimension to save ({dims.filter((d) => scores[d.id]).length}/{dims.length}).</span>}
          </div>
        </section>
      )}

      {stage === "saved" && question && (
        <section aria-labelledby="saved-h" className="rounded-2xl border border-border bg-card/80 p-5 shadow-lg backdrop-blur-sm">
          <h2 id="saved-h" className="text-lg font-semibold">
            Saved
          </h2>
          <p role="status" className="mt-1">
            Overall {overallPercent(scores)}% on {question.title}. Focus on your weakest dimension next time.
          </p>
          <button type="button" className={cn(primary, "mt-3")} onClick={() => setStage("setup")}>
            Another mock
          </button>
        </section>
      )}

      {mounted && (
        <section aria-labelledby="hist-h" className="mt-8">
          <h2 id="hist-h" className="text-lg font-semibold">
            Your history ({mocks.length})
          </h2>
          {mocks.length === 0 ? (
            <p className="mt-1 text-sm text-muted-fg">No attempts yet. Your scores stay in this browser and export with your progress.</p>
          ) : (
            <>
              {stats.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium">{kindTitles[kind]}: average score per dimension (weakest first)</p>
                  <ul className="mt-1 space-y-1">
                    {stats.map((s) => (
                      <li key={s.id} className="text-sm">
                        <div className="flex justify-between">
                          <span>{labelOf(s.id)}</span>
                          <span className="text-muted-fg">
                            {s.average.toFixed(1)} / 4 · {s.count} {s.count === 1 ? "attempt" : "attempts"}
                          </span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded bg-muted">
                          <div className="h-full bg-accent" style={{ width: `${(s.average / 4) * 100}%` }} />
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <ul className="mt-4 space-y-2">
                {[...mocks].reverse().map((m) => (
                  <li key={m.id} className="flex items-center gap-3 rounded-lg border border-border p-3 text-sm">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{titleOf(m.questionId)}</p>
                      <p className="text-xs text-muted-fg">
                        {new Date(m.date).toLocaleDateString()} · {formatClock(m.secondsUsed)} · {overallPercent(m.scores)}% · covered {Math.round(m.coverage * 100)}%
                      </p>
                      {m.notes && <p className="mt-1 text-xs">{m.notes}</p>}
                    </div>
                    <button type="button" className={cn(btn, "px-3")} onClick={() => deleteMock(m.id)} aria-label={`Delete attempt: ${titleOf(m.questionId)}`}>
                      <Trash2 size={14} aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      )}
    </div>
  );
}
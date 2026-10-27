"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Shuffle } from "lucide-react";
import { ALGORITHMS, ALGORITHM_LABEL, PATTERN_LABEL, generateTrace, makeLimiter, simulate, type Algorithm, type Pattern } from "@/lib/sim/ratelimit";
import { cn } from "@/lib/utils";

const PATTERNS = Object.keys(PATTERN_LABEL) as Pattern[];
const WINDOWS = [1, 2, 5];
const W = 640;
const H = 190;
const PAD = 28;

const EXPLAIN: Record<Algorithm, string> = {
  fixed: "Counts requests in fixed intervals and resets at each boundary. Cheap and simple, but a burst just before and just after a boundary lets up to twice the limit through.",
  log: "Keeps the timestamp of every allowed request and counts those in the last window. Exact, but memory grows with the limit, so it is costly at scale.",
  sliding: "Blends the previous window's count with the current one, weighted by overlap. Close to exact with only two counters per key; it can exceed the limit slightly.",
  bucket: "Tokens refill at a steady rate and each request spends one. Allows a burst up to the bucket size, then holds the average rate.",
};

/** Compare rate-limiting algorithms on the same traffic and see the real peak rate each lets through. */
export function RateLimiterSandbox() {
  const [algo, setAlgo] = useState<Algorithm>("fixed");
  const [limit, setLimit] = useState(10);
  const [windowS, setWindowS] = useState(1);
  const [pattern, setPattern] = useState<Pattern>("boundary");
  const [seed, setSeed] = useState(1);

  const durationMs = windowS * 1000 * 4;
  const trace = useMemo(() => generateTrace(pattern, limit, windowS, durationMs, seed), [pattern, limit, windowS, durationMs, seed]);
  const results = useMemo(
    () => Object.fromEntries(ALGORITHMS.map((a) => [a, simulate(makeLimiter(a, limit, windowS), trace, windowS * 1000)])) as Record<Algorithm, ReturnType<typeof simulate>>,
    [trace, limit, windowS],
  );
  const r = results[algo];
  const over = r.maxInWindow - limit;

  const x = (t: number) => PAD + (t / durationMs) * (W - 2 * PAD);
  const boundaries = Array.from({ length: 3 }, (_, i) => (i + 1) * windowS * 1000);
  const base = H / 2;

  const btn = "inline-flex min-h-11 items-center gap-1.5 rounded-full border border-border bg-card px-4 text-sm font-medium transition hover:-translate-y-0.5 hover:border-accent hover:bg-muted";

  return (
    <div className="mt-6 space-y-6">
      <section aria-labelledby="rl-controls" className="rounded-2xl border border-border bg-card/80 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-lg p-4">
        <h2 id="rl-controls" className="text-base font-extrabold tracking-tight">
          Setup
        </h2>
        <fieldset className="mt-3">
          <legend className="text-sm font-medium">Algorithm</legend>
          <div className="mt-1 flex flex-wrap gap-2">
            {ALGORITHMS.map((a) => (
              <label key={a} className={cn(btn, "cursor-pointer", algo === a && "border-accent text-accent")}>
                <input type="radio" name="rl-algo" className="sr-only" checked={algo === a} onChange={() => setAlgo(a)} />
                {ALGORITHM_LABEL[a]}
              </label>
            ))}
          </div>
          <p className="mt-2 text-sm text-muted-fg">{EXPLAIN[algo]}</p>
        </fieldset>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="rl-limit" className="flex justify-between text-sm font-medium">
              <span>Limit per window</span>
              <span className="font-mono">{limit}</span>
            </label>
            <input id="rl-limit" type="range" min={2} max={30} value={limit} onChange={(e) => setLimit(Number(e.target.value))} className="mt-1 h-11 w-full" />
          </div>
          <div>
            <label htmlFor="rl-window" className="block text-sm font-medium">
              Window length
            </label>
            <select id="rl-window" value={windowS} onChange={(e) => setWindowS(Number(e.target.value))} className="mt-1 min-h-11 w-full rounded-xl border border-border bg-bg focus-visible:border-accent px-2">
              {WINDOWS.map((w) => (
                <option key={w} value={w}>
                  {w} {w === 1 ? "second" : "seconds"}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="rl-pattern" className="block text-sm font-medium">
              Traffic pattern
            </label>
            <select id="rl-pattern" value={pattern} onChange={(e) => setPattern(e.target.value as Pattern)} className="mt-1 min-h-11 w-full rounded-xl border border-border bg-bg focus-visible:border-accent px-2">
              {PATTERNS.map((p) => (
                <option key={p} value={p}>
                  {PATTERN_LABEL[p]}
                </option>
              ))}
            </select>
          </div>
        </div>
        {pattern === "poisson" && (
          <button type="button" className={cn(btn, "mt-3")} onClick={() => setSeed((s) => s + 1)}>
            <Shuffle size={14} aria-hidden /> New random traffic
          </button>
        )}
      </section>

      <section aria-labelledby="rl-chart" className="rounded-2xl border border-border bg-card/80 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-lg p-4">
        <h2 id="rl-chart" className="text-base font-extrabold tracking-tight">
          What happened ({ALGORITHM_LABEL[algo]})
        </h2>
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Timeline of ${trace.length} requests over ${durationMs / 1000} seconds: ${r.allowed} allowed and ${r.rejected} rejected.`} className="mt-2 w-full">
          <line x1={PAD} x2={W - PAD} y1={base} y2={base} stroke="currentColor" strokeOpacity="0.3" />
          {boundaries.map((b) => (
            <g key={b}>
              <line x1={x(b)} x2={x(b)} y1={14} y2={H - 22} stroke="currentColor" strokeOpacity="0.25" strokeDasharray="4 4" />
              <text x={x(b)} y={H - 8} textAnchor="middle" className="fill-current text-[10px] opacity-70">
                {b / 1000}s
              </text>
            </g>
          ))}
          <text x={PAD} y={H - 8} className="fill-current text-[10px] opacity-70">
            0s
          </text>
          {r.events.map((e, i) => (
            <line
              key={i}
              x1={x(e.t)}
              x2={x(e.t)}
              y1={base}
              y2={e.allowed ? base - 44 : base + 44}
              stroke={e.allowed ? "#10b981" : "#ef4444"}
              strokeWidth={2}
              strokeOpacity={0.8}
            />
          ))}
          <text x={W - PAD} y={base - 50} textAnchor="end" className="fill-current text-[10px]">
            allowed (up)
          </text>
          <text x={W - PAD} y={base + 60} textAnchor="end" className="fill-current text-[10px]">
            rejected (down)
          </text>
        </svg>

        <dl className="mt-3 grid gap-2 sm:grid-cols-3" aria-live="polite">
          <div className="rounded-md bg-muted p-3">
            <dt className="text-xs text-muted-fg">Allowed / rejected</dt>
            <dd className="font-mono text-lg font-semibold">
              {r.allowed} / {r.rejected}
            </dd>
          </div>
          <div className="rounded-md bg-muted p-3 sm:col-span-2">
            <dt className="text-xs text-muted-fg">Most requests accepted in any {windowS}-second interval (your limit is {limit})</dt>
            <dd className="flex items-center gap-2 font-mono text-lg font-semibold">
              {r.maxInWindow}
              {over > 0 ? (
                <span className="inline-flex items-center gap-1 font-sans text-sm font-medium text-amber-600 dark:text-amber-400">
                  <AlertTriangle size={16} aria-hidden /> exceeds the limit by {over}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 font-sans text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 size={16} aria-hidden /> within the limit
                </span>
              )}
            </dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="rl-compare" className="rounded-2xl border border-border bg-card/80 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-lg p-4">
        <h2 id="rl-compare" className="text-base font-extrabold tracking-tight">
          Same traffic, every algorithm
        </h2>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full min-w-[28rem] border-collapse text-sm">
            <caption className="sr-only">Comparison of rate limiting algorithms on the same request trace</caption>
            <thead>
              <tr className="border-b border-border text-left">
                <th scope="col" className="p-2">Algorithm</th>
                <th scope="col" className="p-2">Allowed</th>
                <th scope="col" className="p-2">Rejected</th>
                <th scope="col" className="p-2">Peak in one window</th>
              </tr>
            </thead>
            <tbody>
              {ALGORITHMS.map((a) => (
                <tr key={a} className={cn("border-b border-border", a === algo && "bg-muted font-medium")}>
                  <th scope="row" className="p-2 text-left font-medium">
                    {ALGORITHM_LABEL[a]}
                    {a === algo && <span className="sr-only"> (selected)</span>}
                  </th>
                  <td className="p-2 font-mono">{results[a].allowed}</td>
                  <td className="p-2 font-mono">{results[a].rejected}</td>
                  <td className="p-2 font-mono">
                    {results[a].maxInWindow}
                    {results[a].maxInWindow > limit && " (over)"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, FastForward, RotateCcw } from "lucide-react";
import { POLICIES, POLICY_LABEL, TRACE_LABEL, generateAccessTrace, runOptimal, runTrace, stepTrace, type Policy, type TraceKind } from "@/lib/sim/cache";
import { cn } from "@/lib/utils";

const DEFAULT_SEQ = "A B C A D A E B A C";
const KINDS = Object.keys(TRACE_LABEL) as TraceKind[];
const UNIVERSE = 1000;
const LENGTH = 20000;

const btn = "inline-flex min-h-11 items-center gap-1.5 rounded-md border border-border px-3 text-sm hover:bg-muted disabled:opacity-50";

const EXPLAIN: Record<Policy, string> = {
  lru: "On a miss with a full cache, remove the key that has gone longest without being used.",
  lfu: "Remove the key used the fewest times (ties go to the least recently used).",
  fifo: "Remove the key that was inserted first, even if it was just used.",
};

/** Step through cache evictions, then compare policies on thousands of accesses. */
export function CacheSandbox() {
  const [policy, setPolicy] = useState<Policy>("lru");
  const [capacity, setCapacity] = useState(3);
  const [text, setText] = useState(DEFAULT_SEQ);
  const [pos, setPos] = useState(0); // number of accesses applied so far

  const trace = useMemo(() => text.split(/[\s,]+/).filter(Boolean).slice(0, 40), [text]);
  const steps = useMemo(() => stepTrace(policy, capacity, trace), [policy, capacity, trace]);
  const done = Math.min(pos, steps.length);
  const last = done > 0 ? steps[done - 1] : undefined;
  const hits = steps.slice(0, done).filter((s) => s.hit).length;

  const [kind, setKind] = useState<TraceKind>("zipf");
  const [size, setSize] = useState(50);
  const deferredSize = useDeferredValue(size);
  const compare = useMemo(() => {
    const big = generateAccessTrace(kind, LENGTH, UNIVERSE, deferredSize, 1);
    return {
      lru: runTrace("lru", deferredSize, big).hitRatio,
      lfu: runTrace("lfu", deferredSize, big).hitRatio,
      fifo: runTrace("fifo", deferredSize, big).hitRatio,
      opt: runOptimal(deferredSize, big).hitRatio,
    };
  }, [kind, deferredSize]);

  const reset = () => setPos(0);

  return (
    <div className="mt-6 space-y-8">
      <section aria-labelledby="cs-step" className="rounded-xl border border-border bg-card p-4">
        <h2 id="cs-step" className="text-lg font-semibold">
          1. Step through evictions
        </h2>
        <fieldset className="mt-3">
          <legend className="text-sm font-medium">Policy</legend>
          <div className="mt-1 flex flex-wrap gap-2">
            {POLICIES.map((p) => (
              <label key={p} className={cn(btn, "cursor-pointer", policy === p && "border-accent text-accent")}>
                <input
                  type="radio"
                  name="cs-policy"
                  className="sr-only"
                  checked={policy === p}
                  onChange={() => {
                    setPolicy(p);
                    reset();
                  }}
                />
                {POLICY_LABEL[p]}
              </label>
            ))}
          </div>
          <p className="mt-2 text-sm text-muted-fg">{EXPLAIN[policy]}</p>
        </fieldset>

        <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto]">
          <div>
            <label htmlFor="cs-seq" className="block text-sm font-medium">
              Access sequence (up to 40 keys, separated by spaces)
            </label>
            <input
              id="cs-seq"
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                reset();
              }}
              className="mt-1 min-h-11 w-full rounded-md border border-border bg-bg px-3 font-mono"
            />
          </div>
          <div>
            <label htmlFor="cs-cap" className="block text-sm font-medium">
              Cache size
            </label>
            <select
              id="cs-cap"
              value={capacity}
              onChange={(e) => {
                setCapacity(Number(e.target.value));
                reset();
              }}
              className="mt-1 min-h-11 rounded-md border border-border bg-bg px-3"
            >
              {[1, 2, 3, 4, 5, 6].map((c) => (
                <option key={c} value={c}>
                  {c} {c === 1 ? "slot" : "slots"}
                </option>
              ))}
            </select>
          </div>
        </div>

        <ol className="mt-3 flex flex-wrap gap-1 font-mono text-sm" aria-label="Access sequence progress">
          {trace.map((k, i) => (
            <li
              key={i}
              className={cn("rounded border px-2 py-0.5", i < done ? (steps[i].hit ? "border-emerald-500" : "border-red-500") : "border-border text-muted-fg", i === done - 1 && "font-bold")}
              aria-current={i === done - 1 ? "step" : undefined}
            >
              {k}
              {i < done && <span className="sr-only">{steps[i].hit ? " (hit)" : " (miss)"}</span>}
            </li>
          ))}
        </ol>

        <div className="mt-4 rounded-lg border border-border p-3">
          <p className="text-xs uppercase tracking-wide text-muted-fg">Cache contents (safest first, next to be evicted last)</p>
          <ul className="mt-2 flex min-h-12 flex-wrap gap-2" aria-label="Cache slots">
            {Array.from({ length: capacity }).map((_, i) => {
              const key = last?.state[i];
              return (
                <li key={i} className={cn("flex h-12 w-14 items-center justify-center rounded-md border font-mono text-lg", key ? "border-accent bg-accent/10" : "border-dashed border-border text-muted-fg")}>
                  {key ?? "-"}
                </li>
              );
            })}
          </ul>
          <p aria-live="polite" className="mt-3 text-sm">
            {last ? (
              <>
                Accessed <b className="font-mono">{last.key}</b>:{" "}
                {last.hit ? <b className="text-emerald-600 dark:text-emerald-400">HIT</b> : <b className="text-red-600 dark:text-red-400">MISS</b>}
                {last.evicted && (
                  <>
                    {" "}
                    and evicted <b className="font-mono">{last.evicted}</b>
                  </>
                )}
                . Hits so far: {hits} of {done} ({done ? Math.round((hits / done) * 100) : 0}%).
              </>
            ) : (
              <span className="text-muted-fg">Press Step to apply the first access.</span>
            )}
          </p>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" className={btn} onClick={() => setPos((p) => Math.max(0, p - 1))} disabled={done === 0}>
            <ChevronLeft size={14} aria-hidden /> Back
          </button>
          <button type="button" className={btn} onClick={() => setPos((p) => Math.min(steps.length, p + 1))} disabled={done >= steps.length}>
            Step <ChevronRight size={14} aria-hidden />
          </button>
          <button type="button" className={btn} onClick={() => setPos(steps.length)} disabled={done >= steps.length}>
            <FastForward size={14} aria-hidden /> Run to end
          </button>
          <button type="button" className={btn} onClick={reset}>
            <RotateCcw size={14} aria-hidden /> Reset
          </button>
        </div>
      </section>

      <section aria-labelledby="cs-compare" className="rounded-xl border border-border bg-card p-4">
        <h2 id="cs-compare" className="text-lg font-semibold">
          2. Compare policies on {LENGTH.toLocaleString("en-US")} accesses
        </h2>
        <p className="mt-1 text-sm text-muted-fg">{UNIVERSE.toLocaleString("en-US")} distinct keys. Change the traffic and the cache size and watch which policy wins.</p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="cs-kind" className="block text-sm font-medium">
              Traffic
            </label>
            <select id="cs-kind" value={kind} onChange={(e) => setKind(e.target.value as TraceKind)} className="mt-1 min-h-11 w-full rounded-md border border-border bg-bg px-2">
              {KINDS.map((k) => (
                <option key={k} value={k}>
                  {TRACE_LABEL[k]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="cs-size" className="flex justify-between text-sm font-medium">
              <span>Cache size (keys)</span>
              <span className="font-mono">
                {size} ({((size / UNIVERSE) * 100).toFixed(0)}% of keys)
              </span>
            </label>
            <input id="cs-size" type="range" min={5} max={400} step={5} value={size} onChange={(e) => setSize(Number(e.target.value))} className="mt-1 h-11 w-full" />
          </div>
        </div>
        <ul className="mt-3 space-y-2" aria-live="polite">
          {([...POLICIES, "opt"] as const).map((p) => (
            <li key={p} className="text-sm">
              <div className="flex justify-between">
                <span>{POLICY_LABEL[p]}</span>
                <span className="font-mono">{(compare[p] * 100).toFixed(1)}% hits</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded bg-muted">
                <div className={cn("h-full", p === "opt" ? "bg-muted-fg" : "bg-accent")} style={{ width: `${compare[p] * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted-fg">
          The optimal policy sees the future, so no real cache can match it. It shows how much room is left. Compare traffic with a loop slightly larger than the cache: LRU and FIFO collapse to zero hits.
        </p>
      </section>
    </div>
  );
}
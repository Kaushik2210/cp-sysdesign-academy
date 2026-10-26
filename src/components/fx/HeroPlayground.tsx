"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play, Shuffle } from "lucide-react";
import { bubbleSortSteps } from "@/visualizers/algorithms";
import { insertionSortSteps, mergeSortSteps, quickSortSteps, type SortFrame } from "@/visualizers/sorting";
import { cn } from "@/lib/utils";

type Tone = "accent" | "good" | "bad" | "muted";
interface Frame {
  arr: number[];
  tones: Record<number, Tone>;
  note: string;
}

const ALGOS = {
  bubble: "Bubble",
  insertion: "Insertion",
  merge: "Merge",
  quick: "Quick",
} as const;
type AlgoKey = keyof typeof ALGOS;

const COUNT = 16;
const TONE_CLASS: Record<Tone | "idle", string> = {
  idle: "bg-gradient-to-t from-accent/70 to-cool/80",
  accent: "bg-gradient-to-t from-sun to-hot",
  good: "bg-gradient-to-t from-leaf/80 to-leaf",
  bad: "bg-hot",
  muted: "bg-muted-fg/40",
};

/** A permutation of COUNT spread-out values. A fixed seed keeps the first render identical on server and client. */
function shuffled(seed?: number): number[] {
  let x = seed ?? Math.floor(Math.random() * 2 ** 31);
  const rnd = () => ((x = (x * 1664525 + 1013904223) >>> 0) / 2 ** 32);
  const a = Array.from({ length: COUNT }, (_, i) => 6 + Math.round((i * 94) / (COUNT - 1)));
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Normalises the different sort-state shapes into bars plus a tone per bar. */
function frames(algo: AlgoKey, values: number[]): Frame[] {
  const input = values.join(" ");
  if (algo === "bubble") {
    return bubbleSortSteps(input).map((s) => {
      const tones: Record<number, Tone> = {};
      for (let k = s.state.sortedFrom; k < s.state.arr.length; k++) tones[k] = "good";
      if (s.state.i !== null) tones[s.state.i] = "accent";
      if (s.state.j !== null) tones[s.state.j] = "accent";
      return { arr: s.state.arr, tones, note: s.note };
    });
  }
  const run = { insertion: insertionSortSteps, merge: mergeSortSteps, quick: quickSortSteps }[algo];
  return run(input).map((s) => {
    const st: SortFrame = s.state;
    const tones: Record<number, Tone> = {};
    for (const [k, m] of Object.entries(st.marks)) if (m.tone) tones[Number(k)] = m.tone;
    return { arr: st.arr, tones, note: s.note };
  });
}

/** A live, clickable sorting toy for the landing page: pick an algorithm, shuffle, scrub, pause. */
export function HeroPlayground() {
  const [algo, setAlgo] = useState<AlgoKey>("quick");
  const [values, setValues] = useState(() => shuffled(7));
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const reduced = useRef(true);

  const all = useMemo(() => frames(algo, values), [algo, values]);
  const frame = all[Math.min(idx, all.length - 1)];

  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduced.current) setPlaying(true);
  }, []);

  useEffect(() => {
    if (!playing) return;
    if (idx >= all.length - 1) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setIdx((i) => i + 1), 140);
    return () => clearTimeout(t);
  }, [playing, idx, all.length]);

  const restartWith = (nextAlgo: AlgoKey, nextValues: number[]) => {
    setAlgo(nextAlgo);
    setValues(nextValues);
    setIdx(0);
    setPlaying(!reduced.current);
  };
  const done = idx >= all.length - 1;

  return (
    <section
      aria-label="Sorting playground"
      className="relative rounded-3xl border border-border bg-card/70 p-4 shadow-2xl ring-glow backdrop-blur-md sm:p-5"
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="mr-auto text-xs font-semibold uppercase tracking-widest text-muted-fg">Live demo · try it</span>
        {(Object.keys(ALGOS) as AlgoKey[]).map((k) => (
          <button
            key={k}
            type="button"
            aria-pressed={algo === k}
            onClick={() => restartWith(k, values)}
            className={cn(
              "min-h-11 rounded-full border px-3 text-sm font-medium transition hover:-translate-y-0.5",
              algo === k ? "border-transparent bg-gradient-brand text-white shadow-lg" : "border-border hover:bg-muted",
            )}
          >
            {ALGOS[k]}
          </button>
        ))}
      </div>

      <div role="img" aria-label={`Bars showing the array ${frame.arr.join(", ")}`} className="flex h-44 items-end gap-1 rounded-2xl bg-bg/60 p-3 sm:h-56">
        {frame.arr.map((v, i) => (
          <div
            key={i}
            data-testid="bar"
            data-value={v}
            style={{ height: `${v}%` }}
            className={cn("flex-1 rounded-t-md transition-[height] duration-150 motion-reduce:transition-none", TONE_CLASS[frame.tones[i] ?? "idle"])}
          />
        ))}
      </div>

      <p aria-live="polite" className="mt-3 min-h-10 text-sm text-muted-fg">
        {done ? <span className="font-semibold text-leaf">Sorted. </span> : null}
        {frame.note}
      </p>

      <div className="mt-2 flex flex-wrap items-center gap-3">
        <button
          type="button"
          aria-label={playing ? "Pause" : done ? "Replay" : "Play"}
          onClick={() => {
            if (done) {
              setIdx(0);
              setPlaying(true);
            } else setPlaying((p) => !p);
          }}
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full bg-gradient-brand text-white shadow-lg transition hover:scale-105"
        >
          {playing ? <Pause size={18} aria-hidden /> : <Play size={18} aria-hidden />}
        </button>
        <button
          type="button"
          onClick={() => restartWith(algo, shuffled())}
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-4 text-sm font-medium transition hover:-translate-y-0.5 hover:bg-muted"
        >
          <Shuffle size={16} aria-hidden /> Shuffle
        </button>
        <label className="flex min-w-40 flex-1 items-center gap-2 text-xs text-muted-fg">
          Step
          <input
            type="range"
            aria-label="Scrub steps"
            min={0}
            max={all.length - 1}
            value={Math.min(idx, all.length - 1)}
            onChange={(e) => {
              setPlaying(false);
              setIdx(Number(e.target.value));
            }}
            className="h-11 flex-1 accent-[hsl(var(--hot))]"
          />
        </label>
      </div>
    </section>
  );
}

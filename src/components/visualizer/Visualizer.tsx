"use client";

import { useEffect, useMemo, useState, type KeyboardEvent } from "react";
import { ChevronsLeft, Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { VISUALIZERS, type VisualizerName } from "@/visualizers/registry";
import type { Step, VisualizerDef } from "@/visualizers/types";
import { cn } from "@/lib/utils";

/** Step-by-step player: play/pause/step/scrub/speed, state panel, highlighted pseudocode and keyboard shortcuts. */
export function Visualizer({ name, input }: { name: VisualizerName; input?: string }) {
  // The registry holds heterogeneous state types; the player only passes a step's own state back to its Render.
  const def = VISUALIZERS[name] as unknown as VisualizerDef<unknown>;
  const [text, setText] = useState(input ?? def.defaultInput);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const { steps, error } = useMemo((): { steps: Step<unknown>[]; error?: string } => {
    try {
      return { steps: def.generate(text) };
    } catch (e) {
      return { steps: [], error: e instanceof Error ? e.message : String(e) };
    }
  }, [def, text]);

  useEffect(() => setIdx(0), [steps]);

  useEffect(() => {
    if (!playing) return;
    if (idx >= steps.length - 1) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setIdx((i) => i + 1), 900 / speed);
    return () => clearTimeout(t);
  }, [playing, idx, steps.length, speed]);

  const step = steps[idx];
  const last = steps.length - 1;
  const btn =
    "inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-border bg-bg/60 transition hover:-translate-y-0.5 hover:bg-muted disabled:opacity-40 disabled:hover:translate-y-0";

  const togglePlay = () => {
    if (idx >= last) setIdx(0);
    setPlaying((p) => !p);
  };

  /** Space plays or pauses, the arrow keys step. Ignored while typing or when a control already handles the key. */
  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    const el = e.target as HTMLElement;
    if (el.closest("textarea, input, select")) return;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      setIdx((i) => Math.min(last, i + 1));
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      setIdx((i) => Math.max(0, i - 1));
    } else if (e.key === " " && !el.closest("button")) {
      e.preventDefault();
      if (steps.length) togglePlay();
    }
  };

  return (
    <section
      aria-label={`${def.title} visualizer`}
      aria-keyshortcuts="Space ArrowLeft ArrowRight"
      tabIndex={0}
      onKeyDown={onKeyDown}
      className={cn(
        "not-prose my-6 rounded-2xl border bg-card/80 p-4 shadow-lg backdrop-blur-sm transition-shadow sm:p-5",
        playing ? "border-hot ring-glow" : "border-border",
      )}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-bold tracking-tight">{def.title}</h3>
        <span className="hidden text-xs text-muted-fg sm:inline">
          <kbd className="rounded border border-border bg-muted px-1.5 font-mono">Space</kbd> play/pause ·{" "}
          <kbd className="rounded border border-border bg-muted px-1.5 font-mono">←</kbd>
          <kbd className="ml-0.5 rounded border border-border bg-muted px-1.5 font-mono">→</kbd> step
        </span>
      </div>
      <label className="block text-xs text-muted-fg">
        Input — {def.inputHelp}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={2}
          className="mt-1 w-full rounded-lg border border-border bg-bg p-2 font-mono text-sm text-fg"
        />
      </label>
      {error && (
        <p role="alert" className="mt-2 text-sm font-medium text-red-500">
          {error}
        </p>
      )}
      {step && (
        <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_16rem]">
          <div className="min-w-0">
            <div className="min-h-24 overflow-x-auto">
              <def.Render state={step.state} />
            </div>
            <p aria-live="polite" className="mt-2 text-sm">
              <span className="font-semibold text-hot">
                Step {idx + 1}/{steps.length}:
              </span>{" "}
              {step.note}
            </p>
          </div>
          <pre aria-label="Pseudocode" className="overflow-auto rounded-lg border border-border bg-bg p-2 font-mono text-xs">
            {def.pseudocode.map((l, i) => (
              <div
                key={i}
                className={cn("whitespace-pre rounded px-1 transition-colors", i === step.line && "bg-gradient-to-r from-accent/30 to-hot/20 font-bold")}
                aria-current={i === step.line ? "step" : undefined}
              >
                {l}
              </div>
            ))}
          </pre>
        </div>
      )}
      {steps.length > 0 && (
        <label className="mt-4 flex items-center gap-3 text-xs text-muted-fg">
          Scrub
          <input
            type="range"
            min={0}
            max={last}
            value={Math.min(idx, last)}
            onChange={(e) => {
              setPlaying(false);
              setIdx(Number(e.target.value));
            }}
            aria-label="Scrub through steps"
            aria-valuetext={`Step ${idx + 1} of ${steps.length}`}
            className="h-11 flex-1 accent-[hsl(var(--hot))]"
          />
        </label>
      )}
      <div className="mt-1 flex flex-wrap items-center gap-2">
        <button type="button" aria-label="Restart" className={btn} onClick={() => { setIdx(0); setPlaying(false); }}>
          <ChevronsLeft size={16} />
        </button>
        <button type="button" aria-label="Step back" className={btn} disabled={idx === 0} onClick={() => setIdx((i) => Math.max(0, i - 1))}>
          <SkipBack size={16} />
        </button>
        <button
          type="button"
          aria-label={playing ? "Pause" : "Play"}
          className={cn(btn, "border-transparent bg-gradient-brand text-white shadow-md")}
          disabled={!steps.length}
          onClick={togglePlay}
        >
          {playing ? <Pause size={16} /> : <Play size={16} />}
        </button>
        <button type="button" aria-label="Step forward" className={btn} disabled={idx >= last} onClick={() => setIdx((i) => i + 1)}>
          <SkipForward size={16} />
        </button>
        <label className="ml-2 flex items-center gap-2 text-xs text-muted-fg">
          Speed
          <input type="range" min={0.5} max={4} step={0.5} value={speed} onChange={(e) => setSpeed(Number(e.target.value))} aria-label="Speed" className="h-11 accent-[hsl(var(--cool))]" />
          {speed}x
        </label>
      </div>
    </section>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronsLeft, Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { VISUALIZERS, type VisualizerName } from "@/visualizers/registry";
import type { Step, VisualizerDef } from "@/visualizers/types";
import { cn } from "@/lib/utils";

/** Step-by-step player: play/pause/step/speed, state panel, and highlighted pseudocode. */
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
  const btn = "rounded border border-border p-2 hover:bg-muted disabled:opacity-40";

  return (
    <section aria-label={`${def.title} visualizer`} className="not-prose my-6 rounded-xl border border-border bg-card p-4">
      <h3 className="mb-3 font-semibold">{def.title}</h3>
      <label className="block text-xs text-muted-fg">
        Input — {def.inputHelp}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={2}
          className="mt-1 w-full rounded border border-border bg-bg p-2 font-mono text-sm text-fg"
        />
      </label>
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-500">
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
              <span className="text-muted-fg">
                Step {idx + 1}/{steps.length}:
              </span>{" "}
              {step.note}
            </p>
          </div>
          <pre aria-label="Pseudocode" className="overflow-auto rounded border border-border bg-bg p-2 font-mono text-xs">
            {def.pseudocode.map((l, i) => (
              <div key={i} className={cn("whitespace-pre px-1", i === step.line && "bg-accent/20 font-bold")} aria-current={i === step.line ? "step" : undefined}>
                {l}
              </div>
            ))}
          </pre>
        </div>
      )}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button type="button" aria-label="Restart" className={btn} onClick={() => { setIdx(0); setPlaying(false); }}>
          <ChevronsLeft size={16} />
        </button>
        <button type="button" aria-label="Step back" className={btn} disabled={idx === 0} onClick={() => setIdx((i) => Math.max(0, i - 1))}>
          <SkipBack size={16} />
        </button>
        <button
          type="button"
          aria-label={playing ? "Pause" : "Play"}
          className={btn}
          disabled={!steps.length}
          onClick={() => {
            if (idx >= steps.length - 1) setIdx(0);
            setPlaying((p) => !p);
          }}
        >
          {playing ? <Pause size={16} /> : <Play size={16} />}
        </button>
        <button type="button" aria-label="Step forward" className={btn} disabled={idx >= steps.length - 1} onClick={() => setIdx((i) => i + 1)}>
          <SkipForward size={16} />
        </button>
        <label className="ml-2 flex items-center gap-2 text-xs text-muted-fg">
          Speed
          <input type="range" min={0.5} max={4} step={0.5} value={speed} onChange={(e) => setSpeed(Number(e.target.value))} aria-label="Speed" />
          {speed}x
        </label>
      </div>
    </section>
  );
}

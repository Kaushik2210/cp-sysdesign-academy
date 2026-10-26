"use client";

import { useMemo, useState } from "react";
import { Minus, Plus, RotateCcw } from "lucide-react";
import { HashRing, RING_SIZE, assignKeys, loadStats, makeKeys, modLookup, movedFraction } from "@/lib/sim/ring";
import { hash32 } from "@/lib/sim/rng";
import { cn } from "@/lib/utils";

const COLORS = ["#6366f1", "#ef4444", "#10b981", "#f59e0b", "#06b6d4", "#d946ef", "#84cc16", "#f97316", "#3b82f6", "#14b8a6", "#e11d48", "#8b5cf6"];
const MAX_NODES = 12;
const KEY_CHOICES = [1000, 5000, 10000];
const SAMPLE = 240; // keys drawn on the ring
const INITIAL = [0, 1, 2, 3];

const nameOf = (i: number) => `Node ${"ABCDEFGHIJKL"[i]}`;
const colorOf = (i: number) => COLORS[i % COLORS.length];
const indexOfName = (n: string) => "ABCDEFGHIJKL".indexOf(n.slice(-1));

function build(names: string[], vnodes: number, keys: string[]) {
  const ring = new HashRing(vnodes);
  names.forEach((n) => ring.addNode(n));
  return { ring, assign: assignKeys(keys, (k) => ring.lookup(k)) };
}

interface Change {
  text: string;
  moved: number;
  ideal: number;
  modMoved: number;
  movedKeys: Set<string>;
}

const angle = (pos: number) => (pos / RING_SIZE) * Math.PI * 2 - Math.PI / 2;
const at = (r: number, pos: number) => ({ x: 150 + r * Math.cos(angle(pos)), y: 150 + r * Math.sin(angle(pos)) });

/** Interactive consistent-hashing ring: add and remove nodes and watch which keys move. */
export function RingSandbox() {
  const [indexes, setIndexes] = useState<number[]>(INITIAL);
  const [vnodes, setVnodes] = useState(50);
  const [keyCount, setKeyCount] = useState(5000);
  const [change, setChange] = useState<Change | null>(null);

  const names = useMemo(() => indexes.map(nameOf), [indexes]);
  const keys = useMemo(() => makeKeys(keyCount), [keyCount]);
  const { ring, assign } = useMemo(() => build(names, vnodes, keys), [names, vnodes, keys]);
  const stats = useMemo(() => loadStats(assign, names), [assign, names]);
  const sampleKeys = useMemo(() => keys.slice(0, SAMPLE), [keys]);

  const ownerColor = (node: string | null | undefined) => (node ? colorOf(indexOfName(node)) : "#888");

  /** Apply a membership change and record how many keys moved, for the ring and for hash mod N. */
  const apply = (next: number[], verb: string, node: string, ideal: number) => {
    const nextNames = next.map(nameOf);
    const { assign: after } = build(nextNames, vnodes, keys);
    const modMoved = movedFraction(assignKeys(keys, modLookup(names)), assignKeys(keys, modLookup(nextNames)));
    const movedKeys = new Set<string>();
    for (const [k, owner] of assign) if (after.get(k) !== owner) movedKeys.add(k);
    setChange({ text: `${verb} ${node}`, moved: movedFraction(assign, after), ideal, modMoved, movedKeys });
    setIndexes(next);
  };

  const add = () => {
    const idx = [...Array(MAX_NODES).keys()].find((i) => !indexes.includes(i));
    if (idx === undefined) return;
    apply([...indexes, idx].sort((a, b) => a - b), "Added", nameOf(idx), 1 / (indexes.length + 1));
  };
  const remove = (idx: number) => {
    if (indexes.length <= 1) return;
    apply(indexes.filter((i) => i !== idx), "Removed", nameOf(idx), 1 / indexes.length);
  };
  const reset = () => {
    setIndexes(INITIAL);
    setVnodes(50);
    setKeyCount(5000);
    setChange(null);
  };

  const btn = "inline-flex min-h-11 items-center gap-1.5 rounded-md border border-border px-3 text-sm hover:bg-muted disabled:opacity-50";

  return (
    <div className="mt-6 grid gap-6 md:grid-cols-[minmax(0,20rem)_1fr]">
      <div>
        <svg
          viewBox="0 0 300 300"
          role="img"
          aria-label={`Hash ring with ${names.length} nodes and ${ring.points.length} virtual nodes. Colour shows which node owns each sampled key.`}
          className="w-full max-w-sm rounded-xl border border-border bg-card"
        >
          <circle cx="150" cy="150" r="110" fill="none" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2" />
          {ring.points.map((p, i) => {
            const { x, y } = at(110, p.pos);
            return <circle key={i} cx={x} cy={y} r={ring.points.length > 400 ? 1.2 : 2.5} fill={ownerColor(p.node)} />;
          })}
          {sampleKeys.map((k) => {
            const { x, y } = at(128, hash32(k));
            const moved = change?.movedKeys.has(k);
            return <circle key={k} cx={x} cy={y} r={moved ? 3.6 : 1.8} fill={ownerColor(assign.get(k))} stroke={moved ? "currentColor" : "none"} strokeWidth={moved ? 1.2 : 0} />;
          })}
          <text x="150" y="146" textAnchor="middle" className="fill-current text-[11px]">
            {names.length} nodes
          </text>
          <text x="150" y="162" textAnchor="middle" className="fill-current text-[9px] opacity-70">
            {ring.points.length} points
          </text>
        </svg>
        <p className="mt-2 text-xs text-muted-fg">Inner dots are virtual nodes; outer dots are keys coloured by owner. Keys with an outline just changed owner.</p>
      </div>

      <div className="space-y-5">
        <section aria-labelledby="rs-controls" className="rounded-xl border border-border bg-card p-4">
          <h2 id="rs-controls" className="font-semibold">
            Controls
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" className={btn} onClick={add} disabled={indexes.length >= MAX_NODES}>
              <Plus size={14} aria-hidden /> Add a node
            </button>
            <button type="button" className={btn} onClick={reset}>
              <RotateCcw size={14} aria-hidden /> Reset
            </button>
          </div>
          <ul className="mt-3 flex flex-wrap gap-2" aria-label="Nodes">
            {indexes.map((i) => (
              <li key={i} className="flex items-center gap-1 rounded-full border border-border py-0.5 pl-3 pr-1 text-sm">
                <span aria-hidden className="inline-block h-3 w-3 rounded-full" style={{ background: colorOf(i) }} />
                {nameOf(i)}
                <button type="button" onClick={() => remove(i)} disabled={indexes.length <= 1} aria-label={`Remove ${nameOf(i)}`} className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted disabled:opacity-40">
                  <Minus size={14} aria-hidden />
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-4">
            <label htmlFor="rs-vnodes" className="flex justify-between text-sm font-medium">
              <span>Virtual nodes per node</span>
              <span className="font-mono">{vnodes}</span>
            </label>
            <input
              id="rs-vnodes"
              type="range"
              min={1}
              max={256}
              value={vnodes}
              onChange={(e) => {
                setVnodes(Number(e.target.value));
                setChange(null);
              }}
              className="mt-1 h-11 w-full"
            />
            <p className="flex justify-between text-xs text-muted-fg">
              <span>1 (uneven)</span>
              <span>256 (even)</span>
            </p>
          </div>

          <fieldset className="mt-3">
            <legend className="text-sm font-medium">Number of keys</legend>
            <div className="mt-1 flex gap-2">
              {KEY_CHOICES.map((k) => (
                <label key={k} className={cn(btn, "cursor-pointer", keyCount === k && "border-accent text-accent")}>
                  <input
                    type="radio"
                    name="rs-keys"
                    className="sr-only"
                    checked={keyCount === k}
                    onChange={() => {
                      setKeyCount(k);
                      setChange(null);
                    }}
                  />
                  {k.toLocaleString("en-US")}
                </label>
              ))}
            </div>
          </fieldset>
        </section>

        <section aria-labelledby="rs-change" className="rounded-xl border border-border bg-card p-4">
          <h2 id="rs-change" className="font-semibold">
            What the last change cost
          </h2>
          <div aria-live="polite" className="mt-2 text-sm">
            {change ? (
              <>
                <p>
                  <b>{change.text}.</b> The ring moved <b>{(change.moved * 100).toFixed(1)}%</b> of keys (ideal about {(change.ideal * 100).toFixed(1)}%).
                </p>
                <p className="mt-1">
                  Plain <code>hash(key) mod N</code> would have moved <b>{(change.modMoved * 100).toFixed(1)}%</b>.
                </p>
              </>
            ) : (
              <p className="text-muted-fg">Add or remove a node to see how many keys move.</p>
            )}
          </div>
        </section>

        <section aria-labelledby="rs-load" className="rounded-xl border border-border bg-card p-4">
          <h2 id="rs-load" className="font-semibold">
            Load per node
          </h2>
          <p className="mt-1 text-sm text-muted-fg">
            Busiest node is {stats.maxOverMean.toFixed(2)}x the average (1.00 is perfectly even); spread {stats.stdDevPercent.toFixed(1)}%.
          </p>
          <ul className="mt-2 space-y-1">
            {indexes.map((i) => (
              <li key={i} className="text-sm">
                <div className="flex justify-between">
                  <span>{nameOf(i)}</span>
                  <span className="font-mono text-muted-fg">{stats.counts[nameOf(i)]?.toLocaleString("en-US")} keys</span>
                </div>
                <div className="h-2 overflow-hidden rounded bg-muted">
                  <div className="h-full" style={{ width: `${stats.max ? (stats.counts[nameOf(i)] / stats.max) * 100 : 0}%`, background: colorOf(i) }} />
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { useTheme } from "next-themes";
import { Background, Controls, MarkerType, ReactFlow, addEdge, useEdgesState, useNodesState, type Connection, type Edge, type Node } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Minus, Plus, Trash2 } from "lucide-react";
import { EXAMPLES, KINDS, analyze, type Graph, type Kind, type Severity } from "@/lib/sim/design";
import { cn } from "@/lib/utils";

type NodeData = { kind: Kind; replicas: number; label: string };
type CanvasNode = Node<NodeData>;

const POSITIONS: Record<string, { x: number; y: number }> = {
  client: { x: 10, y: 150 }, cdn: { x: 190, y: 30 }, storage: { x: 370, y: 30 }, limiter: { x: 190, y: 200 }, lb: { x: 370, y: 200 },
  app: { x: 550, y: 200 }, cache: { x: 730, y: 100 }, db: { x: 730, y: 260 }, replica: { x: 910, y: 260 }, queue: { x: 550, y: 360 },
  worker: { x: 730, y: 410 }, monitor: { x: 910, y: 100 },
};

const SEVERITY: Record<Severity, { label: string; style: string }> = {
  high: { label: "High", style: "border-red-500/60 text-red-600 dark:text-red-400" },
  medium: { label: "Medium", style: "border-amber-500/60 text-amber-600 dark:text-amber-400" },
  low: { label: "Low", style: "border-border text-muted-fg" },
  info: { label: "Tip", style: "border-blue-500/50 text-blue-600 dark:text-blue-400" },
};

const labelOf = (kind: Kind, replicas: number) => `${KINDS[kind].label}${replicas > 1 ? ` x${replicas}` : ""}`;

const toNodes = (g: Graph): CanvasNode[] =>
  g.nodes.map((n, i) => ({
    id: n.id,
    position: POSITIONS[n.id] ?? { x: 40 + (i % 4) * 180, y: 40 + Math.floor(i / 4) * 100 },
    data: { kind: n.kind, replicas: n.replicas, label: labelOf(n.kind, n.replicas) },
  }));
const toEdges = (g: Graph): Edge[] => g.edges.map((e) => ({ id: `${e.from}->${e.to}`, source: e.from, target: e.to, markerEnd: { type: MarkerType.ArrowClosed } }));

const btn = "inline-flex min-h-11 items-center gap-1.5 rounded-md border border-border px-3 text-sm hover:bg-muted disabled:opacity-50";

/** Drag components onto a canvas, connect them, and get automated review feedback. */
export default function DesignCanvas() {
  const { resolvedTheme } = useTheme();
  const [nodes, setNodes, onNodesChange] = useNodesState<CanvasNode>(toNodes(EXAMPLES.naive));
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(toEdges(EXAMPLES.naive));
  const [selected, setSelected] = useState<string | null>(null);
  const [highlight, setHighlight] = useState<string[]>([]);
  const [counter, setCounter] = useState(1);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const graph: Graph = useMemo(
    () => ({ nodes: nodes.map((n) => ({ id: n.id, kind: n.data.kind, replicas: n.data.replicas })), edges: edges.map((e) => ({ from: e.source, to: e.target })) }),
    [nodes, edges],
  );
  const analysis = useMemo(() => analyze(graph), [graph]);

  const shownNodes = useMemo(
    () => nodes.map((n) => ({ ...n, selected: n.id === selected, style: highlight.includes(n.id) ? { border: "3px solid #ef4444", borderRadius: 8, padding: 8 } : { borderRadius: 8, padding: 8 } })),
    [nodes, selected, highlight],
  );

  const load = (g: Graph) => {
    setNodes(toNodes(g));
    setEdges(toEdges(g));
    setSelected(null);
    setHighlight([]);
  };

  const add = (kind: Kind) => {
    const id = `${kind}-${counter}`;
    setCounter((c) => c + 1);
    const i = nodes.length;
    setNodes((ns) => [...ns, { id, position: { x: 40 + (i % 4) * 180, y: 40 + Math.floor(i / 4) * 100 }, data: { kind, replicas: 1, label: labelOf(kind, 1) } }]);
    setSelected(id);
  };

  const connect = useCallback(
    (c: Connection) => {
      if (!c.source || !c.target || c.source === c.target) return;
      setEdges((es) => (es.some((e) => e.source === c.source && e.target === c.target) ? es : addEdge({ ...c, markerEnd: { type: MarkerType.ArrowClosed } }, es)));
    },
    [setEdges],
  );

  const setReplicas = (id: string, delta: number) =>
    setNodes((ns) => ns.map((n) => (n.id === id ? { ...n, data: { ...n.data, replicas: Math.max(1, Math.min(5, n.data.replicas + delta)), label: labelOf(n.data.kind, Math.max(1, Math.min(5, n.data.replicas + delta))) } } : n)));
  const removeNode = (id: string) => {
    setNodes((ns) => ns.filter((n) => n.id !== id));
    setEdges((es) => es.filter((e) => e.source !== id && e.target !== id));
    setSelected(null);
    setHighlight((h) => h.filter((x) => x !== id));
  };
  const addConnection = () => {
    if (from && to) connect({ source: from, target: to, sourceHandle: null, targetHandle: null });
  };

  const sel = nodes.find((n) => n.id === selected);
  const nameOf = (id: string) => nodes.find((n) => n.id === id)?.data.label ?? id;

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_22rem]">
      <div className="space-y-4">
        <section aria-labelledby="dc-palette" className="rounded-xl border border-border bg-card p-3">
          <h2 id="dc-palette" className="text-sm font-semibold">
            Add components
          </h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {(Object.keys(KINDS) as Kind[]).map((k) => (
              <button key={k} type="button" className={btn} onClick={() => add(k)} title={KINDS[k].role}>
                <Plus size={12} aria-hidden /> {KINDS[k].label}
              </button>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
            <span className="self-center text-sm text-muted-fg">Start from:</span>
            <button type="button" className={btn} onClick={() => load(EXAMPLES.naive)}>
              A naive design
            </button>
            <button type="button" className={btn} onClick={() => load(EXAMPLES.robust)}>
              A robust design
            </button>
            <button type="button" className={btn} onClick={() => load({ nodes: [], edges: [] })}>
              Empty canvas
            </button>
          </div>
        </section>

        <div className="h-[28rem] overflow-hidden rounded-xl border border-border" data-testid="canvas">
          <ReactFlow
            nodes={shownNodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={connect}
            onNodeClick={(_, n) => setSelected(n.id)}
            onPaneClick={() => setSelected(null)}
            fitView
            colorMode={resolvedTheme === "light" ? "light" : "dark"}
            aria-label="System design canvas. Drag components, connect them by dragging from one to another, press Backspace to delete the selection."
          >
            <Background />
            <Controls showInteractive={false} />
          </ReactFlow>
        </div>

        <section aria-labelledby="dc-manage" className="rounded-xl border border-border bg-card p-4">
          <h2 id="dc-manage" className="font-semibold">
            Components and connections
          </h2>
          <p className="mt-1 text-xs text-muted-fg">This list does everything the canvas does, without dragging, so it works with a keyboard or screen reader.</p>

          {sel && (
            <div className="mt-3 rounded-lg border border-accent/60 p-3" aria-live="polite">
              <p className="text-sm font-medium">
                Selected: {sel.data.label} <span className="font-normal text-muted-fg">({KINDS[sel.data.kind].role})</span>
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="text-sm">Instances: {sel.data.replicas}</span>
                <button type="button" className={btn} onClick={() => setReplicas(sel.id, -1)} disabled={sel.data.replicas <= 1} aria-label="Fewer instances">
                  <Minus size={14} aria-hidden />
                </button>
                <button type="button" className={btn} onClick={() => setReplicas(sel.id, 1)} disabled={sel.data.replicas >= 5} aria-label="More instances">
                  <Plus size={14} aria-hidden />
                </button>
                <button type="button" className={btn} onClick={() => removeNode(sel.id)}>
                  <Trash2 size={14} aria-hidden /> Remove
                </button>
              </div>
            </div>
          )}

          <ul className="mt-3 flex flex-wrap gap-2" aria-label="Components">
            {nodes.map((n) => (
              <li key={n.id}>
                <button type="button" aria-pressed={selected === n.id} onClick={() => setSelected(n.id)} className={cn(btn, selected === n.id && "border-accent text-accent")}>
                  {n.data.label}
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex flex-wrap items-end gap-2">
            <div>
              <label htmlFor="dc-from" className="block text-xs font-medium">
                From
              </label>
              <select id="dc-from" value={from} onChange={(e) => setFrom(e.target.value)} className="min-h-11 rounded-md border border-border bg-bg px-2">
                <option value="">Choose</option>
                {nodes.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.data.label} ({n.id})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="dc-to" className="block text-xs font-medium">
                To
              </label>
              <select id="dc-to" value={to} onChange={(e) => setTo(e.target.value)} className="min-h-11 rounded-md border border-border bg-bg px-2">
                <option value="">Choose</option>
                {nodes.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.data.label} ({n.id})
                  </option>
                ))}
              </select>
            </div>
            <button type="button" className={btn} onClick={addConnection} disabled={!from || !to || from === to}>
              Add connection
            </button>
          </div>
          <ul className="mt-3 space-y-1 text-sm" aria-label="Connections">
            {edges.map((e) => (
              <li key={e.id} className="flex items-center gap-2">
                <span>
                  {nameOf(e.source)} to {nameOf(e.target)}
                </span>
                <button type="button" className="inline-flex h-9 w-9 items-center justify-center rounded hover:bg-muted" aria-label={`Remove connection from ${nameOf(e.source)} to ${nameOf(e.target)}`} onClick={() => setEdges((es) => es.filter((x) => x.id !== e.id))}>
                  <Trash2 size={14} aria-hidden />
                </button>
              </li>
            ))}
            {edges.length === 0 && <li className="text-muted-fg">No connections yet.</li>}
          </ul>
        </section>
      </div>

      <aside aria-labelledby="dc-review" className="space-y-4">
        <section className="rounded-xl border border-border bg-card p-4">
          <h2 id="dc-review" className="font-semibold">
            Design review
          </h2>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-4xl font-bold tabular-nums" data-testid="score">
              {analysis.score}
            </span>
            <span className="text-sm text-muted-fg">/ 100</span>
          </div>
          <div role="progressbar" aria-label="Design score" aria-valuenow={analysis.score} aria-valuemin={0} aria-valuemax={100} className="mt-1 h-2 overflow-hidden rounded bg-muted">
            <div className="h-full bg-accent" style={{ width: `${analysis.score}%` }} />
          </div>
          <p className="mt-2 text-xs text-muted-fg">An automated checklist of common problems, not a verdict. A real review also weighs your requirements and scale.</p>
        </section>

        {analysis.strengths.length > 0 && (
          <section className="rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-semibold">What is working</h3>
            <ul className="mt-1 list-disc pl-5 text-sm">
              {analysis.strengths.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </section>
        )}

        <section aria-labelledby="dc-findings" className="rounded-xl border border-border bg-card p-4">
          <h3 id="dc-findings" className="text-sm font-semibold">
            Findings ({analysis.findings.filter((f) => f.severity !== "info").length} issues)
          </h3>
          <ul className="mt-2 space-y-3" aria-live="polite">
            {analysis.findings.map((f) => (
              <li key={f.id} className="rounded-lg border border-border p-3 text-sm">
                <p className="flex flex-wrap items-center gap-2 font-medium">
                  <span className={cn("rounded-full border px-2 py-0.5 text-xs", SEVERITY[f.severity].style)}>{SEVERITY[f.severity].label}</span>
                  {f.title}
                </p>
                <p className="mt-1 text-muted-fg">{f.why}</p>
                <p className="mt-1">
                  <b>Fix:</b> {f.fix}
                </p>
                <div className="mt-1 flex flex-wrap gap-3">
                  {f.nodes.length > 0 && (
                    <button type="button" className="min-h-11 text-accent underline" onClick={() => setHighlight((h) => (f.nodes.every((n) => h.includes(n)) ? [] : f.nodes))}>
                      {f.nodes.every((n) => highlight.includes(n)) ? "Hide on canvas" : "Show on canvas"}
                    </button>
                  )}
                  {f.lesson && (
                    <Link href={`/${f.lesson}/`} className="inline-flex min-h-11 items-center text-accent underline">
                      Read the lesson
                    </Link>
                  )}
                </div>
              </li>
            ))}
            {analysis.findings.length === 0 && <li className="text-sm text-emerald-600 dark:text-emerald-400">No issues found by this checklist.</li>}
          </ul>
        </section>
      </aside>
    </div>
  );
}
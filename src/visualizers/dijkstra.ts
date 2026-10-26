import type { Step } from "./types";

export interface GraphEdge {
  u: number;
  v: number;
  w: number;
}

export interface DijkstraFrame {
  nodes: string[];
  edges: GraphEdge[];
  source: number;
  /** Best known distance from the source; null means not reached yet. */
  dist: (number | null)[];
  /** Nodes whose distance is final (popped and not stale). */
  done: boolean[];
  current: number | null;
  /** The edge being relaxed right now, and whether it improved the distance. */
  relaxing: { edge: number; improved: boolean } | null;
  /** Edge index that currently gives each node its best distance (the shortest-path tree so far). */
  treeEdge: (number | null)[];
  /** Heap contents as [distance, node], smallest first. May contain stale entries, as in a real lazy-deletion heap. */
  heap: [number, number][];
}

export const MAX_NODES = 8;
export const MAX_EDGES = 16;
export const DEFAULT_GRAPH = ["A", "A B 4", "A C 1", "C B 2", "B D 1", "C D 5", "D E 3", "C F 8", "E F 1"].join("\n");

export function parseGraph(input: string): { nodes: string[]; edges: GraphEdge[]; source: number } {
  const lines = input
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  if (lines.length < 2) throw new Error("Line 1 is the source node; each following line is an edge: u v weight.");
  const sourceName = lines[0];
  if (sourceName.split(/\s+/).length !== 1) throw new Error("Line 1 must be a single node name (the source).");
  const nodes: string[] = [];
  const id = (n: string) => {
    let i = nodes.indexOf(n);
    if (i < 0) {
      if (nodes.length >= MAX_NODES) throw new Error(`Use at most ${MAX_NODES} nodes.`);
      nodes.push(n);
      i = nodes.length - 1;
    }
    return i;
  };
  const edges: GraphEdge[] = [];
  const rest = lines.slice(1);
  if (rest.length > MAX_EDGES) throw new Error(`Use at most ${MAX_EDGES} edges.`);
  for (const line of rest) {
    const p = line.split(/\s+/);
    if (p.length !== 3) throw new Error(`Bad edge "${line}": write it as u v weight.`);
    if (!/^\d+$/.test(p[2])) throw new Error(`Weight "${p[2]}" must be a whole number 0 or more: Dijkstra needs non-negative weights.`);
    const w = Number(p[2]);
    if (w > 99) throw new Error("Keep weights at 99 or less.");
    if (p[0] === p[1]) throw new Error(`Self-loop "${line}" is not allowed.`);
    edges.push({ u: id(p[0]), v: id(p[1]), w });
  }
  const source = nodes.indexOf(sourceName);
  if (source < 0) throw new Error(`Source "${sourceName}" does not appear in any edge.`);
  return { nodes, edges, source };
}

export const DIJKSTRA_CODE = [
  "dist[all] = INF; dist[S] = 0; heap = [(0, S)]",
  "while heap is not empty:",
  "    (d, u) = heap.pop_min()",
  "    if d > dist[u]: continue      # stale entry",
  "    for each edge (u, v, w):",
  "        if d + w < dist[v]:",
  "            dist[v] = d + w; heap.push((dist[v], v))",
];

export function dijkstraSteps(input: string): Step<DijkstraFrame>[] {
  const { nodes, edges, source } = parseGraph(input);
  const n = nodes.length;
  const dist: (number | null)[] = Array(n).fill(null);
  const done: boolean[] = Array(n).fill(false);
  const treeEdge: (number | null)[] = Array(n).fill(null);
  const heap: [number, number][] = [];
  const steps: Step<DijkstraFrame>[] = [];
  const snap = (line: number, note: string, current: number | null, relaxing: DijkstraFrame["relaxing"] = null) =>
    steps.push({
      line,
      note,
      state: { nodes, edges, source, dist: [...dist], done: [...done], current, relaxing, treeEdge: [...treeEdge], heap: heap.map((h) => [h[0], h[1]] as [number, number]) },
    });
  const push = (d: number, v: number) => {
    heap.push([d, v]);
    heap.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  };

  dist[source] = 0;
  push(0, source);
  snap(0, `Every distance starts unknown except ${nodes[source]} = 0, which goes in the heap.`, null);

  while (heap.length > 0) {
    const [d, u] = heap.shift()!;
    snap(2, `Pop the smallest heap entry: ${nodes[u]} with distance ${d}.`, u);
    if (d > (dist[u] as number)) {
      snap(3, `${nodes[u]} already has a better distance (${dist[u]}), so this entry is stale: skip it.`, u);
      continue;
    }
    done[u] = true;
    snap(3, `${d} is the best distance to ${nodes[u]}; no unseen path can beat it because all weights are non-negative. It is final.`, u);
    edges.forEach((e, ei) => {
      if (e.u !== u && e.v !== u) return;
      const v = e.u === u ? e.v : e.u;
      if (done[v]) {
        snap(4, `${nodes[v]} is already final, nothing to improve along ${nodes[u]}-${nodes[v]}.`, u, { edge: ei, improved: false });
        return;
      }
      const cand = d + e.w;
      if (dist[v] === null || cand < dist[v]!) {
        const before = dist[v];
        dist[v] = cand;
        treeEdge[v] = ei;
        push(cand, v);
        snap(6, `${d} + ${e.w} = ${cand} ${before === null ? "reaches" : `beats ${before} for`} ${nodes[v]}: update it and push (${cand}, ${nodes[v]}).`, u, { edge: ei, improved: true });
      } else {
        snap(5, `${d} + ${e.w} = ${cand} does not beat ${nodes[v]}'s ${dist[v]}.`, u, { edge: ei, improved: false });
      }
    });
  }
  const unreached = nodes.filter((_, i) => dist[i] === null);
  snap(
    1,
    `Heap is empty. Final distances are shown${unreached.length ? `; ${unreached.join(", ")} cannot be reached from ${nodes[source]}` : ""}. Highlighted edges form the shortest-path tree.`,
    null,
  );
  return steps;
}

"use client";

import { ArrayView, type CellMark } from "./ArrayView";
import {
  BINARY_SEARCH_CODE,
  BUBBLE_SORT_CODE,
  binarySearchSteps,
  bubbleSortSteps,
  SLIDING_WINDOW_CODE,
  TWO_POINTERS_CODE,
  slidingWindowSteps,
  twoPointersSteps,
  type BSState,
  type TwoPtrState,
  type WindowState,
  type SortState,
} from "./algorithms";
import { INSERTION_SORT_CODE, MERGE_SORT_CODE, QUICK_SORT_CODE, insertionSortSteps, mergeSortSteps, quickSortSteps, type SortFrame } from "./sorting";
import { BFS_GRID_CODE, DEFAULT_GRID, DFS_GRID_CODE, bfsGridSteps, dfsGridSteps, type GridFrame } from "./grid";
import { DEFAULT_GRAPH, DIJKSTRA_CODE, dijkstraSteps, type DijkstraFrame } from "./dijkstra";
import { DEFAULT_DSU, DSU_CODE, dsuSteps, type DsuFrame } from "./dsu";
import type { VisualizerDef } from "./types";

function BinarySearchRender({ state: s }: { state: BSState }) {
  const marks: Record<number, CellMark> = {};
  s.arr.forEach((_, i) => {
    if (i < s.lo || i > s.hi) marks[i] = { tone: "muted" };
  });
  if (s.lo <= s.hi) {
    marks[s.lo] = { ...marks[s.lo], label: "lo", tone: "accent" };
    marks[s.hi] = { ...marks[s.hi], label: s.lo === s.hi ? "lo,hi" : "hi", tone: "accent" };
  }
  if (s.mid !== null) marks[s.mid] = { label: "mid", tone: s.found === s.mid ? "good" : "bad" };
  return (
    <div>
      <ArrayView values={s.arr} marks={marks} />
      <p className="text-sm">target = {s.target}</p>
    </div>
  );
}

function SortRender({ state: s }: { state: SortState }) {
  const marks: Record<number, CellMark> = {};
  for (let k = s.sortedFrom; k < s.arr.length; k++) marks[k] = { tone: "good" };
  if (s.i !== null && s.j !== null) {
    marks[s.i] = { label: "j", tone: "accent" };
    marks[s.j] = { label: "j+1", tone: "accent" };
  }
  return <ArrayView values={s.arr} marks={marks} />;
}


function TwoPointersRender({ state: s }: { state: TwoPtrState }) {
  const marks: Record<number, CellMark> = {};
  if (s.l < s.arr.length) marks[s.l] = { label: "l", tone: "accent" };
  if (s.r >= 0) marks[s.r] = { label: s.l === s.r ? "l,r" : "r", tone: "accent" };
  if (s.found) {
    marks[s.found[0]] = { label: "l", tone: "good" };
    marks[s.found[1]] = { label: "r", tone: "good" };
  }
  return (
    <div>
      <ArrayView values={s.arr} marks={marks} />
      <p className="text-sm">target sum = {s.target}</p>
    </div>
  );
}

function WindowRender({ state: s }: { state: WindowState }) {
  const marks: Record<number, CellMark> = {};
  s.arr.forEach((_, i) => {
    if (i >= s.start && i < s.start + s.k) marks[i] = { tone: "accent" };
  });
  if (s.bestStart !== null && s.bestStart !== s.start) {
    for (let i = s.bestStart; i < s.bestStart + s.k; i++) marks[i] = { tone: "good" };
  }
  return (
    <div>
      <ArrayView values={s.arr} marks={marks} />
      <p className="text-sm">
        window sum = {s.sum ?? "-"} · best = {s.best ?? "-"}
      </p>
    </div>
  );
}
/** Shared renderer for the comparison sorts: the array with marks, an optional lifted key, and merge buffers. */
function SortFrameRender({ state: s }: { state: SortFrame }) {
  return (
    <div>
      <ArrayView values={s.arr} marks={s.marks} />
      {s.held !== null && (
        <p className="text-sm">
          Holding key = <b className="font-mono">{s.held}</b>
        </p>
      )}
      {s.aux && (
        <div className="mt-1 space-y-1 text-xs" aria-label="Merge buffers">
          {([["left half", s.aux.left, s.aux.i], ["right half", s.aux.right, s.aux.j]] as const).map(([name, vals, pos]) => (
            <div key={name} className="flex items-center gap-1">
              <span className="w-16 text-muted-fg">{name}</span>
              {vals.map((v, k) => (
                <span
                  key={k}
                  className={`inline-flex h-7 min-w-7 items-center justify-center rounded border px-1 font-mono ${k < pos ? "border-border opacity-40" : k === pos ? "border-accent bg-accent/15" : "border-border"}`}
                >
                  {v}
                </span>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
/** Grid search renderer shared by BFS and DFS: cell colours show status, numbers show distance/depth, and the pending list is listed below. */
function GridRender({ state: s }: { state: GridFrame }) {
  const onPath = new Set(s.path.map((c) => c.join(",")));
  const cellClass = (r: number, c: number) => {
    const ch = s.map[r][c];
    if (ch === "#") return "border-border bg-fg/30";
    if (onPath.has(`${r},${c}`)) return "border-emerald-500 bg-emerald-500/40";
    if (s.current && s.current[0] === r && s.current[1] === c) return "border-accent bg-accent/50 ring-2 ring-accent";
    if (s.status[r][c] === "done") return "border-border bg-accent/20";
    if (s.status[r][c] === "frontier") return "border-accent bg-transparent";
    return "border-border bg-transparent";
  };
  const label = (r: number, c: number) => {
    const ch = s.map[r][c];
    const kind = ch === "#" ? "wall" : ch === "S" ? "start" : ch === "E" ? "end" : s.status[r][c];
    return `row ${r + 1}, column ${c + 1}, ${kind}${s.dist[r][c] !== null ? `, ${s.dist[r][c]}` : ""}`;
  };
  const word = s.frontierKind === "queue" ? "Queue (front first)" : "Stack (top first)";
  return (
    <div>
      <div role="grid" aria-label="Search grid" className="inline-grid gap-0.5" style={{ gridTemplateColumns: `repeat(${s.map[0].length}, 2rem)` }}>
        {s.map.map((row, r) =>
          Array.from(row, (ch, c) => (
            <div
              key={`${r}-${c}`}
              role="gridcell"
              aria-label={label(r, c)}
              className={`flex h-8 w-8 items-center justify-center rounded border font-mono text-[11px] ${cellClass(r, c)}`}
            >
              {ch === "S" || ch === "E" ? <b>{ch}</b> : s.dist[r][c] !== null && ch !== "#" ? s.dist[r][c] : ""}
            </div>
          )),
        )}
      </div>
      <p className="mt-2 text-xs text-muted-fg">
        Outlined = waiting, shaded = expanded, strong = current, green = route found. Numbers are {s.frontierKind === "queue" ? "distance from S" : "depth along the route"}.
      </p>
      <p className="mt-1 text-sm" aria-label="Pending cells">
        {word}:{" "}
        <span className="font-mono">{s.frontier.length ? s.frontier.map((c) => `(${c[0]},${c[1]})`).join(" ") : "empty"}</span>
      </p>
    </div>
  );
}

/** Weighted graph on a circle. Status is conveyed by fill, outline style and text, never by colour alone. */
function DijkstraRender({ state: s }: { state: DijkstraFrame }) {
  const W = 360;
  const H = 250;
  const R = 92;
  const pos = s.nodes.map((_, i) => {
    const a = (2 * Math.PI * i) / s.nodes.length - Math.PI / 2;
    return { x: W / 2 + R * 1.45 * Math.cos(a), y: H / 2 + R * Math.sin(a) };
  });
  const tree = new Set(s.treeEdge.filter((e): e is number => e !== null));
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Weighted graph" className="max-w-full" style={{ width: W }}>
        {s.edges.map((e, i) => {
          const a = pos[e.u];
          const b = pos[e.v];
          const active = s.relaxing?.edge === i;
          return (
            <g key={i}>
              <line
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={active ? "hsl(var(--accent))" : tree.has(i) ? "rgb(16 185 129)" : "hsl(var(--border))"}
                strokeWidth={active || tree.has(i) ? 3 : 1.5}
                strokeDasharray={active && !s.relaxing?.improved ? "5 4" : undefined}
              />
              <text x={(a.x + b.x) / 2} y={(a.y + b.y) / 2 - 4} textAnchor="middle" fontSize="11" fill="hsl(var(--fg))" stroke="hsl(var(--card))" strokeWidth="3" paintOrder="stroke">
                {e.w}
              </text>
            </g>
          );
        })}
        {s.nodes.map((name, i) => (
          <g key={name}>
            <circle
              cx={pos[i].x}
              cy={pos[i].y}
              r={17}
              fill={s.done[i] ? "rgb(16 185 129 / 0.25)" : "hsl(var(--card))"}
              stroke={s.current === i ? "hsl(var(--accent))" : s.done[i] ? "rgb(16 185 129)" : "hsl(var(--border))"}
              strokeWidth={s.current === i ? 4 : 2}
            />
            <text x={pos[i].x} y={pos[i].y - 1} textAnchor="middle" fontSize="12" fontWeight="700" fill="hsl(var(--fg))">
              {name}
            </text>
            <text x={pos[i].x} y={pos[i].y + 11} textAnchor="middle" fontSize="10" fill="hsl(var(--muted-fg))">
              {s.dist[i] === null ? "∞" : s.dist[i]}
            </text>
          </g>
        ))}
      </svg>
      <p className="text-xs text-muted-fg">Number inside a node = best known distance (∞ = unknown). Filled green = final. Thick edges = shortest-path tree so far. Dashed = tried, no improvement.</p>
      <p className="mt-1 text-sm" aria-label="Heap">
        Heap (smallest first):{" "}
        <span className="font-mono">{s.heap.length ? s.heap.map(([d, v]) => `(${d},${s.nodes[v]})`).join(" ") : "empty"}</span>
      </p>
      <p className="text-sm" aria-label="Distances">
        Distances: <span className="font-mono">{s.nodes.map((n, i) => `${n}=${s.dist[i] ?? "∞"}`).join("  ")}</span>
      </p>
    </div>
  );
}

/** Union-find as a forest: roots have a heavier outline and show their set size; highlighted nodes are on the path being walked. */
function DsuRender({ state: s }: { state: DsuFrame }) {
  const n = s.parent.length;
  const kids: number[][] = Array.from({ length: n }, () => []);
  s.parent.forEach((p, i) => p !== i && kids[p].push(i));
  const x: number[] = Array(n).fill(0);
  const d: number[] = Array(n).fill(0);
  let leaf = 0;
  const place = (v: number, depth: number): void => {
    d[v] = depth;
    if (kids[v].length === 0) x[v] = leaf++;
    else {
      kids[v].forEach((c) => place(c, depth + 1));
      x[v] = kids[v].reduce((sum, c) => sum + x[c], 0) / kids[v].length;
    }
  };
  s.parent.forEach((p, i) => p === i && place(i, 0));
  const gap = 38;
  const maxD = Math.max(...d);
  const W = Math.max(leaf, 1) * gap + 8;
  const H = (maxD + 1) * 54 + 24;
  const cx = (v: number) => 4 + gap / 2 + x[v] * gap;
  const cy = (v: number) => 20 + d[v] * 54;
  const act = new Set(s.active);
  return (
    <div>
      <p className="mb-1 text-sm">
        Operation: <b className="font-mono">{s.op}</b>
      </p>
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Union-find forest" style={{ width: W, minWidth: W }}>
          {s.parent.map((p, i) => p !== i && <line key={`e${i}`} x1={cx(p)} y1={cy(p)} x2={cx(i)} y2={cy(i)} stroke="hsl(var(--border))" strokeWidth={2} />)}
          {s.parent.map((p, i) => (
            <g key={i}>
              <circle
                cx={cx(i)}
                cy={cy(i)}
                r={15}
                fill={s.root === i ? "rgb(16 185 129 / 0.25)" : act.has(i) ? "hsl(var(--accent) / 0.2)" : "hsl(var(--card))"}
                stroke={act.has(i) ? "hsl(var(--accent))" : p === i ? "hsl(var(--fg))" : "hsl(var(--border))"}
                strokeWidth={p === i || act.has(i) ? 3 : 1.5}
              />
              <text x={cx(i)} y={cy(i) + 4} textAnchor="middle" fontSize="12" fontWeight="700" fill="hsl(var(--fg))">
                {i}
              </text>
              {p === i && (
                <text x={cx(i) + 18} y={cy(i) - 12} fontSize="9" fill="hsl(var(--muted-fg))">
                  size {s.size[i]}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>
      <p className="text-xs text-muted-fg">Thick dark outline = root (with its set size). Blue outline = on the path being walked. Green fill = the root just found.</p>
      <p className="text-sm" aria-label="Parent array">
        parent = <span className="font-mono">[{s.parent.join(", ")}]</span>
      </p>
    </div>
  );
}

export const VISUALIZERS = {
  "binary-search": {
    title: "Binary search",
    pseudocode: BINARY_SEARCH_CODE,
    defaultInput: "2 5 8 12 16 23 38 56 72 91\n23",
    inputHelp: "Line 1: numbers (sorted for you). Line 2: target.",
    generate: binarySearchSteps,
    Render: BinarySearchRender,
  } satisfies VisualizerDef<BSState>,
  "bubble-sort": {
    title: "Bubble sort",
    pseudocode: BUBBLE_SORT_CODE,
    defaultInput: "5 1 4 2 8 3",
    inputHelp: "Numbers separated by spaces (max 16).",
    generate: bubbleSortSteps,
    Render: SortRender,
  } satisfies VisualizerDef<SortState>,
  "two-pointers": {
    title: "Two pointers: pair with a given sum",
    pseudocode: TWO_POINTERS_CODE,
    defaultInput: "1 2 4 7 11 15 19\n18",
    inputHelp: "Line 1: numbers (sorted for you). Line 2: target sum.",
    generate: twoPointersSteps,
    Render: TwoPointersRender,
  } satisfies VisualizerDef<TwoPtrState>,
  "sliding-window": {
    title: "Sliding window: maximum sum of k consecutive",
    pseudocode: SLIDING_WINDOW_CODE,
    defaultInput: "2 1 5 1 3 2 9 1\n3",
    inputHelp: "Line 1: numbers. Line 2: window size k.",
    generate: slidingWindowSteps,
    Render: WindowRender,
  } satisfies VisualizerDef<WindowState>,
  "insertion-sort": {
    title: "Insertion sort",
    pseudocode: INSERTION_SORT_CODE,
    defaultInput: "5 2 4 6 1 3",
    inputHelp: "Numbers separated by spaces (max 16).",
    generate: insertionSortSteps,
    Render: SortFrameRender,
  } satisfies VisualizerDef<SortFrame>,
  "merge-sort": {
    title: "Merge sort",
    pseudocode: MERGE_SORT_CODE,
    defaultInput: "38 27 43 3 9 82 10",
    inputHelp: "Numbers separated by spaces (max 16).",
    generate: mergeSortSteps,
    Render: SortFrameRender,
  } satisfies VisualizerDef<SortFrame>,
  "quick-sort": {
    title: "Quick sort",
    pseudocode: QUICK_SORT_CODE,
    defaultInput: "8 3 7 1 9 2 6",
    inputHelp: "Numbers separated by spaces (max 16).",
    generate: quickSortSteps,
    Render: SortFrameRender,
  } satisfies VisualizerDef<SortFrame>,
  "bfs-grid": {
    title: "BFS on a grid",
    pseudocode: BFS_GRID_CODE,
    defaultInput: DEFAULT_GRID,
    inputHelp: "A grid of . (open), # (wall), S (start), E (end); up to 10 rows and 14 columns.",
    generate: bfsGridSteps,
    Render: GridRender,
  } satisfies VisualizerDef<GridFrame>,
  "dfs-grid": {
    title: "DFS on a grid",
    pseudocode: DFS_GRID_CODE,
    defaultInput: DEFAULT_GRID,
    inputHelp: "A grid of . (open), # (wall), S (start), E (end); up to 10 rows and 14 columns.",
    generate: dfsGridSteps,
    Render: GridRender,
  } satisfies VisualizerDef<GridFrame>,
  dijkstra: {
    title: "Dijkstra's shortest paths",
    pseudocode: DIJKSTRA_CODE,
    defaultInput: DEFAULT_GRAPH,
    inputHelp: "Line 1: the source node. Then one edge per line as: u v weight (undirected, weight 0 to 99, up to 8 nodes and 16 edges).",
    generate: dijkstraSteps,
    Render: DijkstraRender,
  } satisfies VisualizerDef<DijkstraFrame>,
  dsu: {
    title: "Union-find (disjoint set union)",
    pseudocode: DSU_CODE,
    defaultInput: DEFAULT_DSU,
    inputHelp: "Line 1: n elements (1 to 10). Then one operation per line: union a b, or find a (elements are 0 to n-1, up to 20 operations).",
    generate: dsuSteps,
    Render: DsuRender,
  } satisfies VisualizerDef<DsuFrame>,
};

export type VisualizerName = keyof typeof VISUALIZERS;

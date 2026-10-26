import type { Step } from "./types";

export type Cell = [row: number, col: number];

/** Per-cell search status: not reached yet, waiting in the queue/stack, or already expanded. */
export type CellStatus = "unseen" | "frontier" | "done";

export interface GridFrame {
  /** Static map: "#" wall, "." open, "S" start, "E" end. */
  map: string[];
  status: CellStatus[][];
  /** Steps from S (BFS) or length of the discovered route to the cell (DFS); null while unseen. */
  dist: (number | null)[][];
  current: Cell | null;
  /** The pending cells in pop order: front of the queue first, or top of the stack first. */
  frontier: Cell[];
  frontierKind: "queue" | "stack";
  /** The route from S to E, set once E is popped. */
  path: Cell[];
}

export const MAX_ROWS = 10;
export const MAX_COLS = 14;

export function parseGrid(input: string): { map: string[]; start: Cell; end: Cell } {
  const map = input
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  if (map.length === 0) throw new Error("Enter a grid using . (open), # (wall), S (start) and E (end).");
  if (map.length > MAX_ROWS) throw new Error(`Use at most ${MAX_ROWS} rows.`);
  const width = map[0].length;
  if (width > MAX_COLS) throw new Error(`Use at most ${MAX_COLS} columns.`);
  let start: Cell | null = null;
  let end: Cell | null = null;
  map.forEach((row, r) => {
    if (row.length !== width) throw new Error("Every row must have the same length.");
    for (let c = 0; c < width; c++) {
      const ch = row[c];
      if (ch !== "." && ch !== "#" && ch !== "S" && ch !== "E") throw new Error(`Unknown character "${ch}": use . # S E only.`);
      if (ch === "S") {
        if (start) throw new Error("Only one S is allowed.");
        start = [r, c];
      }
      if (ch === "E") {
        if (end) throw new Error("Only one E is allowed.");
        end = [r, c];
      }
    }
  });
  if (!start) throw new Error("The grid needs one S (start).");
  if (!end) throw new Error("The grid needs one E (end).");
  return { map, start, end };
}

const DIRS: Cell[] = [
  [-1, 0],
  [0, 1],
  [1, 0],
  [0, -1],
];
const name = (c: Cell) => `(${c[0]},${c[1]})`;

export const BFS_GRID_CODE = [
  "queue = [S]; dist[S] = 0",
  "while queue is not empty:",
  "    cell = queue.pop_front()",
  "    if cell == E: return dist[cell]",
  "    for each open, unseen neighbour nb of cell:",
  "        dist[nb] = dist[cell] + 1; queue.push_back(nb)",
  "return -1   # E is unreachable",
];

export const DFS_GRID_CODE = [
  "stack = [S]; depth[S] = 0",
  "while stack is not empty:",
  "    cell = stack.pop()",
  "    if cell == E: return the route found",
  "    for each open, unseen neighbour nb of cell:",
  "        depth[nb] = depth[cell] + 1; stack.push(nb)",
  "return -1   # E is unreachable",
];

function run(input: string, kind: "queue" | "stack"): Step<GridFrame>[] {
  const { map, start, end } = parseGrid(input);
  const R = map.length;
  const C = map[0].length;
  const status: CellStatus[][] = map.map((row) => Array.from(row, () => "unseen" as CellStatus));
  const dist: (number | null)[][] = map.map((row) => Array.from(row, () => null));
  const parent: (Cell | null)[][] = map.map((row) => Array.from(row, () => null));
  const frontier: Cell[] = [start];
  status[start[0]][start[1]] = "frontier";
  dist[start[0]][start[1]] = 0;

  const steps: Step<GridFrame>[] = [];
  const snap = (line: number, note: string, current: Cell | null, path: Cell[] = []) => {
    const order = kind === "queue" ? frontier : [...frontier].reverse();
    steps.push({
      line,
      note,
      state: {
        map,
        status: status.map((row) => [...row]),
        dist: dist.map((row) => [...row]),
        current,
        frontier: order.map((c) => [c[0], c[1]] as Cell),
        frontierKind: kind,
        path,
      },
    });
  };
  const noun = kind === "queue" ? "queue" : "stack";
  snap(0, `Put the start ${name(start)} in the ${noun}.`, null);

  while (frontier.length > 0) {
    const cell = kind === "queue" ? frontier.shift()! : frontier.pop()!;
    const [r, c] = cell;
    status[r][c] = "done";
    snap(2, `Take ${name(cell)} from the ${kind === "queue" ? "front of the queue" : "top of the stack"}.`, cell);
    if (r === end[0] && c === end[1]) {
      const path: Cell[] = [];
      for (let p: Cell | null = cell; p; p = parent[p[0]][p[1]]) path.push(p);
      path.reverse();
      const len = path.length - 1;
      snap(
        3,
        kind === "queue"
          ? `Reached E. BFS expands cells in order of distance, so the first time it pops E the route of ${len} steps is a shortest one.`
          : `Reached E by a route of ${len} steps. DFS commits to one direction first, so this route is valid but not necessarily the shortest.`,
        cell,
        path,
      );
      return steps;
    }
    snap(3, `${name(cell)} is not E, so look at its neighbours.`, cell);
    let added = 0;
    for (const [dr, dc] of DIRS) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nc < 0 || nr >= R || nc >= C || map[nr][nc] === "#" || status[nr][nc] !== "unseen") continue;
      status[nr][nc] = "frontier";
      dist[nr][nc] = (dist[r][c] ?? 0) + 1;
      parent[nr][nc] = cell;
      frontier.push([nr, nc]);
      added++;
      snap(5, `${name([nr, nc])} is open and new: ${kind === "queue" ? "distance" : "depth"} ${dist[nr][nc]}, push it on the ${noun}.`, cell);
    }
    if (added === 0) snap(4, `No open, unseen neighbours from ${name(cell)}: a dead end.`, cell);
  }
  snap(6, `The ${noun} is empty and E was never reached: it is unreachable from S.`, null);
  return steps;
}

export const bfsGridSteps = (input: string) => run(input, "queue");
export const dfsGridSteps = (input: string) => run(input, "stack");

export const DEFAULT_GRID = ["S..#....", ".#.#.##.", ".#...#..", ".####.#.", "......#E"].join("\n");

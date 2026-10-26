import type { Step } from "./types";

export interface DsuFrame {
  /** parent[i] === i means i is a root. */
  parent: number[];
  size: number[];
  /** Nodes highlighted this step (the path being walked or compressed). */
  active: number[];
  /** The root just discovered, if any. */
  root: number | null;
  /** The operation being run, e.g. "union(1, 4)". */
  op: string;
}

export const MAX_N = 10;
export const MAX_OPS = 20;
export const DEFAULT_DSU = ["8", "union 0 1", "union 2 3", "union 0 2", "union 4 5", "union 6 7", "union 4 6", "union 0 4", "find 3"].join("\n");

export type DsuOp = { kind: "union"; a: number; b: number } | { kind: "find"; a: number };

export function parseDsu(input: string): { n: number; ops: DsuOp[] } {
  const lines = input
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  if (lines.length === 0 || !/^\d+$/.test(lines[0])) throw new Error("Line 1 is the number of elements n (1 to 10); then one operation per line.");
  const n = Number(lines[0]);
  if (n < 1 || n > MAX_N) throw new Error(`n must be between 1 and ${MAX_N}.`);
  const rest = lines.slice(1);
  if (rest.length > MAX_OPS) throw new Error(`Use at most ${MAX_OPS} operations.`);
  const node = (s: string, line: string) => {
    if (!/^\d+$/.test(s) || Number(s) >= n) throw new Error(`In "${line}", elements are numbered 0 to ${n - 1}.`);
    return Number(s);
  };
  const ops = rest.map((line): DsuOp => {
    const p = line.split(/\s+/);
    if (p[0] === "union" && p.length === 3) return { kind: "union", a: node(p[1], line), b: node(p[2], line) };
    if (p[0] === "find" && p.length === 2) return { kind: "find", a: node(p[1], line) };
    throw new Error(`Unknown operation "${line}": use "union a b" or "find a".`);
  });
  return { n, ops };
}

export const DSU_CODE = [
  "find(x):",
  "    if parent[x] != x:",
  "        parent[x] = find(parent[x])   # path compression",
  "    return parent[x]",
  "union(a, b):",
  "    ra = find(a); rb = find(b)",
  "    if ra == rb: return               # already together",
  "    if size[ra] < size[rb]: swap(ra, rb)",
  "    parent[rb] = ra; size[ra] += size[rb]",
];

export function dsuSteps(input: string): Step<DsuFrame>[] {
  const { n, ops } = parseDsu(input);
  const parent = Array.from({ length: n }, (_, i) => i);
  const size: number[] = Array(n).fill(1);
  const steps: Step<DsuFrame>[] = [];
  const snap = (line: number, note: string, op: string, active: number[] = [], root: number | null = null) =>
    steps.push({ line, note, state: { parent: [...parent], size: [...size], active, root, op } });

  /** Runs find(x), emitting the walk up and then the compression, and returns the root. */
  const find = (x: number, op: string): number => {
    const path = [x];
    while (parent[path[path.length - 1]] !== path[path.length - 1]) path.push(parent[path[path.length - 1]]);
    const root = path[path.length - 1];
    for (let i = 0; i < path.length - 1; i++) snap(1, `parent[${path[i]}] = ${parent[path[i]]}, which is not ${path[i]} itself, so keep climbing.`, op, path.slice(0, i + 1));
    snap(1, `${root} is its own parent: it is the root of this set.`, op, path, root);
    const toFix = path.slice(0, -1).filter((v) => parent[v] !== root);
    if (toFix.length === 0) snap(3, `The path is already as short as it can be; find returns ${root}.`, op, path, root);
    else {
      for (const v of toFix) {
        parent[v] = root;
        snap(2, `Path compression: point ${v} directly at the root ${root}.`, op, path, root);
      }
      snap(3, `find returns ${root}. Every node on the path now points straight at it, so later finds are faster.`, op, path, root);
    }
    return root;
  };

  snap(0, `${n} elements, each in its own set (every node is its own root).`, "start");
  for (const o of ops) {
    if (o.kind === "find") {
      find(o.a, `find(${o.a})`);
      continue;
    }
    const op = `union(${o.a}, ${o.b})`;
    snap(5, `Run ${op}: first find the root of each element.`, op, [o.a, o.b]);
    const ra = find(o.a, op);
    const rb = find(o.b, op);
    if (ra === rb) {
      snap(6, `${o.a} and ${o.b} share the root ${ra}: already in the same set, nothing to do.`, op, [ra], ra);
      continue;
    }
    const [big, small] = size[ra] < size[rb] ? [rb, ra] : [ra, rb];
    snap(7, `Sizes: set of ${ra} has ${size[ra]}, set of ${rb} has ${size[rb]}. Attach the smaller tree (root ${small}) under the larger (root ${big}) so trees stay shallow.`, op, [big, small]);
    parent[small] = big;
    size[big] += size[small];
    snap(8, `parent[${small}] = ${big}; the merged set has ${size[big]} elements.`, op, [big, small], big);
  }
  const sets = parent.filter((p, i) => p === i).length;
  snap(0, `Done: ${sets} set${sets === 1 ? "" : "s"} remain.`, "done");
  return steps;
}

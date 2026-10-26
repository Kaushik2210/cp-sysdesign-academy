import type { Step } from "./types";

/** A segment tree stored heap-style: node k has children 2k and 2k+1; node 1 is the root. Unused slots are null. */
export interface SegFrame {
  values: number[];
  lo: (number | null)[];
  hi: (number | null)[];
  sum: (number | null)[];
  /** Node being examined now. */
  visiting: number | null;
  /** Nodes whose whole range lies inside the query and so were added to the answer. */
  used: number[];
  /** Nodes skipped because their range does not overlap the query. */
  skipped: number[];
  /** Nodes recomputed during an update. */
  updated: number[];
  /** Running answer for a query, else null. */
  answer: number | null;
  op: string;
}

export const MAX_VALUES = 8;
export const MAX_OPS = 12;
export const DEFAULT_SEGTREE = ["5 3 8 6 2 7 4 1", "query 2 6", "update 3 10", "query 0 4", "query 5 5"].join("\n");

export type SegOp = { kind: "query"; l: number; r: number } | { kind: "update"; i: number; v: number };

export function parseSegtree(input: string): { values: number[]; ops: SegOp[] } {
  const lines = input
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  if (lines.length === 0) throw new Error("Line 1 is the array (up to 8 integers); then one operation per line.");
  const first = lines[0].split(/\s+/);
  if (!first.every((t) => /^-?\d+$/.test(t))) throw new Error("Line 1 must be whole numbers separated by spaces.");
  if (first.length > MAX_VALUES) throw new Error(`Use at most ${MAX_VALUES} numbers.`);
  const values = first.map(Number);
  if (values.some((v) => Math.abs(v) > 999)) throw new Error("Keep numbers between -999 and 999.");
  const n = values.length;
  const rest = lines.slice(1);
  if (rest.length > MAX_OPS) throw new Error(`Use at most ${MAX_OPS} operations.`);
  const idx = (s: string, line: string) => {
    if (!/^\d+$/.test(s) || Number(s) >= n) throw new Error(`In "${line}", positions are 0 to ${n - 1}.`);
    return Number(s);
  };
  const ops = rest.map((line): SegOp => {
    const p = line.split(/\s+/);
    if (p[0] === "query" && p.length === 3) {
      const l = idx(p[1], line);
      const r = idx(p[2], line);
      if (l > r) throw new Error(`In "${line}", the left end must not be after the right end.`);
      return { kind: "query", l, r };
    }
    if (p[0] === "update" && p.length === 3) {
      if (!/^-?\d+$/.test(p[2]) || Math.abs(Number(p[2])) > 999) throw new Error(`In "${line}", the new value must be a whole number from -999 to 999.`);
      return { kind: "update", i: idx(p[1], line), v: Number(p[2]) };
    }
    throw new Error(`Unknown operation "${line}": use "query l r" (inclusive range sum) or "update i value".`);
  });
  return { values, ops };
}

export const SEGTREE_CODE = [
  "query(node, l, r, ql, qr):          # sum of a[ql..qr]",
  "    if qr < l or r < ql: return 0   # no overlap: skip",
  "    if ql <= l and r <= qr: return sum[node]   # fully inside: use it",
  "    mid = (l + r) / 2               # partial overlap: split",
  "    return query(left) + query(right)",
  "update(node, l, r, i, v):           # a[i] = v",
  "    if l == r: sum[node] = v; return",
  "    recurse into the half that contains i",
  "    sum[node] = sum[left] + sum[right]",
];

export function segtreeSteps(input: string): Step<SegFrame>[] {
  const { values, ops } = parseSegtree(input);
  const n = values.length;
  const size = 4 * n;
  const lo: (number | null)[] = Array(size).fill(null);
  const hi: (number | null)[] = Array(size).fill(null);
  const sum: (number | null)[] = Array(size).fill(null);
  const build = (k: number, l: number, r: number): void => {
    lo[k] = l;
    hi[k] = r;
    if (l === r) {
      sum[k] = values[l];
      return;
    }
    const m = (l + r) >> 1;
    build(2 * k, l, m);
    build(2 * k + 1, m + 1, r);
    sum[k] = sum[2 * k]! + sum[2 * k + 1]!;
  };
  build(1, 0, n - 1);

  const steps: Step<SegFrame>[] = [];
  const range = (k: number) => (lo[k] === hi[k] ? `[${lo[k]}]` : `[${lo[k]}..${hi[k]}]`);
  const snap = (line: number, note: string, op: string, visiting: number | null, extra: Partial<Pick<SegFrame, "used" | "skipped" | "updated" | "answer">> = {}) =>
    steps.push({
      line,
      note,
      state: { values: [...values], lo: [...lo], hi: [...hi], sum: [...sum], visiting, used: extra.used ?? [], skipped: extra.skipped ?? [], updated: extra.updated ?? [], answer: extra.answer ?? null, op },
    });

  snap(8, `Built bottom-up: each leaf holds one value and every other node holds the sum of its two children. The root ${range(1)} holds ${sum[1]}.`, "build", null);

  for (const o of ops) {
    if (o.kind === "query") {
      const op = `query(${o.l}, ${o.r})`;
      const used: number[] = [];
      const skipped: number[] = [];
      let total = 0;
      const go = (k: number): void => {
        const l = lo[k]!;
        const r = hi[k]!;
        if (o.r < l || r < o.l) {
          skipped.push(k);
          snap(1, `Node ${range(k)} does not overlap [${o.l}..${o.r}]: skip it.`, op, k, { used: [...used], skipped: [...skipped], answer: total });
          return;
        }
        if (o.l <= l && r <= o.r) {
          used.push(k);
          total += sum[k]!;
          snap(2, `Node ${range(k)} lies fully inside [${o.l}..${o.r}]: add its stored sum ${sum[k]}. Running total ${total}.`, op, k, { used: [...used], skipped: [...skipped], answer: total });
          return;
        }
        snap(3, `Node ${range(k)} only partly overlaps [${o.l}..${o.r}]: split it and ask both children.`, op, k, { used: [...used], skipped: [...skipped], answer: total });
        go(2 * k);
        go(2 * k + 1);
      };
      go(1);
      snap(4, `${op} = ${total}, assembled from ${used.length} stored node${used.length === 1 ? "" : "s"} instead of ${o.r - o.l + 1} elements.`, op, null, { used: [...used], skipped: [...skipped], answer: total });
    } else {
      const op = `update(${o.i}, ${o.v})`;
      const path: number[] = [];
      const down = (k: number): void => {
        path.push(k);
        snap(7, `Node ${range(k)} contains position ${o.i}: go into the half that holds it.`, op, k, { updated: [] });
        if (lo[k] === hi[k]) return;
        down(o.i <= ((lo[k]! + hi[k]!) >> 1) ? 2 * k : 2 * k + 1);
      };
      down(1);
      const leaf = path[path.length - 1];
      values[o.i] = o.v;
      sum[leaf] = o.v;
      snap(6, `Leaf ${range(leaf)} is set to ${o.v}.`, op, leaf, { updated: [leaf] });
      const done = [leaf];
      for (let i = path.length - 2; i >= 0; i--) {
        const k = path[i];
        sum[k] = sum[2 * k]! + sum[2 * k + 1]!;
        done.push(k);
        snap(8, `Recompute ${range(k)} = ${sum[2 * k]} + ${sum[2 * k + 1]} = ${sum[k]}.`, op, k, { updated: [...done] });
      }
    }
  }
  snap(8, "All operations done.", "done", null);
  return steps;
}
